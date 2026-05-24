const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const tx = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

// Get all (with filters, pagination, sort)
router.get('/', tx.getTransactions);

// Create
router.post('/',
  [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  tx.createTransaction
);

// Bulk import
router.post('/bulk-import', tx.bulkImport);

// Update
router.put('/:id',
  [
    body('amount').optional().isFloat({ min: 0.01 }),
    body('type').optional().isIn(['income', 'expense']),
    body('date').optional().isISO8601(),
  ],
  validate,
  tx.updateTransaction
);

// Delete
router.delete('/:id', tx.deleteTransaction);

module.exports = router;
