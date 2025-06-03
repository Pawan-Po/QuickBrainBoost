import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_pos';

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Please provide a MongoDB connection string.",
  );
}

// Connect to MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export { mongoose };