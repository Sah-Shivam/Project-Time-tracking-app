const router = require('express').Router();
const {
  addTimeEntry,
  getTimeEntries,
  updateTimeEntry
} = require('../controllers/timeEntryController');

router.post('/', addTimeEntry);
router.get('/', getTimeEntries);
router.put('/:id', updateTimeEntry);


module.exports = router;
