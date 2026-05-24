const Budget = require('../models/Budget.model');
const Transaction = require('../models/Transaction.model');

// Helper: compute spent for a budget
async function computeSpent(userId, category, month) {
  const [year, mon] = month.split('-').map(Number);
  const result = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        category,
        date: { $gte: new Date(year, mon - 1, 1), $lt: new Date(year, mon, 1) },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
}

// ─── GET BUDGETS ──────────────────────────────────────────────────────────
exports.getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query;
    const filter = { userId: req.user._id };
    if (month) filter.month = month;

    const budgets = await Budget.find(filter).sort({ category: 1 }).lean();

    // Attach live spent amounts
    const withSpent = await Promise.all(
      budgets.map(async (b) => {
        const spent = await computeSpent(req.user._id, b.category, b.month);
        return { ...b, spent, id: b._id.toString() };
      })
    );

    res.json({ success: true, data: withSpent });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE BUDGET ────────────────────────────────────────────────────────
exports.createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, alertAt } = req.body;

    // Upsert: if budget for same category+month exists, update limit
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month },
      { limit: Number(limit), alertAt: alertAt || 90, alertSent: false },
      { new: true, upsert: true, runValidators: true }
    );

    const spent = await computeSpent(req.user._id, category, month);
    res.status(201).json({ success: true, data: { ...budget.toObject(), spent, id: budget._id.toString() }, message: 'Budget set!' });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE BUDGET ────────────────────────────────────────────────────────
exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found.' });

    if (req.body.limit) budget.limit = Number(req.body.limit);
    if (req.body.category) budget.category = req.body.category;
    if (req.body.month) budget.month = req.body.month;
    if (req.body.alertAt) budget.alertAt = Number(req.body.alertAt);
    budget.alertSent = false; // Reset alert when limit is updated
    await budget.save();

    const spent = await computeSpent(req.user._id, budget.category, budget.month);
    res.json({ success: true, data: { ...budget.toObject(), spent, id: budget._id.toString() }, message: 'Budget updated!' });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE BUDGET ────────────────────────────────────────────────────────
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found.' });
    res.json({ success: true, message: 'Budget removed.' });
  } catch (error) {
    next(error);
  }
};
