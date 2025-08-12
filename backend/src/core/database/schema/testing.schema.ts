import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const testing = pgTable('testing', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).default('general'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Zod schemas for validation
export const insertTestingSchema = createInsertSchema(testing);
export const selectTestingSchema = createSelectSchema(testing);

// Types
export type Testing = typeof testing.$inferSelect;
export type NewTesting = typeof testing.$inferInsert;
export type TestingInsertInput = z.infer<typeof insertTestingSchema>;
export type TestingSelectOutput = z.infer<typeof selectTestingSchema>;
