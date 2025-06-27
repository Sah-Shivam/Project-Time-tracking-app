const TimeEntry = require('../models/TimeEntry');

exports.addTimeEntry = async (req, res) => {
  try {
    const { project, date, hoursWorked, description } = req.body;
    const entry = new TimeEntry({
      user: req.user.userId,
      project,
      date,
      hoursWorked,
      description,
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to log time', error: err.message });
  }
};

exports.getTimeEntries = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user.userId };
    const entries = await TimeEntry.find(query).populate('project', 'title');
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch entries', error: err.message });
  }
};

exports.updateTimeEntry = async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Time entry not found' });
    if (entry.user.toString() !== req.user.userId) return res.status(403).json({ message: 'Unauthorized' });

    Object.assign(entry, req.body);
    await entry.save();
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update entry', error: err.message });
  }
};
