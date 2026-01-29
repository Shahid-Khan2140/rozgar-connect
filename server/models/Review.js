const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  reviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reviewee_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
