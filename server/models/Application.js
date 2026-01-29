const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contractor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["applied", "accepted", "rejected"], default: "applied" },
  applied_at: { type: Date, default: Date.now },
  cover_letter: String
});

module.exports = mongoose.model("Application", ApplicationSchema);
