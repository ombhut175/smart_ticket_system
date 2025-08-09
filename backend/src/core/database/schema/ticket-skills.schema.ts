import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tickets } from './tickets.schema';

export const ticketSkills = pgTable('ticket_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id),
  skillName: varchar('skill_name', { length: 100 }).notNull(),
  importance: varchar('importance', { length: 50 }).notNull().default('medium'),
  skills: text('skills'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Zod schemas for validation
export const insertTicketSkillSchema = createInsertSchema(ticketSkills);
export const selectTicketSkillSchema = createSelectSchema(ticketSkills);

// Types
export type TicketSkill = typeof ticketSkills.$inferSelect;
export type NewTicketSkill = typeof ticketSkills.$inferInsert;
export type TicketSkillInsertInput = z.infer<typeof insertTicketSkillSchema>;
export type TicketSkillSelectOutput = z.infer<typeof selectTicketSkillSchema>;
