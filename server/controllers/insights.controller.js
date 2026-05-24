const Transaction = require('../models/Transaction.model');
const Budget = require('../models/Budget.model');
const RecurringExpense = require('../models/RecurringExpense.model');
const SavingsGoal = require('../models/SavingsGoal.model');
const { generateInsights } = require('../utils/aiInsights');
const { calculateHealthScore } = require('../utils/healthScore');
const { detectRecurring, getMonthlyRecurringTotal } = require('../utils/recurringDetector');

// ─── GET AI INSIGHTS ──────────────────────────────────────────────────────
exports.getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [transactions, budgets] = await Promise.all([
      Transaction.find({ userId, date: { $gte: sixMonthsAgo } }).lean(),
      Budget.find({ userId, month: now.toISOString().slice(0, 7) }).lean(),
    ]);

    const insights = generateInsights(transactions, budgets);
    res.json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
};

// ─── FINANCIAL HEALTH SCORE ───────────────────────────────────────────────
exports.getHealthScore = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [transactions, budgets] = await Promise.all([
      Transaction.find({ userId, date: { $gte: sixMonthsAgo } }).lean(),
      Budget.find({ userId }).lean(),
    ]);

    const result = calculateHealthScore(transactions, budgets);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── RECURRING EXPENSES ───────────────────────────────────────────────────
exports.getRecurring = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get manually added recurring expenses
    const manualRecurring = await RecurringExpense.find({ userId, isActive: true }).sort({ nextDue: 1 }).lean();

    // Auto-detect from transaction history
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const transactions = await Transaction.find({ userId, date: { $gte: sixMonthsAgo } }).lean();
    const autoDetected = detectRecurring(transactions);

    const monthlyTotal = getMonthlyRecurringTotal(manualRecurring);

    res.json({
      success: true,
      data: {
        manual: manualRecurring,
        autoDetected: autoDetected.slice(0, 10),
        monthlyTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── SAVINGS GOALS ────────────────────────────────────────────────────────
exports.getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

exports.createSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, savedAmount, deadline, color, icon } = req.body;
    const goal = await SavingsGoal.create({
      userId: req.user._id,
      title, targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount) || 0,
      deadline: new Date(deadline),
      color: color || '#00d4aa',
      icon: icon || '🎯',
    });
    res.status(201).json({ success: true, data: goal, message: 'Savings goal created!' });
  } catch (error) {
    next(error);
  }
};

exports.updateSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });

    Object.assign(goal, {
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.targetAmount && { targetAmount: Number(req.body.targetAmount) }),
      ...(req.body.savedAmount !== undefined && { savedAmount: Number(req.body.savedAmount) }),
      ...(req.body.deadline && { deadline: new Date(req.body.deadline) }),
      ...(req.body.color && { color: req.body.color }),
      ...(req.body.icon && { icon: req.body.icon }),
    });
    goal.completed = goal.savedAmount >= goal.targetAmount;
    await goal.save();

    res.json({ success: true, data: goal, message: 'Goal updated!' });
  } catch (error) {
    next(error);
  }
};

exports.deleteSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, message: 'Goal deleted.' });
  } catch (error) {
    next(error);
  }
};
