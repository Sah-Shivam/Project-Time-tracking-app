const router = require('express').Router();
const { generateReport } = require('../controllers/reportController');
const { roleMiddleware } = require('../middleware/authMiddleware');

router.get('/', roleMiddleware('admin'), generateReport);

module.exports = router;
