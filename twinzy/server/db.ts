import dotenv from "dotenv";
dotenv.config();

import mongoose from 'mongoose';

// MongoDB connection string - ensure we're using the environment variable
const MONGODB_URI = process.env.MONGODB_URI || '';

// Check if we have a MongoDB URI
if (!MONGODB_URI) {
  console.warn('WARNING: MONGODB_URI environment variable is not set. Please provide a MongoDB connection string.');
}

// Connect to MongoDB with timeout
export const connectToDatabase = async (): Promise<void> => {
  if (!MONGODB_URI) {
    console.warn('MongoDB URI is not provided. Skipping connection attempt.');
    return;
  }
  
  console.log('Attempting to connect to MongoDB with provided URI...');
  
  // Set connection options with short timeout for faster startup
  const options = {
    connectTimeoutMS: 5000, // 5 seconds
    socketTimeoutMS: 10000, // 10 seconds
    serverSelectionTimeoutMS: 5000, // 5 seconds
    retryWrites: true
  };

  // Create a promise that will resolve after a short timeout
  const timeoutPromise = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error('MongoDB connection timeout - continuing with fallback'));
    }, 5000); // Short 5-second timeout for faster startup
  });

  try {
    // Race between connection and timeout
    await Promise.race([
      mongoose.connect(MONGODB_URI, options),
      timeoutPromise
    ]);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    
    // Instead of exiting, we'll continue without MongoDB in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('Continuing without MongoDB connection in development mode');
      return;
    }
  }
};

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Handle MongoDB disconnection
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
  }
  process.exit(0);
});