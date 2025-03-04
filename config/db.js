const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Ensure MONGO_URI is available in .env file
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI is not defined in .env file');
      process.exit(1);  // Exit with error code
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true, // Optional, but can be kept for backward compatibility
      useUnifiedTopology: true, // Optional, but can be kept for backward compatibility
    });

    console.log("MongoDB connected...");
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
