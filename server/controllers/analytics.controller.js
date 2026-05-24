const Transaction = require('../models/Transaction.model');
const Budget = require('../models/Budget.model');
const mongoose = require('mongoose');

// ─── OVERVIEW (Dashboard Summary) ────────────────────────────────────────
exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    const [year, mon] = currentMonth.split('-').map(Number);
    const lastYear = mon === 1 ? year - 1 : year;
    const lastMon = mon === 1 ? 12 : mon - 1;

    // All-time totals
    const allTimeSummary = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const totalIncome = allTimeSummary.find(s => s._id === 'income')?.total || 0;
    const totalExpenses = allTimeSummary.find(s => s._id === 'expense')?.total || 0;
    const totalBalance = totalIncome - totalExpenses;
    const totalTransactions = allTimeSummary.reduce((sum, s) => sum + s.count, 0);

    // Current month
    const currentMonthSummary = await Transaction.aggregate([
      { $match: { userId, date: { $gte: new Date(year, mon - 1, 1), $lt: new Date(year, mon, 1) } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const currentIncome = currentMonthSummary.find(s => s._id === 'income')?.total || 0;
    const currentExpenses = currentMonthSummary.find(s => s._id === 'expense')?.total || 0;
    const savingsRate = currentIncome > 0 ? Math.max(0, ((currentIncome - currentExpenses) / currentIncome) * 100) : 0;

    // Last month for trend comparison
    const lastMonthSummary = await Transaction.aggregate([
      { $match: { userId, date: { $gte: new Date(lastYear, lastMon - 1, 1), $lt: new Date(lastYear, lastMon, 1) } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const lastIncome = lastMonthSummary.find(s => s._id === 'income')?.total || 0;
    const lastExpenses = lastMonthSummary.find(s => s._id === 'expense')?.total || 0;

    const incomeTrend = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseTrend = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalBalance,
        totalIncome,
        totalExpenses,
        totalTransactions,
        currentMonth: { income: currentIncome, expenses: currentExpenses, savings: currentIncome - currentExpenses, savingsRate },
        trends: { income: incomeTrend, expenses: expenseTrend },
        currentMonthStr: currentMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── MONTHLY SUMMARY (6 months) ──────────────────────────────────────────
exports.getMonthly = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const months = Number(req.query.months) || 6;
    const now = new Date();

    const monthsData = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const mon = d.getMonth() + 1;

      const summary = await Transaction.aggregate([
        {
          $match: {
            userId,
            date: { $gte: new Date(year, mon - 1, 1), $lt: new Date(year, mon, 1) },
          },
        },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]);

      const income = summary.find(s => s._id === 'income')?.total || 0;
      const expenses = summary.find(s => s._id === 'expense')?.total || 0;

      monthsData.push({
        month: `${year}-${String(mon).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        income,
        expenses,
        savings: income - expenses,
      });
    }

    res.json({ success: true, data: monthsData });
  } catch (error) {
    next(error);
  }
};

// ─── CATEGORY BREAKDOWN ───────────────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;
    const now = new Date();
    const targetMonth = month || now.toISOString().slice(0, 7);
    const [year, mon] = targetMonth.split('-').map(Number);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: new Date(year, mon - 1, 1), $lt: new Date(year, mon, 1) },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalExpenses = breakdown.reduce((sum, b) => sum + b.total, 0);
    const data = breakdown.map(b => ({
      category: b._id,
      total: b.total,
      count: b.count,
      percentage: totalExpenses > 0 ? ((b.total / totalExpenses) * 100).toFixed(1) : '0',
    }));

    res.json({ success: true, data, totalExpenses, month: targetMonth });
  } catch (error) {
    next(error);
  }
};

// ─── HEATMAP DATA (daily spending) ───────────────────────────────────────
exports.getHeatmap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;
    const now = new Date();
    const targetMonth = month || now.toISOString().slice(0, 7);
    const [year, mon] = targetMonth.split('-').map(Number);

    const dailyData = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: new Date(year, mon - 1, 1), $lt: new Date(year, mon, 1) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Fill all days of month
    const daysInMonth = new Date(year, mon, 0).getDate();
    const heatmap = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const key = `${targetMonth}-${String(i).padStart(2, '0')}`;
      heatmap[key] = { total: 0, count: 0 };
    }
    dailyData.forEach(d => {
      if (heatmap[d._id] !== undefined) {
        heatmap[d._id] = { total: d.total, count: d.count };
      }
    });

    res.json({ success: true, data: heatmap, month: targetMonth });
  } catch (error) {
    next(error);
  }
};
