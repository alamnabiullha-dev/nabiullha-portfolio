
import mongoose from 'mongoose';

export default async function connectDB(uri) {
    try {
        mongoose.set('strictQuery', true);

        console.log('⏳ Connecting to MongoDB...');

        await mongoose.connect(uri);

        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
}
