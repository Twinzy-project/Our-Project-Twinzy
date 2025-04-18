import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post('/api/auth/user', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUid(userData.uid);
      
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.get('/api/auth/user/:uid', async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.params.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve user' });
    }
  });

  // Goal routes
  app.get('/api/goals/:userId', async (req, res) => {
    try {
      const goals = await storage.getGoals(req.params.userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve goals' });
    }
  });

  app.post('/api/goals', async (req, res) => {
    try {
      console.log("Received goal data:", req.body);
      const goalData = insertGoalSchema.parse(req.body);
      console.log("Parsed goal data:", goalData);
      const newGoal = await storage.createGoal(goalData);
      res.status(201).json(newGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: 'Invalid goal data', errors: error.errors });
      }
      console.error("Goal creation error:", error);
      res.status(500).json({ message: 'Failed to create goal' });
    }
  });

  app.patch('/api/goals/:id', async (req, res) => {
    try {
      const goalId = req.params.id; // MongoDB uses string IDs
      const updatedGoal = await storage.updateGoal(goalId, req.body);
      if (!updatedGoal) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update goal' });
    }
  });

  app.delete('/api/goals/:id', async (req, res) => {
    try {
      const goalId = req.params.id; // MongoDB uses string IDs
      const success = await storage.deleteGoal(goalId);
      if (!success) {
        return res.status(404).json({ message: 'Goal not found' });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete goal' });
    }
  });

  // Statistics routes
  app.get('/api/statistics/:userId', async (req, res) => {
    try {
      const statistics = await storage.getGoalStatistics(req.params.userId);
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve statistics' });
    }
  });

  // Categories routes
  app.get('/api/categories/:userId', async (req, res) => {
    try {
      const categories = await storage.getGoalCategories(req.params.userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve categories' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
