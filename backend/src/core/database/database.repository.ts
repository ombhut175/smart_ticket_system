import { Injectable } from '@nestjs/common';
import { eq, and, or, desc, asc, count, sql, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
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
import { USER_ROLES } from 'src/common/helpers/string-const';

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

  /**
   * Fetch active users by role with their skills (if any).
   * Returns a flattened list where each row may contain a user and optionally a skill record.
   */
  async findActiveUsersWithSkillsByRole(role: string): Promise<{
    id: string;
    email: string;
    skillName?: string | null;
  }[]> {
    const db = this.drizzleService.getDb();
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        skillName: userSkills.skillName,
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .where(and(eq(users.role, role), eq(users.isActive, true)))
      .orderBy(asc(users.email));

    return rows.map(r => ({ id: r.id, email: r.email, skillName: r.skillName ?? null }));
  }

  /**
   * Find a single active admin user (for fallback assignment).
   * Matches the original Supabase query that selected 'id, email' with limit(1).single()
   */
  async findSingleActiveAdmin(): Promise<{ id: string; email: string } | null> {
    const db = this.drizzleService.getDb();
    const [admin] = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(and(eq(users.role, 'admin'), eq(users.isActive, true)))
      .limit(1);
    
    return admin || null;
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

  /**
   * Update user's active status and return with snake_case for compatibility
   */
  async updateUserActiveStatus(id: string, isActive: boolean): Promise<any> {
    const user = await this.updateUser(id, { isActive });
    if (!user) return null;
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Update user's role and return with snake_case for compatibility
   */
  async updateUserRoleCompat(id: string, role: string): Promise<any> {
    const user = await this.updateUser(id, { role });
    if (!user) return null;
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Update user and return with snake_case fields for backward compatibility
   */
  async updateUserProfile(id: string, profileData: any): Promise<any> {
    // Convert snake_case to camelCase for Drizzle
    const updateData: Partial<NewUser> = {};
    if (profileData.first_name !== undefined) updateData.firstName = profileData.first_name;
    if (profileData.last_name !== undefined) updateData.lastName = profileData.last_name;
    if (profileData.email !== undefined) updateData.email = profileData.email;
    if (profileData.role !== undefined) updateData.role = profileData.role;
    if (profileData.is_active !== undefined) updateData.isActive = profileData.is_active;
    
    const user = await this.updateUser(id, updateData);
    if (!user) return null;
    
    // Convert back to snake_case for API compatibility
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(id: string): Promise<any> {
    const user = await this.updateUser(id, { lastLoginAt: new Date() });
    if (!user) return null;
    
    return {
      ...user,
      first_name: user.firstName,
      last_name: user.lastName,
      is_active: user.isActive,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
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

  /**
   * Create ticket with snake_case input/output for backward compatibility
   */
  async createTicketCompat(title: string, description: string, createdBy: string, status: string, priority: string): Promise<any> {
    const ticket = await this.createTicket({
      title,
      description,
      createdBy,
      status,
      priority,
    });
    
    return {
      ...ticket,
      created_by: ticket.createdBy,
      assigned_to: ticket.assignedTo,
      helpful_notes: ticket.helpfulNotes,
      related_skills: ticket.relatedSkills,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
    };
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

  /**
   * Fetch user's tickets with optional filters
   */
  async findTicketsByUserWithFilters(
    userId: string,
    limit = 20,
    offset = 0,
    filters?: { status?: string; priority?: string }
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const db = this.drizzleService.getDb();
    const whereClauses = [eq(tickets.createdBy, userId)] as any[];
    if (filters?.status) whereClauses.push(eq(tickets.status, filters.status));
    if (filters?.priority) whereClauses.push(eq(tickets.priority, filters.priority));

    const ticketsResult = await db
      .select()
      .from(tickets)
      .where(and(...whereClauses))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));

    const [{ total }] = await db
      .select({ total: count() })
      .from(tickets)
      .where(and(...whereClauses));

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

  /**
   * Fetch tickets with optional filters for moderator view
   */
  async findAllTicketsWithFilters(
    limit = 20,
    offset = 0,
    filters?: { status?: string; priority?: string; assigned_to?: string }
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const db = this.drizzleService.getDb();
    const whereClauses = [] as any[];
    if (filters?.status) whereClauses.push(eq(tickets.status, filters.status));
    if (filters?.priority) whereClauses.push(eq(tickets.priority, filters.priority));
    if (filters?.assigned_to) whereClauses.push(eq(tickets.assignedTo, filters.assigned_to));

    const assignee = alias(users, 'assignee');
    const creator = alias(users, 'creator');

    const rows = await db
      .select({ ticket: tickets, assigneeEmail: assignee.email, creatorEmail: creator.email })
      .from(tickets)
      .leftJoin(assignee, eq(tickets.assignedTo, assignee.id))
      .leftJoin(creator, eq(tickets.createdBy, creator.id))
      .where(whereClauses.length ? and(...whereClauses) : undefined as any)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));

    const [{ total }] = await db
      .select({ total: count() })
      .from(tickets)
      .where(whereClauses.length ? and(...whereClauses) : undefined as any);

    const ticketsResult = rows.map((r) => ({ ...r.ticket, __assigneeEmail: r.assigneeEmail, __creatorEmail: r.creatorEmail } as any));

    return { tickets: ticketsResult as any, total: Number(total) };
  }

  /**
   * Fetch basic user records by list of ids
   */
  async findUsersByIds(ids: string[]): Promise<Array<{ id: string; email: string }>> {
    if (!ids || ids.length === 0) return [];
    const db = this.drizzleService.getDb();
    const rows = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(inArray(users.id, ids));
    return rows;
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

  /**
   * Add user skill with snake_case input/output for backward compatibility
   */
  async addUserSkillCompat(userId: string, skillName: string, proficiencyLevel: string): Promise<any> {
    const skill = await this.addUserSkill({
      userId,
      skillName,
      proficiencyLevel,
    });
    
    return {
      ...skill,
      user_id: skill.userId,
      skill_name: skill.skillName,
      proficiency_level: skill.proficiencyLevel,
      created_at: skill.createdAt,
    };
  }

  /**
   * Add multiple user skills in batch
   */
  async addUserSkillsBatch(userId: string, skills: Array<{ skill_name: string; proficiency_level: string }>): Promise<any[]> {
    if (!skills || skills.length === 0) return [];
    
    const skillData = skills.map(s => ({
      userId,
      skillName: s.skill_name,
      proficiencyLevel: s.proficiency_level,
    }));
    
    const inserted = await this.drizzleService.getDb()
      .insert(userSkills)
      .values(skillData)
      .returning();
    
    return inserted.map(s => ({
      ...s,
      user_id: s.userId,
      skill_name: s.skillName,
      proficiency_level: s.proficiencyLevel,
      created_at: s.createdAt,
    }));
  }

  async findUserSkills(userId: string): Promise<UserSkill[]> {
    return await this.drizzleService.getDb()
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }

  /**
   * Find all moderators with their skills and return snake_case fields/relations
   */
  async findModeratorsWithSkillsCompat(): Promise<any[]> {
    const db = this.drizzleService.getDb();
    const rows = await db
      .select({ 
        user: users, 
        skill: {
          id: userSkills.id,
          userId: userSkills.userId,
          skillName: userSkills.skillName,
          proficiencyLevel: userSkills.proficiencyLevel,
          createdAt: userSkills.createdAt,
        }
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .where(eq(users.role, USER_ROLES.MODERATOR))
      .orderBy(asc(users.firstName), asc(users.lastName));

    const byUser: Record<string, any> = {};
    for (const r of rows) {
      const u = r.user;
      if (!byUser[u.id]) {
        byUser[u.id] = {
          ...u,
          first_name: u.firstName,
          last_name: u.lastName,
          is_active: u.isActive,
          last_login_at: u.lastLoginAt,
          created_at: u.createdAt,
          updated_at: u.updatedAt,
          user_skills: [],
        };
      }
      if (r.skill && r.skill.id) {
        byUser[u.id].user_skills.push({
          ...r.skill,
          user_id: r.skill.userId,
          skill_name: r.skill.skillName,
          proficiency_level: r.skill.proficiencyLevel,
          created_at: r.skill.createdAt,
        });
      }
    }
    return Object.values(byUser);
  }

  /**
   * Find a single moderator with skills by id and return snake_case fields/relations
   */
  async findModeratorWithSkillsByIdCompat(id: string): Promise<any | null> {
    const db = this.drizzleService.getDb();
    const rows = await db
      .select({ 
        user: users, 
        skill: {
          id: userSkills.id,
          userId: userSkills.userId,
          skillName: userSkills.skillName,
          proficiencyLevel: userSkills.proficiencyLevel,
          createdAt: userSkills.createdAt,
        }
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .where(and(eq(users.id, id), eq(users.role, USER_ROLES.MODERATOR)));
    if (!rows || rows.length === 0) return null;
    const u = rows[0].user;
    return {
      ...u,
      first_name: u.firstName,
      last_name: u.lastName,
      is_active: u.isActive,
      last_login_at: u.lastLoginAt,
      created_at: u.createdAt,
      updated_at: u.updatedAt,
      user_skills: rows
        .filter((r) => r.skill && r.skill.id)
        .map((s) => ({
          ...s.skill!,
          user_id: s.skill!.userId,
          skill_name: s.skill!.skillName,
          proficiency_level: s.skill!.proficiencyLevel,
          created_at: s.skill!.createdAt,
        })),
    };
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
    const db = this.drizzleService.getDb();
    return await db
      .select({
        user: users,
        skill: {
          id: userSkills.id,
          userId: userSkills.userId,
          skillName: userSkills.skillName,
          proficiencyLevel: userSkills.proficiencyLevel,
          createdAt: userSkills.createdAt,
        },
      })
      .from(users)
      .leftJoin(userSkills, eq(users.id, userSkills.userId))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async findTicketsWithAssignees(): Promise<any[]> {
    const db = this.drizzleService.getDb();
    const assignee = alias(users, 'assignee');
    const creator = alias(users, 'creator');
    const rows = await db
      .select({ ticket: tickets, assigneeEmail: assignee.email, creatorEmail: creator.email })
      .from(tickets)
      .leftJoin(assignee, eq(tickets.assignedTo, assignee.id))
      .leftJoin(creator, eq(tickets.createdBy, creator.id))
      .orderBy(desc(tickets.createdAt));
    return rows;
  }
}
