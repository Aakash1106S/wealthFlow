const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const insights = require('../controllers/insights.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

router.get('/', insights.getInsights);
router.get('/health-score', insights.getHealthScore);
router.get('/recurring', insights.getRecurring);

// Savings Goals
router.get('/goals', insights.getSavingsGoals);
router.post('/goals',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be positive'),
    body('deadline').isISO8601().withMessage('Valid deadline date required'),
  ],
  validate,
  insights.createSavingsGoal
);
router.put('/goals/:id', insights.updateSavingsGoal);
router.delete('/goals/:id', insights.deleteSavingsGoal);

module.exports = router;
