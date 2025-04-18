import mongoose, { Document, Schema } from 'mongoose';
import { Goal } from '@shared/schema';

// Goal interface for Mongoose
export interface IGoal extends Document, Omit<Goal, 'id' | 'createdAt'> {
  // id is already provided by Mongoose's _id
  // createdAt is handled by Mongoose timestamps
}

// Goal schema for MongoDB
const GoalSchema = new Schema<IGoal>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  deadline: { type: Date },
  progress: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Export the Goal model
export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);