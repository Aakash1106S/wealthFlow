const express = require('express');
const router = express.Router();
const analytics = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/overview', analytics.getOverview);
router.get('/monthly', analytics.getMonthly);
router.get('/categories', analytics.getCategories);
router.get('/heatmap', analytics.getHeatmap);

module.exports = router;
