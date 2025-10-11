import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('⚠️  No MongoDB URI provided, using file-based storage');
      console.log('✅ Database: File-based storage (JSON files)');
      return null;
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Falling back to file-based storage');
    console.log('✅ Database: File-based storage (JSON files)');
    return null;
  }
};

export default connectDB;
