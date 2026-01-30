const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, default: "User" },
  email: { type: String, unique: true, sparse: true }, // Sparse allows nulls if phone is used
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["labour", "contractor", "developer"], default: "labour" },
  dob: Date,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  address: String,
  aadhaar_number: { type: String }, // User must provide
  pan_number: { type: String }, // User must provide
  uan_number: { type: String, default: "100900900900" },
  is_kyc_verified: { type: Boolean, default: false },
  govt_id_proof_url: String, // URL of uploaded ID image
  profile_pic_url: String,
  
  // Specific to Labour role
  skill: String, // Legacy, keep for backward compat
  skills: [String], // New array format
  saved_jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  daily_wage: Number,
  availability: { type: String, default: "available" },
  location: String,
  
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
