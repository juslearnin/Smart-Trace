const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set. Using in-memory dev store; data will reset when the server restarts.");
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn('MongoDB connection error:', error.message);
    console.warn("Using in-memory dev store; data will reset when the server restarts.");
    return null;
  }
};

module.exports = connectDB;
