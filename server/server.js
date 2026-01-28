const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Import Models
const User = require("./models/User");
const Job = require("./models/Job");
const Policy = require("./models/Policy");
const Otp = require("./models/Otp");
const Worker = require("./models/Worker");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// 1. MIDDLEWARE & SETUP
// ==========================
app.use(cors());
app.use(express.json());

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================
// 2. MONGODB CONNECTION
// ==========================
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/rozgar_connect";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    // process.exit(1); // Don't exit immediately so we can show the error in the browser if needed, or let nodemon retry.
  });

// Check DB Connection Middleware
app.use(async (req, res, next) => {
  // If disconnected (0) or disconnecting (3), try to reconnect or fail
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    try {
      await mongoose.connect(MONGO_URI);
    } catch (err) {
      return res.status(503).json({ 
        message: "Database Connection Failed", 
        error: err.message 
      });
    }
  }
  // If connected (1) or connecting (2), proceed. Mongoose buffers requests while connecting.
  next();
});

// ==========================
// 3. FILE UPLOAD CONFIG (MULTER)
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ==========================
// 4. EMAIL CONFIGURATION
// ==========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error("❌ Email Service Error:", err.message);
  else console.log("✅ Email Service Ready");
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ==========================
// 5. AUTHENTICATION ROUTES
// ==========================

app.get("/", (req, res) => res.send("🚀 Rozgar Connect Backend Running (MongoDB)"));

app.get("/api/status", (req, res) => {
  res.json({ 
    status: "ok", 
    mongo_state: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting
    mongo_host: mongoose.connection.host,
    env_check: {
      has_mongo_uri: !!process.env.MONGO_URI,
      mongo_uri_start: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) + "..." : "MISSING"
    }
  });
});

// --- UPLOAD PROFILE PICTURE ---
app.post("/api/upload-profile-pic", upload.single("profileImage"), async (req, res) => {
  const { email } = req.body;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

  try {
    await User.findOneAndUpdate({ email }, { profile_pic_url: imageUrl });
    res.json({ message: "Image Uploaded Successfully", imageUrl });
  } catch (err) {
    console.error("DB Update Error:", err);
    res.status(500).json({ message: "Database Update Failed" });
  }
});

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid Password" });

    res.json({
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || "labour",
        profilePic: user.profile_pic_url,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- SEND OTP ---
app.post("/api/send-otp", async (req, res) => {
  const { identifier, type } = req.body;
  if (!identifier) return res.status(400).json({ message: "Identifier required" });

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (type === "register" && user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const otp = generateOTP();
    
    // Remove old OTPs for this identifier
    await Otp.deleteMany({ identifier });
    
    // Create new OTP
    await Otp.create({ identifier, otp });

    if (identifier.includes("@")) {
      await transporter.sendMail({
        from: '"Rozgar Connect" <no-reply@rozgar.com>',
        to: identifier,
        subject: "Authentication Code",
        html: `<h3>Your Code: <span style="color:#ff9800">${otp}</span></h3><p>Valid for 5 minutes.</p>`,
      });
      res.json({ message: "OTP sent to Email!" });
    } else {
      console.log(`📱 SMS OTP for ${identifier}: ${otp}`);
      res.json({ message: "OTP sent to Mobile!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP System Error" });
  }
});

// --- REGISTER ---
app.post("/api/register", async (req, res) => {
  const { email, phone, password, otp } = req.body;
  const identifier = email || phone;

  try {
    const otpRecord = await Otp.findOne({ identifier, otp });
    if (!otpRecord) return res.status(400).json({ message: "Invalid or Expired OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      phone,
      password: hashedPassword,
      role: req.body.role || 'labour'
    });

    await newUser.save();
    await Otp.deleteMany({ identifier }); // Clear OTPs

    res.status(201).json({ message: "Registration Successful" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "User already exists or Registration Failed" });
  }
});

// --- VALIDATE PASSWORD ---
app.post("/api/validate-password", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid Password" });

    res.json({ message: "Valid Credentials" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ==========================
// 6. PROFILE & SETTINGS ROUTES
// ==========================

// --- GET FULL USER DETAILS ---
app.post("/api/get-user-details", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Convert to object and map _id to id
    const userData = user.toObject();
    userData.id = userData._id;
    delete userData._id;
    delete userData.__v;
    
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});

// --- UPDATE FULL PROFILE ---
app.post("/api/update-full-profile", async (req, res) => {
  const { email, name, phone, dob, gender, address } = req.body;
  try {
    await User.findOneAndUpdate({ email }, { name, phone, dob, gender, address });
    res.json({ message: "Profile Updated Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Update Failed" });
  }
});

// --- CHANGE PASSWORD ---
app.post("/api/change-password", async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ email: username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect Current Password" });

    const newHash = await bcrypt.hash(newPassword, 10);
    user.password = newHash;
    await user.save();

    res.json({ message: "Password Changed Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Update Failed" });
  }
});

// --- RESET PASSWORD ---
app.post("/api/reset-password", async (req, res) => {
  const { identifier, newPassword } = req.body;
  try {
    const newHash = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
      { $or: [{ email: identifier }, { phone: identifier }] },
      { password: newHash }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Password Reset Successful" });
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});

// ==========================
// 7. WORKER MANAGEMENT ROUTES (Standalone)
// ==========================
app.get("/api/workers", async (req, res) => {
  try {
    const workers = await Worker.find().sort({ _id: -1 });
    const formatted = workers.map(w => ({
      id: w._id,
      name: w.name,
      skill: w.skill,
      rate: w.rate,
      phone: w.phone
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});

app.post("/api/workers", async (req, res) => {
  try {
    const newWorker = await Worker.create(req.body);
    const response = newWorker.toObject();
    response.id = response._id;
    delete response._id;
    delete response.__v;
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: "Insert Failed" });
  }
});

app.delete("/api/workers/:id", async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    res.json({ message: "Worker Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed" });
  }
});

// ==========================
// 8. DEBUG ROUTE
// ==========================
app.delete("/api/debug/users", async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: "💥 All users deleted! You can register fresh." });
  } catch (err) {
    res.status(500).send(err);
  }
});

// ==========================
// 9. CONTRACTOR ROUTES
// ==========================

// --- GET AVAILABLE LABORERS ---
app.get("/api/contractor/laborers", async (req, res) => {
  try {
    const laborers = await User.find({ role: "labour" })
                               .select("name skill daily_wage availability location phone profile_pic_url");
    // Transform _id to id for frontend compatibility
    const formatted = laborers.map(l => ({
      id: l._id,
      name: l.name,
      skill: l.skill,
      daily_wage: l.daily_wage,
      availability: l.availability,
      location: l.location,
      phone: l.phone,
      profile_pic_url: l.profile_pic_url
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});

// --- CREATE JOB (ASSIGN WORKER) ---
app.post("/api/jobs", async (req, res) => {
  const { contractor_id, worker_id, title, description, location, wage } = req.body;
  try {
    await Job.create({ contractor_id, worker_id, title, description, location, wage });
    res.status(201).json({ message: "Job Assigned Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create job" });
  }
});

// --- GET JOBS FOR CONTRACTOR ---
app.get("/api/contractor/jobs/:id", async (req, res) => {
  try {
    const jobs = await Job.find({ contractor_id: req.params.id })
                    .populate("worker_id", "name phone")
                    .sort({ created_at: -1 });
    
    // Transform for frontend
    const formatted = jobs.map(j => ({
      id: j._id,
      title: j.title,
      description: j.description,
      location: j.location,
      wage: j.wage,
      status: j.status,
      created_at: j.created_at,
      worker_name: j.worker_id?.name || "Unknown",
      worker_phone: j.worker_id?.phone || "N/A"
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});

// ==========================
// 10. LABOUR ROUTES
// ==========================

// --- GET JOBS FOR LABOUR ---
app.get("/api/labour/jobs/:id", async (req, res) => {
  try {
    const jobs = await Job.find({ worker_id: req.params.id })
                    .populate("contractor_id", "name phone")
                    .sort({ created_at: -1 });

    const formatted = jobs.map(j => ({
      id: j._id,
      title: j.title,
      description: j.description,
      location: j.location,
      wage: j.wage,
      status: j.status,
      created_at: j.created_at,
      contractor_name: j.contractor_id?.name || "Unknown",
      contractor_phone: j.contractor_id?.phone || "N/A"
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});

// --- UPDATE JOB STATUS ---
app.put("/api/jobs/:id/status", async (req, res) => {
  const { status } = req.body; 
  try {
    await Job.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Status Updated" });
  } catch (err) {
    res.status(500).json({ message: "Update Failed" });
  }
});

// ==========================
// 11. DEVELOPER (ADMIN) ROUTES
// ==========================

// --- GET ALL USERS ---
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 })
                            .select("id name email phone role created_at");
     // Map _id to id
    const formatted = users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        created_at: u.created_at
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});

// --- DELETE USER ---
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed" });
  }
});

// --- POST POLICY ---
app.post("/api/policies", async (req, res) => {
  try {
    await Policy.create(req.body);
    res.json({ message: "Policy Added" });
  } catch (err) {
    res.status(500).json({ message: "Policy Add Failed" });
  }
});

// --- GET POLICIES ---
app.get("/api/policies", async (req, res) => {
  try {
    const policies = await Policy.find().sort({ date_posted: -1 });
    // ID mapping
    const formatted = policies.map(p => ({
        id: p._id,
        title: p.title,
        content: p.content,
        date_posted: p.date_posted
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "DB Error" });
  }
});


// Export the app for Vercel
module.exports = app;

// Only listen if not running in production/serverless environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}
