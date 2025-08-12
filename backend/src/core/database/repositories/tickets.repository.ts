import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { BaseRepository } from './base.repository';
import { tickets, users } from '../schema';
import type { NewTicket, Ticket } from '../schema';

@Injectable()
export class TicketsRepository extends BaseRepository {
  async createTicket(ticketData: NewTicket): Promise<Ticket> {
    const [ticket] = await this.db
      .insert(tickets)
      .values(ticketData)
      .returning();
    return ticket;
  }

  async createTicketCompat(
    title: string,
    description: string,
    createdBy: string,
    status: string,
    priority: string,
  ): Promise<any> {
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
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));
    return ticket || null;
  }

  async findTicketsByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const ticketsResult = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.createdBy, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(tickets)
      .where(eq(tickets.createdBy, userId));

    return { tickets: ticketsResult, total: Number(total) };
  }

  async findTicketsByUserWithFilters(
    userId: string,
    limit = 20,
    offset = 0,
    filters?: { status?: string; priority?: string },
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const whereClauses = [eq(tickets.createdBy, userId)] as any[];
    if (filters?.status) whereClauses.push(eq(tickets.status, filters.status));
    if (filters?.priority)
      whereClauses.push(eq(tickets.priority, filters.priority));

    const ticketsResult = await this.db
      .select()
      .from(tickets)
      .where(and(...whereClauses))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(tickets)
      .where(and(...whereClauses));

    return { tickets: ticketsResult, total: Number(total) };
  }

  async findAllTickets(
    limit = 20,
    offset = 0,
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const ticketsResult = await this.db
      .select()
      .from(tickets)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));
    const [{ total }] = await this.db.select({ total: count() }).from(tickets);
    return { tickets: ticketsResult, total: Number(total) };
  }

  async findAllTicketsWithFilters(
    limit = 20,
    offset = 0,
    filters?: { status?: string; priority?: string; assigned_to?: string },
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const whereClauses = [] as any[];
    if (filters?.status) whereClauses.push(eq(tickets.status, filters.status));
    if (filters?.priority)
      whereClauses.push(eq(tickets.priority, filters.priority));
    if (filters?.assigned_to)
      whereClauses.push(eq(tickets.assignedTo, filters.assigned_to));

    const assignee = alias(users, 'assignee');
    const creator = alias(users, 'creator');

    const rows = await this.db
      .select({
        ticket: tickets,
        assigneeEmail: assignee.email,
        creatorEmail: creator.email,
      })
      .from(tickets)
      .leftJoin(assignee, eq(tickets.assignedTo, assignee.id))
      .leftJoin(creator, eq(tickets.createdBy, creator.id))
      .where(
        whereClauses.length
          ? (and as any)(...whereClauses)
          : (undefined as any),
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt));

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(tickets)
      .where(
        whereClauses.length
          ? (and as any)(...whereClauses)
          : (undefined as any),
      );

    const ticketsResult = rows.map(
      (r) =>
        ({
          ...r.ticket,
          __assigneeEmail: r.assigneeEmail,
          __creatorEmail: r.creatorEmail,
        }) as any,
    );
    return { tickets: ticketsResult as any, total: Number(total) };
  }

  async updateTicket(
    id: string,
    ticketData: Partial<NewTicket>,
  ): Promise<Ticket | null> {
    const [ticket] = await this.db
      .update(tickets)
      .set({ ...ticketData, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket || null;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await this.db
      .delete(tickets)
      .where(eq(tickets.id, id))
      .returning();
    return result.length > 0;
  }

  async findTicketsWithAssignees(): Promise<any[]> {
    const assignee = alias(users, 'assignee');
    const creator = alias(users, 'creator');
    const rows = await this.db
      .select({
        ticket: tickets,
        assigneeEmail: assignee.email,
        creatorEmail: creator.email,
      })
      .from(tickets)
      .leftJoin(assignee, eq(tickets.assignedTo, assignee.id))
      .leftJoin(creator, eq(tickets.createdBy, creator.id))
      .orderBy(desc(tickets.createdAt));
    return rows;
  }
}
