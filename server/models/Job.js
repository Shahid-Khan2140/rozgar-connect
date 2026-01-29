const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  contractor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for open jobs
  title: { type: String, required: true },
  description: String,
  location: String,
  wage: Number,
  wage_type: { type: String, enum: ["hourly", "daily", "monthly", "fixed"], default: "daily" },
  category: { type: String, default: "General" },
  tags: [String],
  status: { type: String, default: "open" }, // open, assigned, completed, cancelled
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", JobSchema);
