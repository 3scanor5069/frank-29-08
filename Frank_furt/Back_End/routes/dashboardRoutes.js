const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/metrics', dashboardController.getMetrics);
router.get('/monthly-sales', dashboardController.getMonthlySales);
router.get('/weekly-sales', dashboardController.getWeeklySales);
router.get('/new-users', dashboardController.getNewUsers);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/recent-users', dashboardController.getRecentUsers);

module.exports = router;