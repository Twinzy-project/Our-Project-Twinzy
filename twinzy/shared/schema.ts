import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We'll keep the pgTable definitions for Drizzle compatibility
// But update our types to work with MongoDB (string IDs)

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  photoURL: text("photo_url"),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  deadline: timestamp("deadline"),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true
}).extend({
  // Add more flexible date handling for the deadline
  deadline: z.union([
    z.string().transform(str => new Date(str)),
    z.date(),
    z.null()
  ]).optional()
});

// Override the inferred types for MongoDB compatibility (string IDs)
export type User = Omit<typeof users.$inferSelect, 'id'> & { id: string };
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Goal = Omit<typeof goals.$inferSelect, 'id'> & { id: string };
export type InsertGoal = z.infer<typeof insertGoalSchema>;

// Schema for goal statistics
export type GoalStatistics = {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  completionRate: number;
};

// Schema for goal categories
export type CategoryCount = {
  category: string;
  count: number;
};
