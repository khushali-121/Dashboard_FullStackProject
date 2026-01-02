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
      university,
      dateFilter,   // today | week | month | custom
      startDate,    // for custom range
      endDate
    } = req.query;

    let query = {};

    /* ---------------- STATUS FILTER ---------------- */
    if (status && status !== "All") {
      query.status = status;
    }

    /* ---------------- UNIVERSITY FILTER ---------------- */
    if (university) {
      query.university = university;
    }

    /* ---------------- SEARCH FILTER ---------------- */
    if (search) {
      query.$or = [
        { university: { $regex: search, $options: "i" } },
        { program: { $regex: search, $options: "i" } },
        { responsiblePerson: { $regex: search, $options: "i" } }
      ];
    }

    /* ---------------- DATE FILTER ---------------- */
    if (dateFilter) {
      const now = new Date();
      let fromDate;

      if (dateFilter === "today") {
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        query.createdAt = { $gte: fromDate };
      }

      if (dateFilter === "week") {
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
        query.createdAt = { $gte: fromDate };
      }

      if (dateFilter === "month") {
        fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 1);
        query.createdAt = { $gte: fromDate };
      }

      if (dateFilter === "custom" && startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
    }

    const programs = await UniversityProgram
      .find(query)
      .sort({ createdAt: -1 });

    res.json(programs);

  } catch (error) {
    console.error(error);
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
