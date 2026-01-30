const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/rozgar_connect";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await seedDeveloper();
  })
  .catch(err => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });

const seedDeveloper = async () => {
  try {
    const email = "shahidsandhi1786@gmail.com";
    const passwordRaw = "sk2140";
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update existing user
      existingUser.password = hashedPassword;
      existingUser.role = "developer";
      existingUser.name = "Shahid Sandhi"; // Ensuring a name exists
      existingUser.phone = "7861902140";
      await existingUser.save();
      console.log("✅ Existing user updated to Developer role with new password and phone.");
    } else {
      // Create new user
      const newDev = new User({
        name: "Shahid Sandhi",
        email: email,
        phone: "7861902140", // Updated phone
        password: hashedPassword,
        role: "developer",
        gender: "Male",
        address: "Admin HQ"
      });
      await newDev.save();
      console.log("✅ New Developer account created successfully!");
    }

    console.log("\n🔑 Developer Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${passwordRaw}`);
    console.log("   Role: developer");

  } catch (err) {
    console.error("❌ Failed to seed developer:", err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};
