const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date: { type: Date, required: true },
  hoursWorked: { type: Number, required: true },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
