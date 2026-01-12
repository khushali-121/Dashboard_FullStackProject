const LiveProject = require("../models/LiveProject");

exports.createProject = async (req, res) => {
  try {
    const {
      studentCount,
      certificateDistributed,
      ...rest
    } = req.body;

    const payload = {
      ...rest,
      studentsCount: Number(studentCount),
      certificate: certificateDistributed === "Yes"
    };

    const project = await LiveProject.create(payload);
    res.status(201).json(project);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ message: "Create failed" });
  }
};

// SUMMARY/DASHBOARD
exports.getLiveProjectSummary = async (req, res) => {
  try {
    const total = await LiveProject.countDocuments();

    const running = await LiveProject.countDocuments({ status: "Running" });
    const completed = await LiveProject.countDocuments({ status: "Completed" });

    const certificatesDistributed = await LiveProject.countDocuments({ certificate: true });
    const certificatesPending = await LiveProject.countDocuments({ certificate: false });

    res.json({
      totalProjects: total,
      runningProjects: running,
      completedProjects: completed,
      certificates: {
        distributed: certificatesDistributed,
        pending: certificatesPending
      }
    });

  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ message: "Failed to load summary" });
  }
};

exports.getLiveProjectFilters = async (req, res) => {
  try {
    const universities = await LiveProject.distinct("university");
    const programs = await LiveProject.distinct("program");
    const batches = await LiveProject.distinct("batch");
    const groups = await LiveProject.distinct("group");
    const statuses = await LiveProject.distinct("status");

    res.json({
      universities,
      programs,
      batches,
      groups,
      statuses
    });

  } catch (err) {
    console.error("FILTER ERROR:", err);
    res.status(500).json({ message: "Failed to load filters" });
  }
};


// GET ALL + FILTER
exports.getProjects = async (req, res) => {
  try {
    const {
      university,
      program,
      batch,
      group,
      status,
      search
    } = req.query;

    let query = {};

    if (university) query.university = university;
    if (program) query.program = program;
    if (batch) query.batch = batch;
    if (group) query.group = group;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { university: new RegExp(search, "i") },
        { program: new RegExp(search, "i") },
        { batch: new RegExp(search, "i") },
        { group: new RegExp(search, "i") },
        { projectTitle: new RegExp(search, "i") },
        { facultyCoordinator: new RegExp(search, "i") },
        { industryExpert: new RegExp(search, "i") }
      ];
    }

    const projects = await LiveProject.find(query).sort({ createdAt: -1 });
    res.json(projects);

  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
};


// GET BY ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await LiveProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
};

// UPDATE
exports.updateProject = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      studentsCount: req.body.studentCount,
      certificate: req.body.certificateDistributed === "Yes"
    };

    const project = await LiveProject.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE
exports.deleteProject = async (req, res) => {
  await LiveProject.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

// DASHBOARD STATS
exports.projectStats = async (req, res) => {
  try {
    const total = await LiveProject.countDocuments();

    const data = await LiveProject.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = data.map(d => ({
      status: d._id,
      count: d.count,
      percentage: total === 0
        ? 0
        : Number(((d.count / total) * 100).toFixed(2))
    }));

    res.json({ total, stats });
  } catch {
    res.status(500).json({ message: "Stats failed" });
  }
};

// CHECK COMPLETION
exports.checkProjectCompletion = async (req, res) => {
  try {
    const project = await LiveProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      projectId: project._id,
      projectTitle: project.projectTitle,
      status: project.status,
      certificateEligible: project.status === "Completed"
    });
  } catch {
    res.status(400).json({ message: "Invalid project ID" });
  }
};
