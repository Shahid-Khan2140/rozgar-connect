const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // This is where we connect to the database
        // For now, we use a local connection string
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/rozgar_connect');
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Stop the server if connection fails
    }
};

module.exports = connectDB;