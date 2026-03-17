import {
  type User, type InsertUser,
  type Transaction, type InsertTransaction, type UpdateTransaction,
  type Budget, type Account, type Investment, type RecurringItem,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(t: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, t: UpdateTransaction): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  getBudgets(): Promise<Budget[]>;
  getAccounts(): Promise<Account[]>;
  getInvestments(): Promise<Investment[]>;
  getRecurringItems(): Promise<RecurringItem[]>;
  getDashboardStats(): Promise<{
    totalBudgeted: number;
    totalSpent: number;
    netThisMonth: number;
    totalIncome: number;
    totalSpend: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private accounts: Map<string, Account> = new Map();
  private investments: Map<string, Investment> = new Map();
  private recurring: Map<string, RecurringItem> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const accountData: Account[] = [
      { id: "acc1", name: "Chase Credit...", institution: "Chase", type: "credit", balance: 6799.77, lastFour: "9229", color: "#1560BD", available: null, utilized: 45.33, change: null },
      { id: "acc2", name: "Cash Rewards", institution: "Bank of America", type: "credit", balance: 4930.96, lastFour: "3000", color: "#E31837", available: null, utilized: 49.30, change: null },
      { id: "acc3", name: "Adv Plus Ban...", institution: "Bank of America", type: "depository", balance: 19052, lastFour: "1537", color: "#E31837", available: 19052, utilized: null, change: 4.22 },
      { id: "acc4", name: "Regular Savi...", institution: "Bank of America", type: "depository", balance: 12187, lastFour: "5422", color: "#E31837", available: 12187, utilized: null, change: 0.49 },
      { id: "acc5", name: "Chase Check...", institution: "Chase", type: "depository", balance: 7828.40, lastFour: "4421", color: "#1560BD", available: 7828.40, utilized: null, change: 2.14 },
    ];
    accountData.forEach(a => this.accounts.set(a.id, a));

    const budgetData: Budget[] = [
      { id: "bud1", category: "Food & Drink", budgetAmount: 800, spentAmount: 565, icon: "UtensilsCrossed", color: "#f59e0b" },
      { id: "bud2", category: "Transportation", budgetAmount: 300, spentAmount: 214.76, icon: "Car", color: "#6366f1" },
      { id: "bud3", category: "Shopping", budgetAmount: 500, spentAmount: 384, icon: "ShoppingBag", color: "#10b981" },
      { id: "bud4", category: "Entertainment", budgetAmount: 350, spentAmount: 17, icon: "Tv", color: "#f43f5e" },
      { id: "bud5", category: "Utilities", budgetAmount: 250, spentAmount: 198, icon: "Zap", color: "#3b82f6" },
      { id: "bud6", category: "Health", budgetAmount: 200, spentAmount: 35, icon: "Heart", color: "#ec4899" },
    ];
    budgetData.forEach(b => this.budgets.set(b.id, b));

    const txData: Transaction[] = [
      { id: "tx1", name: "Chevron", amount: 42.31, date: "2025-09-06", category: "Car", accountId: "acc1", isIncome: false, isReviewed: false, isRecurring: false, notes: null },
      { id: "tx2", name: "Rayne Water Ca", amount: 38.00, date: "2025-09-05", category: "Utilities", accountId: "acc1", isIncome: false, isReviewed: true, isRecurring: true, notes: null },
      { id: "tx3", name: "Car Payment", amount: 355.00, date: "2025-09-05", category: "Car", accountId: "acc1", isIncome: false, isReviewed: true, isRecurring: true, notes: null },
      { id: "tx4", name: "Sunoco", amount: 27.86, date: "2025-09-05", category: "Car", accountId: "acc1", isIncome: false, isReviewed: false, isRecurring: false, notes: null },
      { id: "tx5", name: "Namecheap", amount: 4.00, date: "2025-09-05", category: "Other", accountId: "acc2", isIncome: false, isReviewed: true, isRecurring: true, notes: null },
      { id: "tx6", name: "Transfer - Paym...", amount: 4.14, date: "2025-09-05", category: "Transfer", accountId: "acc1", isIncome: false, isReviewed: false, isRecurring: false, notes: null },
      { id: "tx7", name: "Automatic Payment - Thank You", amount: 4.14, date: "2025-09-05", category: "Transfer", accountId: "acc2", isIncome: true, isReviewed: true, isRecurring: false, notes: null },
      { id: "tx8", name: "Uber", amount: 32.01, date: "2025-09-04", category: "Transportation", accountId: "acc1", isIncome: false, isReviewed: false, isRecurring: false, notes: null },
      { id: "tx9", name: "Property Payment Ren...", amount: 1984.00, date: "2025-09-04", category: "Rent", accountId: "acc2", isIncome: false, isReviewed: true, isRecurring: true, notes: null },
      { id: "tx10", name: "Transfer - Paym...", amount: 718.22, date: "2025-09-04", category: "Transfer", accountId: "acc1", isIncome: false, isReviewed: false, isRecurring: false, notes: null },
      { id: "tx11", name: "Automatic Payment - Thank You", amount: 718.22, date: "2025-09-04", category: "Transfer", accountId: "acc2", isIncome: true, isReviewed: true, isRecurring: false, notes: null },
      { id: "tx12", name: "Sunoco", amount: 125.05, date: "2025-09-03", category: "Car", accountId: "acc1", isIncome: false, isReviewed: true, isRecurring: false, notes: null },
      { id: "tx13", name: "Google Storage", amount: 9.99, date: "2025-09-02", category: "Other", accountId: "acc2", isIncome: false, isReviewed: true, isRecurring: true, notes: null },
      { id: "tx14", name: "Netflix", amount: 17.99, date: "2025-09-02", category: "Entertainment", accountId: "acc2", isIncome: false, isReviewed: true, isRecurring: true, notes: null },
      { id: "tx15", name: "Whole Foods", amount: 87.43, date: "2025-09-02", category: "Food & Drink", accountId: "acc1", isIncome: false, isReviewed: true, isRecurring: false, notes: null },
      { id: "tx16", name: "Starbucks", amount: 12.50, date: "2025-09-01", category: "Food & Drink", accountId: "acc1", isIncome: false, isReviewed: true, isRecurring: false, notes: null },
      { id: "tx17", name: "Salary Deposit", amount: 4120.00, date: "2025-09-01", category: "Income", accountId: "acc3", isIncome: true, isReviewed: true, isRecurring: true, notes: null },
      { id: "tx18", name: "Amazon", amount: 156.23, date: "2025-09-01", category: "Shopping", accountId: "acc2", isIncome: false, isReviewed: true, isRecurring: false, notes: null },
      { id: "tx19", name: "Lyft", amount: 34.76, date: "2025-08-31", category: "Transportation", accountId: "acc1", isIncome: false, isReviewed: true, isRecurring: false, notes: null },
      { id: "tx20", name: "Chipotle", amount: 24.15, date: "2025-08-31", category: "Food & Drink", accountId: "acc1", isIncome: false, isReviewed: true, isRecurring: false, notes: null },
    ];
    txData.forEach(t => this.transactions.set(t.id, t));

    const investData: Investment[] = [
      { id: "inv1", ticker: "VBR", name: "Vanguard Sm...", value: 3420.55, change: 47.85, changePercent: 1.40, accountId: "inv_acc1" },
      { id: "inv2", ticker: "AAPL", name: "Apple", value: 2318.20, change: 22.39, changePercent: 0.97, accountId: "inv_acc1" },
      { id: "inv3", ticker: "AMZN", name: "Amazon", value: 1890.12, change: 14.25, changePercent: 0.76, accountId: "inv_acc1" },
      { id: "inv4", ticker: "MSFT", name: "Microsoft", value: 447.13, change: -3.22, changePercent: -0.72, accountId: "inv_acc1" },
    ];
    investData.forEach(i => this.investments.set(i.id, i));

    const recurringData: RecurringItem[] = [
      { id: "rec1", name: "Lemonade Insu...", amount: 325.15, nextDate: "2025-09-07", category: "Insurance", isActive: true },
      { id: "rec2", name: "Audible", amount: 14.95, nextDate: "2025-09-15", category: "Entertainment", isActive: true },
      { id: "rec3", name: "Netflix", amount: 17.99, nextDate: "2025-09-20", category: "Entertainment", isActive: true },
      { id: "rec4", name: "Car Payment", amount: 355.00, nextDate: "2025-10-05", category: "Car", isActive: true },
      { id: "rec5", name: "Google One", amount: 9.99, nextDate: "2025-10-02", category: "Other", isActive: true },
    ];
    recurringData.forEach(r => this.recurring.set(r.id, r));
  }

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => b.date.localeCompare(a.date));
  }
  async getTransaction(id: string) { return this.transactions.get(id); }
  async createTransaction(t: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const tx: Transaction = {
      ...t,
      id,
      isIncome: t.isIncome ?? false,
      isReviewed: t.isReviewed ?? false,
      isRecurring: t.isRecurring ?? false,
      notes: t.notes ?? null,
    };
    this.transactions.set(id, tx);
    return tx;
  }
  async updateTransaction(id: string, updates: UpdateTransaction): Promise<Transaction | undefined> {
    const tx = this.transactions.get(id);
    if (!tx) return undefined;
    const updated = { ...tx, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }
  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }
  async getInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
  }
  async getRecurringItems(): Promise<RecurringItem[]> {
    return Array.from(this.recurring.values());
  }

  async getDashboardStats() {
    const txList = Array.from(this.transactions.values());
    const budgetList = Array.from(this.budgets.values());
    const totalBudgeted = budgetList.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = budgetList.reduce((sum, b) => sum + b.spentAmount, 0);
    const income = txList.filter(t => t.isIncome).reduce((s, t) => s + t.amount, 0);
    const spend = txList.filter(t => !t.isIncome && t.category !== "Transfer").reduce((s, t) => s + t.amount, 0);
    return {
      totalBudgeted,
      totalSpent,
      netThisMonth: income - spend,
      totalIncome: income,
      totalSpend: spend,
    };
  }
}

export const storage = new MemStorage();
