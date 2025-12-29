const mongoose = require("mongoose");

const liveProjectSchema = new mongoose.Schema({
  university: String,
  program: String,
  batch: String,
  group: String,
  projectTitle: String,
  studentsCount: Number,
  status: String,
  facultyCoordinator: String,
  industryExpert: String,
  certificate: Boolean,
  duration: String
}, { timestamps: true });

module.exports = mongoose.model("LiveProject", liveProjectSchema);
