const mongoose = require("mongoose");

const SchemeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  benefits: [String], // Array of benefits (e.g. "₹5000 subsidy")
  eligibility: String,
  type: { type: String, enum: ["Urban", "Rural", "General"], default: "General" },
  link: { type: String }, // External link
  board: { type: String, enum: ["GLWB", "GRWWB", "Labour Dept", "GBOCWWB", "eShram", "Govt"], default: "GLWB" },
  target_group: { type: String, enum: ["Labour", "Contractor", "Both"], default: "Labour" },
  documents: [String], // List of required docs
  status: { type: String, default: "Active" },
  source_name: { type: String }, // e.g. "glwb.gujarat.gov.in"
  last_checked: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Scheme", SchemeSchema);
