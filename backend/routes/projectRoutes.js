const router = require('express').Router();
const {
  createProject,
  updateProject,
  deleteProject,
  assignUsers,
  getProjects
} = require('../controllers/projectController');

const { roleMiddleware } = require('../middleware/authMiddleware');

router.post('/', roleMiddleware('admin'), createProject);
router.put('/:id', roleMiddleware('admin'), updateProject);
router.delete('/:id', roleMiddleware('admin'), deleteProject);
router.post('/:id/assign', roleMiddleware('admin'), assignUsers);
router.get('/', getProjects);

module.exports = router;