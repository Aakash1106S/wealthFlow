const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target must be at least 1'],
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Saved amount cannot be negative'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    color: {
      type: String,
      default: '#00d4aa',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '🎯',
    },
  },
  { timestamps: true }
);

// Virtual: progress percentage
savingsGoalSchema.virtual('progress').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.savedAmount / this.targetAmount) * 100, 100);
});

// Virtual: days remaining
savingsGoalSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const diff = Math.ceil((this.deadline - now) / (1000 * 60 * 60 * 24));
  return diff;
});

savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
