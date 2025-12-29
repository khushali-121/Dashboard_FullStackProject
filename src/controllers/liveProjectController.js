const LiveProject = require("../models/LiveProject");

// CREATE
exports.createProject = async (req, res) => {
  try {
    const project = await LiveProject.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Create failed" });
  }
};

// GET ALL + FILTER
exports.getProjects = async (req, res) => {
  try {
    const { university, program, batch, status, search } = req.query;

    let query = {};
    if (university) query.university = university;
    if (program) query.program = program;
    if (batch) query.batch = batch;
    if (status) query.status = status;

    if (search) {
      query.projectTitle = new RegExp(search, "i");
    }

    const projects = await LiveProject.find(query);
    res.json(projects);
  } catch {
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
  const project = await LiveProject.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(project);
};

// DELETE
exports.deleteProject = async (req, res) => {
  await LiveProject.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

// DASHBOARD STATS (MISSING FUNCTION – ROOT CAUSE)
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
