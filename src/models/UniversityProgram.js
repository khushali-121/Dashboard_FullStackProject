const mongoose = require("mongoose");

const universityProgramSchema = new mongoose.Schema({
  university: String,
  program: String,
  currentStatus: String,
  issues: String,
  proposedAction: String,
  responsiblePerson: String,
  deadline: Date,
  keyUpdates: String,
  status: {
    type: String,
    enum: ["Completed", "On Track", "Delayed", "At Risk"]
  }
}, { timestamps: true });

module.exports = mongoose.model("UniversityProgram", universityProgramSchema);
