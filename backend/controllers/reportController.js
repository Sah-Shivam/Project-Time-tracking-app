const TimeEntry = require('../models/TimeEntry');
const User = require('../models/User');
const Project = require('../models/Project');



exports.generateReport = async (req, res) => {
  try {
    const { month, year, projectId, userId } = req.query;
    const query = {};

    // Ensure date range is defined if month and year provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by optional project and user
    if (projectId) query.project = projectId;
    if (userId) query.user = userId;

    // Query and enrich entries
    const entries = await TimeEntry.find(query)
      .populate('user', 'name')
      .populate('project', 'title');

    // Create structured report: { projectName: { userName: totalHours } }
    const report = {};
    for (const entry of entries) {
      const projectName = entry.project?.title || 'Unknown Project';
      const userName = entry.user?.name || 'Unknown User';

      if (!report[projectName]) report[projectName] = {};
      if (!report[projectName][userName]) report[projectName][userName] = 0;

      report[projectName][userName] += entry.hoursWorked || 0;
    }

    // Return full structured data with filters included
    res.status(200).json({
      filtersUsed: { month, year, projectId, userId },
      totalEntries: entries.length,
      reportGeneratedAt: new Date(),
      data: report
    });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to generate report',
      error: err.message
    });
  }
};

// exports.generateReport = async (req, res) => {
//   try {
//     const { month, year, projectId, userId } = req.query;
//     const query = {};

//     if (month && year) {
//       const startDate = new Date(year, month - 1, 1);
//       const endDate = new Date(year, month, 0, 23, 59, 59);
//       query.date = { $gte: startDate, $lte: endDate };
//     } else if (year) {
//       const startDate = new Date(year, 0, 1);
//       const endDate = new Date(year, 11, 31, 23, 59, 59);
//       query.date = { $gte: startDate, $lte: endDate };
//     }

//     if (projectId) query.project = projectId;
//     if (userId) query.user = userId;

//     const entries = await TimeEntry.find(query)
//       .populate('user', 'name')
//       .populate('project', 'title');

//     const report = {};

//     for (const entry of entries) {
//       const projectTitle = entry.project.title;
//       const userName = entry.user.name;

//       if (!report[projectTitle]) report[projectTitle] = {};
//       if (!report[projectTitle][userName]) report[projectTitle][userName] = 0;

//       report[projectTitle][userName] += entry.hoursWorked;
//     }

//     res.status(200).json(report);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to generate report', error: err.message });
//   }
// };
