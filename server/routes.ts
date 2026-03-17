import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, updateTransactionSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.get("/api/transactions", async (req, res) => {
    try {
      const txs = await storage.getTransactions();
      res.json(txs);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const parsed = insertTransactionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
      const tx = await storage.createTransaction(parsed.data);
      res.status(201).json(tx);
    } catch (e) {
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const parsed = updateTransactionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
      const tx = await storage.updateTransaction(req.params.id, parsed.data);
      if (!tx) return res.status(404).json({ error: "Transaction not found" });
      res.json(tx);
    } catch (e) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const ok = await storage.deleteTransaction(req.params.id);
      if (!ok) return res.status(404).json({ error: "Transaction not found" });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getInvestments();
      res.json(investments);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.get("/api/recurring", async (req, res) => {
    try {
      const items = await storage.getRecurringItems();
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch recurring items" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
