import { Injectable } from '@nestjs/common';
import { eq, and, or, desc, asc, count, sql } from 'drizzle-orm';
import { DrizzleService } from './drizzle.client';
import { users, tickets, userSkills, ticketSkills } from './schema';
import type { 
  User, 
  NewUser, 
  Ticket, 
  NewTicket, 
  UserSkill, 
  NewUserSkill,
  TicketSkill,
  NewTicketSkill 
} from './schema';

@Injectable()
export class DatabaseRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  // Users operations
  async createUser(userData: NewUser): Promise<User> {
    const [user] = await this.drizzleService.getDb()
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    const [user] = await this.drizzleService.getDb()
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await this.drizzleService.getDb()
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user || null;
  }

  async updateUser(id: string, userData: Partial<NewUser>): Promise<User | null> {
    const [user] = await this.drizzleService.getDb()
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async findAllUsers(limit = 20, offset = 0): Promise<{ users: User[]; total: number }> {
    const usersResult = await this.drizzleService.getDb()
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    const [{ total }] = await this.drizzleService.getDb()
      .select({ total: count() })
      .from(users);

    return { users: usersResult, total: Number(total) };
  }

  // Tickets operations
  async createTicket(ticketData: NewTicket): Promise<Ticket> {
    const [ticket] = await this.drizzleService.getDb()
      .insert(tickets)
      .values(ticketData)
      .returning();
    return ticket;
  }

  async findTicketById(id: string): Promise<Ticket | null> {
    const [ticket] = await this.drizzleService.getDb()
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));
    return ticket || null;
  }

  async findTicketsByUser(userId: string, limit = 20, offset = 0): Promise<{ tickets: Ticket[]; total: number }> {
    const ticketsResult = await this.drizzleService.getDb()
      .select()
      .from(tickets)
      .where(eq(tickets.createdBy, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));

    const [{ total }] = await this.drizzleService.getDb()
      .select({ total: count() })
      .from(tickets)
      .where(eq(tickets.createdBy, userId));

    return { tickets: ticketsResult, total: Number(total) };
  }

  async findAllTickets(limit = 20, offset = 0): Promise<{ tickets: Ticket[]; total: number }> {
    const ticketsResult = await this.drizzleService.getDb()
      .select()
      .from(tickets)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));

    const [{ total }] = await this.drizzleService.getDb()
      .select({ total: count() })
      .from(tickets);

    return { tickets: ticketsResult, total: Number(total) };
  }

  async updateTicket(id: string, ticketData: Partial<NewTicket>): Promise<Ticket | null> {
    const [ticket] = await this.drizzleService.getDb()
      .update(tickets)
      .set({ ...ticketData, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket || null;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await this.drizzleService.getDb()
      .delete(tickets)
      .where(eq(tickets.id, id))
      .returning();
    return result.length > 0;
  }

  // User Skills operations
  async addUserSkill(skillData: NewUserSkill): Promise<UserSkill> {
    const [skill] = await this.drizzleService.getDb()
      .insert(userSkills)
      .values(skillData)
      .returning();
    return skill;
  }

  async findUserSkills(userId: string): Promise<UserSkill[]> {
    return await this.drizzleService.getDb()
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }

  // Ticket Skills operations
  async addTicketSkill(skillData: NewTicketSkill): Promise<TicketSkill> {
    const [skill] = await this.drizzleService.getDb()
      .insert(ticketSkills)
      .values(skillData)
      .returning();
    return skill;
  }

  async findTicketSkills(ticketId: string): Promise<TicketSkill[]> {
    return await this.drizzleService.getDb()
      .select()
      .from(ticketSkills)
      .where(eq(ticketSkills.ticketId, ticketId));
  }

  // Advanced queries
  async findUsersWithSkills(): Promise<any[]> {
    return await this.drizzleService.getDb()
      .select({
        user: users,
        skills: userSkills,
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async findTicketsWithAssignees(): Promise<any[]> {
    return await this.drizzleService.getDb()
      .select({
        ticket: tickets,
        assignee: users,
        creator: users,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.assignedTo, users.id))
      .leftJoin(users, eq(tickets.createdBy, users.id))
      .orderBy(desc(tickets.createdAt));
  }
}
