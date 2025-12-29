const UniversityProgram = require("../models/UniversityProgram");

/**
 * CREATE
 */
exports.createProgram = async (req, res) => {
  const data = await UniversityProgram.create(req.body);
  res.status(201).json(data);
};

/**
 * READ (with search + filters)
 */
exports.getPrograms = async (req, res) => {
  const { status, university, search } = req.query;

  let query = {};

  if (status) query.status = status;
  if (university) query.university = university;

  if (search) {
    query.$or = [
      { university: new RegExp(search, "i") },
      { program: new RegExp(search, "i") },
      { responsiblePerson: new RegExp(search, "i") }
    ];
  }

  const programs = await UniversityProgram.find(query).sort({ createdAt: -1 });
  res.json(programs);
};

/**
 * UPDATE
 */
exports.updateProgram = async (req, res) => {
  const updated = await UniversityProgram.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

/**
 * DELETE
 */
exports.deleteProgram = async (req, res) => {
  await UniversityProgram.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};

/**
 * PIE CHART CALCULATION (Overview Page)
 */
exports.programStats = async (req, res) => {
  try {
    const { university } = req.query;

    let matchStage = {};

    if (university) {
      matchStage.university = university;
    }

    const total = await UniversityProgram.countDocuments(matchStage);

    const stats = await UniversityProgram.aggregate([
      { $match: matchStage },  
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = stats.map(item => ({
      status: item._id,
      count: item.count,
      percentage: total === 0
        ? 0
        : Number(((item.count / total) * 100).toFixed(2))
    }));

    res.json({
      total,
      stats: formattedStats
    });

  } catch (error) {
    res.status(500).json({ message: "Stats calculation failed" });
  }
};
