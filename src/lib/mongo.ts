import mongoose from 'mongoose';

export const initMongo = () => {
  const mongoUrl = process.env.MONGODB_URL; 
  mongoose
    .connect(mongoUrl,{})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
};
