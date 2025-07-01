import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// MongoDB connection URI
const dbURI = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ MongoDB connected...');
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;
