import mongoose from 'mongoose';

export const initMongo = () => {
  mongoose
    .connect(
      'mongodb+srv://hero:indiaindexdemo@cluster0.daesock.mongodb.net/test',
      {}
    )
    .then(() => console.log('MongoDB connected'));
};
