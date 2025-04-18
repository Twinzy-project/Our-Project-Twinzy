import mongoose, { Document, Schema } from 'mongoose';
import { User } from '@shared/schema';

// User interface for Mongoose
export interface IUser extends Document, Omit<User, 'id'> {
  // id is already provided by Mongoose's _id
}

// User schema for MongoDB
const UserSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photoURL: { type: String, default: '' }
}, {
  timestamps: true
});

// Export the User model
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);