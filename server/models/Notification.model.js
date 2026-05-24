const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'budget_warning',   // Approaching budget limit
        'budget_exceeded',  // Over budget
        'savings_milestone',// Savings goal reached/milestone
        'recurring_due',    // Recurring payment due soon
        'high_spending',    // Unusual spending spike
        'low_savings',      // Savings rate too low
        'weekly_summary',   // Weekly financial summary
        'goal_completed',   // Savings goal completed
        'system',           // General system notifications
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    icon: {
      type: String,
      default: '🔔',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

// Index for fetching unread notifications efficiently
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
