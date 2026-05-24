const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        'Food', 'Travel', 'Shopping', 'Health', 'Education',
        'Bills', 'Entertainment', 'Others'
      ],
      required: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    nextDue: {
      type: Date,
    },
    lastSeen: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    confidenceScore: {
      type: Number, // 0–100, auto-detected confidence
      default: 100,
    },
    autoDetected: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking', 'wallet', 'cheque'],
      default: 'card',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
