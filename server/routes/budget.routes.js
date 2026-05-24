const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const budget = require('../controllers/budget.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

router.get('/', budget.getBudgets);

router.post('/',
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('limit').isFloat({ min: 1 }).withMessage('Limit must be positive'),
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be YYYY-MM format'),
  ],
  validate,
  budget.createBudget
);

router.put('/:id',
  [body('limit').optional().isFloat({ min: 1 })],
  validate,
  budget.updateBudget
);

router.delete('/:id', budget.deleteBudget);

module.exports = router;
