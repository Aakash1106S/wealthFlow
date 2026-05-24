/**
 * WealthFlow Recurring Expense Detector
 * Analyzes transaction history to identify recurring patterns.
 */

/**
 * Group transactions by approximate amount and category
 * @param {Array} transactions
 * @returns {Array} recurring candidates
 */
function detectRecurring(transactions) {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  // Group by category + approximate amount (±15%)
  const groups = {};

  expenseTransactions.forEach(t => {
    const amount = t.amount;
    const category = t.category;
    const note = (t.notes || t.note || '').toLowerCase();

    // Create a bucket key — round to nearest 100 for grouping
    const amountBucket = Math.round(amount / 100) * 100;
    const key = `${category}_${amountBucket}`;

    if (!groups[key]) {
      groups[key] = {
        category,
        amountBucket,
        transactions: [],
        keywords: [],
      };
    }
    groups[key].transactions.push(t);

    // Extract meaningful keywords from notes
    const keywords = note.split(/\s+/).filter(w => w.length > 3);
    groups[key].keywords.push(...keywords);
  });

  const recurringCandidates = [];

  for (const [key, group] of Object.entries(groups)) {
    const txns = group.transactions;
    if (txns.length < 2) continue;

    // Sort by date
    txns.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Check if transactions appear in different months
    const months = [...new Set(txns.map(t => {
      const d = t.date instanceof Date ? t.date : new Date(t.date);
      return d.toISOString().slice(0, 7);
    }))];

    if (months.length < 2) continue;

    // Calculate average interval in days
    const dates = txns.map(t => new Date(t.date));
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Determine frequency
    let frequency = null;
    let confidenceScore = 0;

    if (avgInterval >= 25 && avgInterval <= 35) {
      frequency = 'monthly';
      confidenceScore = Math.min(100, 60 + (months.length * 10));
    } else if (avgInterval >= 5 && avgInterval <= 9) {
      frequency = 'weekly';
      confidenceScore = Math.min(100, 50 + (txns.length * 8));
    } else if (avgInterval >= 85 && avgInterval <= 95) {
      frequency = 'quarterly';
      confidenceScore = Math.min(100, 55 + (months.length * 8));
    } else if (avgInterval >= 360 && avgInterval <= 370) {
      frequency = 'yearly';
      confidenceScore = Math.min(100, 70 + (txns.length * 10));
    }

    if (!frequency || confidenceScore < 50) continue;

    // Find most common note/title
    const noteFreq = {};
    txns.forEach(t => {
      const n = t.notes || t.note || t.title || '';
      if (n) noteFreq[n] = (noteFreq[n] || 0) + 1;
    });
    const commonNote = Object.entries(noteFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || group.category;

    // Calculate next due date
    const lastDate = dates[dates.length - 1];
    const nextDue = new Date(lastDate);
    if (frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
    else if (frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
    else if (frequency === 'quarterly') nextDue.setMonth(nextDue.getMonth() + 3);
    else if (frequency === 'yearly') nextDue.setFullYear(nextDue.getFullYear() + 1);

    // Average amount
    const avgAmount = txns.reduce((sum, t) => sum + t.amount, 0) / txns.length;

    recurringCandidates.push({
      title: commonNote,
      amount: Math.round(avgAmount),
      category: group.category,
      frequency,
      nextDue,
      lastSeen: lastDate,
      confidenceScore: Math.round(confidenceScore),
      occurrences: txns.length,
      autoDetected: true,
      paymentMethod: txns[txns.length - 1].paymentMethod || 'card',
    });
  }

  // Sort by confidence score descending
  recurringCandidates.sort((a, b) => b.confidenceScore - a.confidenceScore);

  // Remove duplicates (same title + similar amount)
  const seen = new Set();
  return recurringCandidates.filter(c => {
    const key = `${c.title.slice(0, 20)}_${c.frequency}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Get monthly total for recurring expenses
 * @param {Array} recurringExpenses
 * @returns {number}
 */
function getMonthlyRecurringTotal(recurringExpenses) {
  return recurringExpenses.filter(r => r.isActive).reduce((sum, r) => {
    switch (r.frequency) {
      case 'daily': return sum + r.amount * 30;
      case 'weekly': return sum + r.amount * 4.33;
      case 'monthly': return sum + r.amount;
      case 'quarterly': return sum + r.amount / 3;
      case 'yearly': return sum + r.amount / 12;
      default: return sum + r.amount;
    }
  }, 0);
}

module.exports = { detectRecurring, getMonthlyRecurringTotal };
