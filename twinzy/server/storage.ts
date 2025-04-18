import { type Goal, type InsertGoal, type User, type InsertUser } from "@shared/schema";
import { User as UserModel, Goal as GoalModel } from "./models";
import mongoose from 'mongoose';

// Determine if we're in a connected state with MongoDB
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// The storage interface remains the same but id is now a string (MongoDB ObjectId)
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Goal methods
  getGoals(userId: string): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, goal: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Statistics methods
  getGoalStatistics(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    completionRate: number;
  }>;
  
  // Category methods
  getGoalCategories(userId: string): Promise<{ category: string; count: number }[]>;
}

export class MongoDBStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      if (!user) return undefined;
      
      return {
        id: user._id.toString(),
        uid: user.uid,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL
      };
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ uid });
      if (!user) return undefined;
      
      return {
        id: user._id.toString(),
        uid: user.uid,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL
      };
    } catch (error) {
      console.error("Error in getUserByUid:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const user = new UserModel(insertUser);
      await user.save();
      
      return {
        id: user._id.toString(),
        uid: user.uid,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL
      };
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

  // Goal methods
  async getGoals(userId: string): Promise<Goal[]> {
    try {
      const goals = await GoalModel.find({ userId }).sort({ createdAt: -1 });
      
      return goals.map(goal => ({
        id: goal._id.toString(),
        userId: goal.userId,
        title: goal.title,
        description: goal.description || "",
        category: goal.category,
        deadline: goal.deadline,
        progress: goal.progress,
        isCompleted: goal.isCompleted,
        createdAt: goal.createdAt
      }));
    } catch (error) {
      console.error("Error in getGoals:", error);
      return [];
    }
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    try {
      const goal = await GoalModel.findById(id);
      if (!goal) return undefined;
      
      return {
        id: goal._id.toString(),
        userId: goal.userId,
        title: goal.title,
        description: goal.description || "",
        category: goal.category,
        deadline: goal.deadline,
        progress: goal.progress,
        isCompleted: goal.isCompleted,
        createdAt: goal.createdAt
      };
    } catch (error) {
      console.error("Error in getGoal:", error);
      return undefined;
    }
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    try {
      const goal = new GoalModel(insertGoal);
      await goal.save();
      
      return {
        id: goal._id.toString(),
        userId: goal.userId,
        title: goal.title,
        description: goal.description || "",
        category: goal.category,
        deadline: goal.deadline,
        progress: goal.progress,
        isCompleted: goal.isCompleted,
        createdAt: goal.createdAt
      };
    } catch (error) {
      console.error("Error in createGoal:", error);
      throw error;
    }
  }

  async updateGoal(id: string, updatedGoal: Partial<Goal>): Promise<Goal | undefined> {
    try {
      const goal = await GoalModel.findByIdAndUpdate(
        id,
        { $set: updatedGoal },
        { new: true, runValidators: true }
      );
      
      if (!goal) return undefined;
      
      return {
        id: goal._id.toString(),
        userId: goal.userId,
        title: goal.title,
        description: goal.description || "",
        category: goal.category,
        deadline: goal.deadline,
        progress: goal.progress,
        isCompleted: goal.isCompleted,
        createdAt: goal.createdAt
      };
    } catch (error) {
      console.error("Error in updateGoal:", error);
      return undefined;
    }
  }

  async deleteGoal(id: string): Promise<boolean> {
    try {
      const result = await GoalModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("Error in deleteGoal:", error);
      return false;
    }
  }

  // Statistics methods
  async getGoalStatistics(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    completionRate: number;
  }> {
    try {
      const totalGoals = await GoalModel.countDocuments({ userId });
      const completedGoals = await GoalModel.countDocuments({ userId, isCompleted: true });
      const inProgressGoals = await GoalModel.countDocuments({ 
        userId, 
        isCompleted: false,
        progress: { $gt: 0 }
      });
      
      const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

      return {
        totalGoals,
        completedGoals,
        inProgressGoals,
        completionRate
      };
    } catch (error) {
      console.error("Error in getGoalStatistics:", error);
      return {
        totalGoals: 0,
        completedGoals: 0,
        inProgressGoals: 0,
        completionRate: 0
      };
    }
  }

  // Category methods
  async getGoalCategories(userId: string): Promise<{ category: string; count: number }[]> {
    try {
      const categories = await GoalModel.aggregate([
        { $match: { userId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", count: 1 } }
      ]);
      
      return categories;
    } catch (error) {
      console.error("Error in getGoalCategories:", error);
      return [];
    }
  }
}

// In-memory storage for development fallback
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private usersByUid: Map<string, User>;
  private goals: Map<string, Goal>;
  currentUserId: number;
  currentGoalId: number;

  constructor() {
    this.users = new Map();
    this.usersByUid = new Map();
    this.goals = new Map();
    this.currentUserId = 1;
    this.currentGoalId = 1;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return this.usersByUid.get(uid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId.toString();
    this.currentUserId++;
    // TypeScript fix: id is a string in our User type due to MongoDB
    const user: User = { ...insertUser, id } as User;
    this.users.set(id, user);
    this.usersByUid.set(user.uid, user);
    return user;
  }

  // Goal methods
  async getGoals(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId.toString();
    this.currentGoalId++;
    // TypeScript fix: id is a string in our Goal type due to MongoDB
    const goal: Goal = { 
      ...insertGoal, 
      id, 
      createdAt: new Date()
    } as Goal;
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updatedGoal: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    const updated = { ...goal, ...updatedGoal };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Statistics methods
  async getGoalStatistics(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    completionRate: number;
  }> {
    const userGoals = await this.getGoals(userId);
    const totalGoals = userGoals.length;
    const completedGoals = userGoals.filter(goal => goal.isCompleted).length;
    const inProgressGoals = userGoals.filter(goal => !goal.isCompleted && (goal.progress || 0) > 0).length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      completionRate
    };
  }

  // Category methods
  async getGoalCategories(userId: string): Promise<{ category: string; count: number }[]> {
    const userGoals = await this.getGoals(userId);
    const categoryMap = new Map<string, number>();
    
    userGoals.forEach(goal => {
      const category = goal.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }));
  }
}

// Use MongoDB in production, fallback to MemStorage in development if MongoDB fails
let storage: IStorage;

if (process.env.NODE_ENV === 'production' || isMongoConnected()) {
  console.log('Using MongoDB storage');
  storage = new MongoDBStorage();
} else {
  console.log('Using in-memory storage (development fallback)');
  storage = new MemStorage();
}

export { storage };
