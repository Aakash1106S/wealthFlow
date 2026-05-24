const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food', 'Travel', 'Shopping', 'Health', 'Education',
        'Bills', 'Entertainment', 'Salary', 'Freelance', 'Business',
        'Investment', 'Others'
      ],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking', 'wallet', 'cheque'],
      default: 'cash',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    // Legacy field support (note → notes)
    note: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringExpense',
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast filtering by user + date range
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });

// Virtual: formatted date string (YYYY-MM-DD)
transactionSchema.virtual('dateStr').get(function () {
  return this.date.toISOString().slice(0, 10);
});

// Normalize: use 'notes' field, fallback to 'note'
transactionSchema.virtual('displayNote').get(function () {
  return this.notes || this.note || '';
});

module.exports = mongoose.model('Transaction', transactionSchema);
