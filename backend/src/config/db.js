import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connects to MongoDB database using Mongoose.
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB (${error.message}).`);
    console.warn('[Database Warning] Backend will run in fallback/offline mode.');
    return null;
  }
};

export default connectDB;
