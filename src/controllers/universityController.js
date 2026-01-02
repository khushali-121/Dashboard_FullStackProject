const UniversityProgram = require("../models/UniversityProgram");

/**
 * CREATE
 */
exports.createProgram = async (req, res) => {
  const data = await UniversityProgram.create(req.body);
  res.status(201).json(data);
};

/**
 * READ (Search + Status + Date Filters)
 */
exports.getPrograms = async (req, res) => {
  try {
    const {
      search,
      status,
      dateFilter,
      startDate,
      endDate
    } = req.query;

    let query = {};

    /* ---------- STATUS FILTER ---------- */
    if (status && status !== "All") {
      query.status = status;
    }

    /* ---------- SEARCH FILTER ---------- */
    if (search) {
      query.$or = [
        { university: { $regex: search, $options: "i" } },
        { programs: { $regex: search, $options: "i" } },
        { responsiblePerson: { $regex: search, $options: "i" } }
      ];
    }

    /* ---------- DEADLINE BASED FILTER ---------- */
    if (dateFilter && dateFilter !== "all") {
      let fromDate;
      let toDate = new Date();

      if (dateFilter === "today") {
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
      }

      if (dateFilter === "week") {
        fromDate = new Date();
        toDate = new Date();
        toDate.setDate(toDate.getDate() + 7);
      }

      if (dateFilter === "month") {
        fromDate = new Date();
        toDate = new Date();
        toDate.setMonth(toDate.getMonth() + 1);
      }

      if (dateFilter === "custom") {
        if (!startDate || !endDate) {
          return res.status(400).json({
            message: "startDate and endDate required"
          });
        }

        fromDate = new Date(startDate);
        toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
      }

      query.deadline = { $gte: fromDate, $lte: toDate };
    }

    const programs = await UniversityProgram
      .find(query)
      .sort({ deadline: 1 });

    res.json(programs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch programs" });
  }
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
