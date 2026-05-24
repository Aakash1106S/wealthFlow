const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food', 'Travel', 'Shopping', 'Health', 'Education',
        'Bills', 'Entertainment', 'Others'
      ],
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Limit must be at least 1'],
    },
    month: {
      type: String, // Format: YYYY-MM
      required: [true, 'Month is required'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
    alertAt: {
      type: Number,
      default: 90, // percentage at which to alert
      min: 1,
      max: 100,
    },
  },
  { timestamps: true }
);

// Compound unique: one budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
