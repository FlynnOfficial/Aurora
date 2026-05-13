const { Router } = require('express');
const AdminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard-stats', AdminController.getDashboardStats);

module.exports = router;