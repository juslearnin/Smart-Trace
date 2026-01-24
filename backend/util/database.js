const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // DEBUG: Print the URI to console (Hide this in production!)
    console.log('Attempting to connect with URI:', process.env.MONGO_URI);

    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smarttrace';

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Database Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;