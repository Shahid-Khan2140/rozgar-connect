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
const Application = require("./models/Application");
const Notification = require("./models/Notification");
const Review = require("./models/Review");
const HireRequest = require("./models/HireRequest");

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
  let { identifier, password } = req.body;
  identifier = identifier?.trim();

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid Password" });
    
    // STRICT ROLE ENFORCEMENT
    const requestedRole = req.body.role;
    
    // Developer Exception: Developers can login from any role tab (Labour/Contractor)
    // For everyone else, strictly enforce that they log in via their correct role tab.
    if (user.role === 'developer') {
        // Allow access, ignore requestedRole mismatch
    } else if (requestedRole && user.role !== requestedRole) {
       return res.status(403).json({ message: `Access Denied. You are registered as a ${user.role}, please select the correct role.` });
    }

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
    res.status(500).json({ message: "Server Error: " + err.message });
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
      // Format Email Content
      // Use provided name (for registration) or fallback to DB name or "User"
      const userName = req.body.name || (user ? user.name : "User");
      
      const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0f2a44; padding: 25px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;"><span style="color: #ff9800;">રોજગાર</span> Connect</h1>
          <p style="color: #cbd5e0; margin: 5px 0 0; font-size: 13px;">In Official Partnership with Government of Gujarat</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">Hello, ${userName}</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">To ensure the security of your account, please verify your identity with the code below.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; margin: 25px 0; text-align: center; border-radius: 8px; border: 2px dashed #ff9800;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f2a44; display: block;">${otp}</span>
            <span style="font-size: 12px; color: #888; display: block; margin-top: 5px;">VERIFICATION CODE</span>
          </div>
          
          <p style="color: #666; font-size: 14px;">This code is valid for 5 minutes. Please do not share this code with anyone.</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #333; font-weight: bold; margin: 0;">S.F.SANDHI</p>
            <p style="color: #888; font-size: 12px; margin: 2px 0 0;">CEO, <span style="color: #ff9800;">રોજગાર</span> Connect</p>
          </div>
        </div>
        
        <div style="background-color: #f4f6f8; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          &copy; 2026 <span style="color: #ff9800;">રોજગાર</span> Connect. All rights reserved.
        </div>
      </div>
      `;

      await transporter.sendMail({
        from: '"રોજગાર Connect" <no-reply@rozgar.com>',
        to: identifier,
        subject: "Your Authentication Code - રોજગાર Connect",
        html: emailHtml,
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
// --- REGISTER ---
app.post("/api/register", upload.single("govt_id_proof"), async (req, res) => {
  const { email, phone, password, otp, name, role, aadhaar_number, pan_number } = req.body;
  const identifier = email || phone;

  try {
    const otpRecord = await Otp.findOne({ identifier, otp });
    if (!otpRecord) return res.status(400).json({ message: "Invalid or Expired OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let govt_id_proof_url = "";
    if (req.file) {
      govt_id_proof_url = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    }

    const newUser = new User({
      name: name || "User", 
      email,
      phone,
      password: hashedPassword,
      role: role || 'labour',
      aadhaar_number,
      pan_number,
      govt_id_proof_url,
      is_kyc_verified: false // pending verification
    });

    await newUser.save();
    await Otp.deleteMany({ identifier }); // Clear OTPs

    // Send Welcome Notification? (Optional)

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
  const { email, name, phone, dob, gender, address, skill, skills } = req.body;
  try {
    await User.findOneAndUpdate({ email }, { name, phone, dob, gender, address, skill, skills });
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

// ==========================
// 14. HIRE REQUEST & WORKER BROWSING
// ==========================

// --- BROWSE WORKERS (For Contractors) ---
app.get("/api/workers/browse", async (req, res) => {
  try {
    // 1. Fetch all users with role 'labour'
    // Select specific fields, explicitly EXCLUDING phone/email if needed (though we handle display on front, good to limit here)
    // We actually need email/phone if we want to reveal it later, but standard browse should probably not verify it? 
    // Actually, for privacy, we should project limited fields. 
    // But wait, if we Accept on frontend, we might need to fetch full details then.
    // Let's return basics. Privacy is handled by simply not showing the field in UI until connected.
    
    const workers = await User.find({ role: "labour" }).select("-password"); // Exclude password
    
    // 2. Attach Ratings
    const workersWithRatings = await Promise.all(workers.map(async (w) => {
        const reviews = await Review.find({ reviewee_id: w._id });
        const avg = reviews.length > 0 
           ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
           : "New";
        
        // Return a safe object
        return {
           _id: w._id,
           name: w.name,
           skill: w.skill,
           location: w.location,
           profile_pic_url: w.profile_pic_url,
           rating: avg,
           review_count: reviews.length,
           // Hide Phone/Email in this specific response if strictly needed, 
           // but for MVP, we just won't render it in the "Card".
        };
    }));

    res.json(workersWithRatings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching workers" });
  }
});

// --- CREATE HIRE REQUEST ---
app.post("/api/hire-requests", async (req, res) => {
  const { contractor_id, worker_id, job_type, message } = req.body;
  try {
    const newRequest = await HireRequest.create({
      contractor_id,
      worker_id,
      job_type,
      message,
      status: 'pending'
    });

    // Notify Worker
    await Notification.create({
      user_id: worker_id,
      type: 'info',
      title: 'New Work Request',
      message: `A contractor has requested you for ${job_type} work.`
    });

    res.status(201).json({ message: "Request Sent" });
  } catch(err) {
    res.status(500).json({ message: "Request Failed" });
  }
});

// --- GET WORKER REQUESTS ---
app.get("/api/hire-requests/worker/:id", async (req, res) => {
  try {
    const requests = await HireRequest.find({ worker_id: req.params.id })
                                      .populate('contractor_id', 'name profile_pic_url location rating') // Contractor details
                                      .sort({ created_at: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

// --- UPDATE REQUEST STATUS ---
app.put("/api/hire-requests/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    const request = await HireRequest.findByIdAndUpdate(req.params.id, { status }, { new: true })
                                     .populate('contractor_id')
                                     .populate('worker_id');
    
    if (status === 'accepted') {
        // Notify Contractor with Worker's Details
        // Ideally we just notify "Accepted", and the UI updates to show specific details.
        
        await Notification.create({
          user_id: request.contractor_id._id,
          type: 'success',
          title: 'Request Accepted',
          message: `${request.worker_id.name} accepted your request! You can now contact them.`
        });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Update Failed" });
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



// ==========================
// 12. NEW FEATURES ROUTES
// ==========================

// --- SEARCH JOBS ---
app.get("/api/jobs/search", async (req, res) => {
  const { query, location, category, wage_min, wage_max } = req.query;
  const filter = { status: "open" };

  if (query) filter.title = { $regex: query, $options: "i" };
  if (location) filter.location = { $regex: location, $options: "i" };
  if (category && category !== "All") filter.category = category;
  if (wage_min || wage_max) {
    filter.wage = {};
    if (wage_min) filter.wage.$gte = Number(wage_min);
    if (wage_max) filter.wage.$lte = Number(wage_max);
  }

  try {
    const jobs = await Job.find(filter).sort({ created_at: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Search Failed" });
  }
});

// --- GET OPEN JOBS (FEED) ---
app.get("/api/jobs/feed", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
                          .populate("contractor_id", "name profile_pic_url")
                          .sort({ created_at: -1 })
                          .limit(50);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Feed Error" });
  }
});

// --- APPLY FOR JOB ---
app.post("/api/jobs/apply", async (req, res) => {
  const { job_id, worker_id, contractor_id, cover_letter } = req.body;
  try {
    const existing = await Application.findOne({ job_id, worker_id });
    if (existing) return res.status(400).json({ message: "Already Applied" });

    await Application.create({ job_id, worker_id, contractor_id, cover_letter });
    
    // Notify Contractor
    await Notification.create({
      user_id: contractor_id,
      title: "New Job Application",
      message: `A worker has applied for your job.`
    });

    res.status(201).json({ message: "Application Submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Application Failed" });
  }
});

// --- GET WORKER APPLICATIONS ---
app.get("/api/labour/applications/:id", async (req, res) => {
  try {
    const apps = await Application.find({ worker_id: req.params.id })
                                  .populate("job_id")
                                  .sort({ applied_at: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// --- POST REVIEW ---
app.post("/api/reviews", async (req, res) => {
  try {
    await Review.create(req.body);
    res.status(201).json({ message: "Review Submitted" });
  } catch (err) {
    res.status(500).json({ message: "Review Failed" });
  }
});

// --- GET NOTIFICATIONS ---
app.get("/api/notifications/:id", async (req, res) => {
  try {
    const notifs = await Notification.find({ user_id: req.params.id }).sort({ created_at: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// --- SAVE JOB ---
app.post("/api/users/save-job", async (req, res) => {
  const { user_id, job_id } = req.body;
  try {
    await User.findByIdAndUpdate(user_id, { $addToSet: { saved_jobs: job_id } });
    res.json({ message: "Job Saved" });
  } catch (err) {
    res.status(500).json({ message: "Save Failed" });
  }
});

// --- GET APPLICATIONS FOR A JOB ---
app.get("/api/jobs/:id/applications", async (req, res) => {
  try {
    const apps = await Application.find({ job_id: req.params.id })
                                .populate("worker_id", "name phone skill daily_wage profile_pic_url")
                                .sort({ applied_at: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// --- ACCEPT/REJECT APPLICATION ---
app.post("/api/applications/:id/status", async (req, res) => {
  const { status, job_id, worker_id } = req.body; // status: 'accepted' or 'rejected'
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (status === 'accepted') {
       // Update Job
       await Job.findByIdAndUpdate(job_id, { 
         status: 'assigned', 
         worker_id: worker_id 
       });
       
       // Reject other applicants
       await Application.updateMany(
         { job_id: job_id, _id: { $ne: req.params.id } },
         { status: 'rejected' }
       );

       // Notify Worker
       await Notification.create({
         user_id: worker_id,
         type: 'success',
         title: 'Application Accepted',
         message: 'You have been hired for the job!'
       });
    }

    res.json({ message: "Status Updated" });
  } catch (err) {
    res.status(500).json({ message: "Update Failed" });
  }
});

// --- GET SAVED JOBS ---
app.get("/api/users/saved-jobs/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
      path: 'saved_jobs',
      populate: { path: 'contractor_id', select: 'name profile_pic_url' }
    });
    res.json(user ? user.saved_jobs : []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching saved jobs" });
  }
});

// --- GET CONTRACTOR SENT REQUESTS ---
app.get("/api/hire-requests/contractor/:id", async (req, res) => {
  try {
    const requests = await HireRequest.find({ contractor_id: req.params.id })
      .populate("worker_id", "name profile_pic_url skill location phone")
      .sort({ created_at: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sent requests" });
  }
});

const Scheme = require("./models/Scheme");

// ... (existing routes)

const scrapeSchemes = require("./utils/scraper");

// --- GET WELFARE SCHEMES ---
app.get("/api/schemes", async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ board: 1 });
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching schemes" });
  }
});

// --- SYNC SCHEMES (TRIGGER SCRAPER) ---
app.post("/api/schemes/sync", async (req, res) => {
  try {
    const result = await scrapeSchemes();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Scraping failed" });
  }
});

// ==========================
// 13. SCHEDULED TASKS (CRON)
// ==========================
const cron = require("node-cron");

// Run Scraper Every Day at Midnight (00:00)
// Format: minute hour day-of-month month day-of-week
cron.schedule("0 0 * * *", async () => {
   console.log("🕛 Running Daily Scheme Update Job...");
   try {
       const result = await scrapeSchemes();
       console.log(`✅ Daily Update Complete. Added: ${result.added}, Found: ${result.totalFound}`);
   } catch (err) {
       console.error("❌ Daily Update Failed:", err);
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
