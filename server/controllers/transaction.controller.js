const Transaction = require('../models/Transaction.model');
const Budget = require('../models/Budget.model');
const Notification = require('../models/Notification.model');

// Helper: check and fire budget alerts
async function checkBudgetAlerts(userId, category, month) {
  try {
    const budget = await Budget.findOne({ userId, category, month });
    if (!budget) return;

    const spent = await Transaction.aggregate([
      {
        $match: {
          userId: budget.userId,
          type: 'expense',
          category,
          date: {
            $gte: new Date(`${month}-01`),
            $lt: new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1),
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spentAmount = spent[0]?.total || 0;
    const pct = (spentAmount / budget.limit) * 100;

    if (pct >= 100 && !budget.alertSent) {
      await Budget.findByIdAndUpdate(budget._id, { alertSent: true });
      await Notification.create({
        userId,
        type: 'budget_exceeded',
        title: `${category} Budget Exceeded!`,
        message: `You've exceeded your ${category} budget by ₹${(spentAmount - budget.limit).toLocaleString('en-IN')}.`,
        icon: '🚨',
        priority: 'high',
        data: { category, spent: spentAmount, limit: budget.limit },
      });
    } else if (pct >= budget.alertAt && pct < 100 && !budget.alertSent) {
      await Budget.findByIdAndUpdate(budget._id, { alertSent: true });
      await Notification.create({
        userId,
        type: 'budget_warning',
        title: `${category} Budget Warning`,
        message: `You've used ${pct.toFixed(0)}% of your ${category} budget. Only ₹${(budget.limit - spentAmount).toLocaleString('en-IN')} remaining.`,
        icon: '⚠️',
        priority: 'medium',
        data: { category, spent: spentAmount, limit: budget.limit, percentage: pct },
      });
    }
  } catch (e) {
    console.error('Budget alert check failed:', e.message);
  }
}

// ─── GET ALL TRANSACTIONS ─────────────────────────────────────────────────
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 50, type, category, paymentMethod,
      dateFrom, dateTo, search, sortBy = 'date', sortOrder = 'desc',
      month,
    } = req.query;

    const filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(year, mon - 1, 1),
        $lt: new Date(year, mon, 1),
      };
    } else if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo + 'T23:59:59');
    }

    if (search) {
      filter.$or = [
        { notes: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy === 'latest' ? 'date' : sortBy === 'oldest' ? 'date' : sortBy === 'highest' ? 'amount' : sortBy === 'lowest' ? 'amount' : sortBy]: sortOrder === 'asc' || sortBy === 'oldest' || sortBy === 'lowest' ? 1 : -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Transaction.countDocuments(filter),
    ]);

    // Normalize note field
    const normalized = transactions.map(t => ({
      ...t,
      note: t.notes || t.note || '',
    }));

    res.json({
      success: true,
      data: normalized,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE TRANSACTION ───────────────────────────────────────────────────
exports.createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, paymentMethod, date, notes, note, title, isRecurring } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: Number(amount),
      category,
      paymentMethod: paymentMethod || 'cash',
      date: date ? new Date(date) : new Date(),
      notes: notes || note || '',
      title: title || notes || note || category,
      isRecurring: isRecurring || false,
    });

    // Check budget alerts for expenses
    if (type === 'expense') {
      const month = transaction.date.toISOString().slice(0, 7);
      await checkBudgetAlerts(req.user._id, category, month);
    }

    res.status(201).json({ success: true, data: transaction, message: 'Transaction added!' });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE TRANSACTION ───────────────────────────────────────────────────
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const allowedFields = ['type', 'amount', 'category', 'paymentMethod', 'date', 'notes', 'title', 'isRecurring', 'tags'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    });
    if (req.body.note) transaction.notes = req.body.note;

    await transaction.save();

    res.json({ success: true, data: transaction, message: 'Transaction updated!' });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE TRANSACTION ───────────────────────────────────────────────────
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, message: 'Transaction deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── BULK IMPORT ──────────────────────────────────────────────────────────
exports.bulkImport = async (req, res, next) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ success: false, message: 'No transactions provided.' });
    }

    const docs = transactions.map(t => ({
      userId: req.user._id,
      type: t.type,
      amount: Number(t.amount),
      category: t.category,
      paymentMethod: t.paymentMethod || 'cash',
      date: t.date ? new Date(t.date) : new Date(),
      notes: t.notes || t.note || '',
      title: t.title || t.notes || t.note || t.category,
    }));

    const result = await Transaction.insertMany(docs, { ordered: false });
    res.status(201).json({ success: true, message: `${result.length} transactions imported!`, count: result.length });
  } catch (error) {
    next(error);
  }
};
