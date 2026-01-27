const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Import User model
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/rozgar_connect";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await seedData();
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // 1. Clear existing users (Optional, but good for testing)
    // await User.deleteMany({}); 
    // console.log("🗑️  Cleared existing users");

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash("Test@123", 10);

    // 3. Create Test User
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      phone: "9876543210",
      password: hashedPassword,
      gender: "Male",
      address: "Ahmedabad, Gujarat",
      role: "labour" // Default role
    });

    // 4. Save to DB
    await testUser.save();
    console.log("✅ Test user created successfully!");
    console.log("\n📧 Test Credentials:");
    console.log("   Email: test@example.com");
    console.log("   Password: Test@123");

  } catch (err) {
    if (err.code === 11000) { // Duplicate Key Error
      console.log("⚠️  Test user already exists");
    } else {
      console.error("❌ Failed to insert test user:", err);
    }
  } finally {
    mongoose.connection.close(); // Close connection
    process.exit(0);
  }
};
