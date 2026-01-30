const mongoose = require("mongoose");

const HireRequestSchema = new mongoose.Schema({
  contractor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job_type: { type: String, required: true }, // e.g., 'Full Time', 'Daily'
  message: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("HireRequest", HireRequestSchema);
