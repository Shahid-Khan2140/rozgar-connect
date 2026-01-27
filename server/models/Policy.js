const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  date_posted: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Policy", PolicySchema);
