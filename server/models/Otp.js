const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  created_at: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 minutes (300 seconds)
});

module.exports = mongoose.model("Otp", OtpSchema);
