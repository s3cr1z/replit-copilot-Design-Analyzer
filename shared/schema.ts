import { pgTable, text, varchar, real, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  accountId: text("account_id").notNull(),
  isIncome: boolean("is_income").notNull().default(false),
  isReviewed: boolean("is_reviewed").notNull().default(false),
  isRecurring: boolean("is_recurring").notNull().default(false),
  notes: text("notes"),
});

export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey(),
  category: text("category").notNull(),
  budgetAmount: real("budget_amount").notNull(),
  spentAmount: real("spent_amount").notNull().default(0),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  institution: text("institution").notNull(),
  type: text("type").notNull(),
  balance: real("balance").notNull(),
  lastFour: text("last_four").notNull(),
  color: text("color").notNull(),
  available: real("available"),
  utilized: real("utilized"),
  change: real("change"),
});

export const investments = pgTable("investments", {
  id: varchar("id").primaryKey(),
  ticker: text("ticker").notNull(),
  name: text("name").notNull(),
  value: real("value").notNull(),
  change: real("change").notNull(),
  changePercent: real("change_percent").notNull(),
  accountId: text("account_id").notNull(),
});

export const recurringItems = pgTable("recurring_items", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  nextDate: text("next_date").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const updateTransactionSchema = createInsertSchema(transactions).partial().omit({ id: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true });

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type RecurringItem = typeof recurringItems.$inferSelect;
export type InsertUser = { username: string; password: string };
export type User = typeof users.$inferSelect;

export const CATEGORIES = [
  "Food & Drink",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Rent",
  "Car",
  "Health",
  "Travel",
  "Other",
  "Income",
  "Transfer",
] as const;

export type Category = typeof CATEGORIES[number];
