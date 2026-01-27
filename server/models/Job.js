const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  contractor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  description: String,
  location: String,
  wage: Number,
  status: { type: String, default: "pending" }, // pending, assigned, completed
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", JobSchema);
