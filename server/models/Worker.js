const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skill: { type: String, required: true },
  rate: { type: Number, required: true },
  phone: { type: String, required: true }
});

module.exports = mongoose.model("Worker", WorkerSchema);