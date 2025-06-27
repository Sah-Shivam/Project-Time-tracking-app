const router = require('express').Router();
const { register, login, getAllUsers } = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);


router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);

module.exports = router;
