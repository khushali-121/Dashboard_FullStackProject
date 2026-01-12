const mongoose = require("mongoose");

const liveProjectSchema = new mongoose.Schema({
  university: { type: String, required: true },
  program: { type: String, required: true },
  batch: { type: String, required: true },
  group: { type: String, required: true },

  projectTitle: { type: String, required: true },

  studentsCount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["Running", "On Track", "Delayed", "Completed", "At Risk"],
    default: "Running"
  },

  facultyCoordinator: { type: String, required: true },
  industryExpert: { type: String, required: true },

  certificate: { type: Boolean, default: false },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }

}, { timestamps: true });

module.exports = mongoose.model("LiveProject", liveProjectSchema);
