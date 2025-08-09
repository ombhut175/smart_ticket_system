import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users.schema';

export const userSkills = pgTable('user_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  skillName: varchar('skill_name', { length: 100 }).notNull(),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }).notNull().default('beginner'),
  skills: text('skills'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Zod schemas for validation
export const insertUserSkillSchema = createInsertSchema(userSkills);
export const selectUserSkillSchema = createSelectSchema(userSkills);

// Types
export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;
export type UserSkillInsertInput = z.infer<typeof insertUserSkillSchema>;
export type UserSkillSelectOutput = z.infer<typeof selectUserSkillSchema>;
