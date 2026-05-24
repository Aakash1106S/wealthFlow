/**
 * WealthFlow Financial Health Score Engine
 * Computes a 0-100 score based on 5 financial factors.
 */

function getMonthStr(monthsAgo = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().slice(0, 7);
}

function getMonthTotal(transactions, month, type) {
  return transactions
    .filter(t => {
      const tDate = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === type && tDate.toISOString().slice(0, 7) === month;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate Financial Health Score (0–100)
 * @param {Array} transactions
 * @param {Array} budgets
 * @returns {{ score, grade, factors, recommendations }}
 */
function calculateHealthScore(transactions, budgets = []) {
  const scores = {};
  const recommendations = [];

  // ── Factor 1: Savings Rate (30 points) ──────────────────────────────────
  let savingsScore = 0;
  const months = [0, 1, 2];
  const savingsRates = months.map(mAgo => {
    const m = getMonthStr(mAgo);
    const inc = getMonthTotal(transactions, m, 'income');
    const exp = getMonthTotal(transactions, m, 'expense');
    if (inc === 0) return null;
    return Math.max(0, ((inc - exp) / inc) * 100);
  }).filter(r => r !== null);

  if (savingsRates.length > 0) {
    const avgSavingsRate = savingsRates.reduce((a, b) => a + b, 0) / savingsRates.length;
    if (avgSavingsRate >= 30) savingsScore = 30;
    else if (avgSavingsRate >= 20) savingsScore = 25;
    else if (avgSavingsRate >= 10) savingsScore = 15;
    else if (avgSavingsRate >= 5) savingsScore = 8;
    else savingsScore = 2;

    if (avgSavingsRate < 20) {
      recommendations.push({
        icon: '💰',
        text: `Increase your savings rate to at least 20%. Your current average is ${avgSavingsRate.toFixed(1)}%.`,
        impact: 'high',
      });
    }
  }
  scores.savingsRate = { score: savingsScore, max: 30, label: 'Savings Rate' };

  // ── Factor 2: Budget Adherence (25 points) ──────────────────────────────
  let budgetScore = 0;
  const currentMonth = getMonthStr(0);

  if (budgets.length === 0) {
    budgetScore = 10; // No budgets set — neutral
    recommendations.push({
      icon: '🎯',
      text: 'Set monthly budgets for your spending categories to track and control expenses better.',
      impact: 'high',
    });
  } else {
    // Get spending per category for current month
    const catSpend = {};
    transactions
      .filter(t => {
        const tDate = t.date instanceof Date ? t.date : new Date(t.date);
        return t.type === 'expense' && tDate.toISOString().slice(0, 7) === currentMonth;
      })
      .forEach(t => { catSpend[t.category] = (catSpend[t.category] || 0) + t.amount; });

    const adherent = budgets.filter(b => {
      const spent = catSpend[b.category] || 0;
      return spent <= b.limit;
    }).length;

    const ratio = adherent / budgets.length;
    budgetScore = Math.round(ratio * 25);

    if (ratio < 0.7) {
      const overBudgetCats = budgets
        .filter(b => (catSpend[b.category] || 0) > b.limit)
        .map(b => b.category).join(', ');
      recommendations.push({
        icon: '📊',
        text: `You're over budget in: ${overBudgetCats}. Reduce spending in these areas.`,
        impact: 'medium',
      });
    }
  }
  scores.budgetAdherence = { score: budgetScore, max: 25, label: 'Budget Adherence' };

  // ── Factor 3: Expense Consistency (20 points) ────────────────────────────
  let consistencyScore = 0;
  const monthlyExpenses = [0, 1, 2, 3].map(mAgo => getMonthTotal(transactions, getMonthStr(mAgo), 'expense'));
  const validExpenses = monthlyExpenses.filter(e => e > 0);

  if (validExpenses.length >= 2) {
    const avg = validExpenses.reduce((a, b) => a + b, 0) / validExpenses.length;
    const variance = validExpenses.map(e => Math.pow(e - avg, 2)).reduce((a, b) => a + b, 0) / validExpenses.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? (stdDev / avg) : 1; // Coefficient of variation

    if (cv < 0.1) consistencyScore = 20;
    else if (cv < 0.2) consistencyScore = 16;
    else if (cv < 0.35) consistencyScore = 11;
    else if (cv < 0.5) consistencyScore = 6;
    else {
      consistencyScore = 2;
      recommendations.push({
        icon: '📉',
        text: 'Your monthly expenses vary significantly. Try to maintain consistent spending habits.',
        impact: 'medium',
      });
    }
  } else {
    consistencyScore = 10; // Neutral for new users
  }
  scores.expenseConsistency = { score: consistencyScore, max: 20, label: 'Expense Consistency' };

  // ── Factor 4: Emergency Buffer Signal (15 points) ────────────────────────
  let bufferScore = 0;
  const totalIncome = [0, 1, 2].reduce((sum, mAgo) => sum + getMonthTotal(transactions, getMonthStr(mAgo), 'income'), 0);
  const avgMonthlyExpenses = [0, 1, 2].reduce((sum, mAgo) => sum + getMonthTotal(transactions, getMonthStr(mAgo), 'expense'), 0) / 3;
  const totalBalance = transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);

  if (avgMonthlyExpenses > 0) {
    const monthsCovered = totalBalance / avgMonthlyExpenses;
    if (monthsCovered >= 6) bufferScore = 15;
    else if (monthsCovered >= 3) bufferScore = 11;
    else if (monthsCovered >= 1) bufferScore = 6;
    else {
      bufferScore = 1;
      recommendations.push({
        icon: '🏦',
        text: 'Build an emergency fund covering 3-6 months of expenses. This protects against unexpected events.',
        impact: 'high',
      });
    }
  }
  scores.emergencyBuffer = { score: bufferScore, max: 15, label: 'Emergency Buffer' };

  // ── Factor 5: Debt & Recurring Control (10 points) ───────────────────────
  let recurringScore = 10;
  const currentCatExpenses = {};
  transactions
    .filter(t => {
      const tDate = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === 'expense' && tDate.toISOString().slice(0, 7) === currentMonth;
    })
    .forEach(t => { currentCatExpenses[t.category] = (currentCatExpenses[t.category] || 0) + t.amount; });

  const currentTotalExpenses = Object.values(currentCatExpenses).reduce((a, b) => a + b, 0);
  const billsAmount = currentCatExpenses['Bills'] || 0;
  const currentIncomeVal = getMonthTotal(transactions, currentMonth, 'income');

  if (currentIncomeVal > 0) {
    const billsRatio = billsAmount / currentIncomeVal;
    if (billsRatio > 0.5) {
      recurringScore = 3;
      recommendations.push({
        icon: '📋',
        text: `Your bills/recurring costs are ${(billsRatio * 100).toFixed(0)}% of income. Look for ways to reduce fixed expenses.`,
        impact: 'medium',
      });
    } else if (billsRatio > 0.35) {
      recurringScore = 6;
    }
  }
  scores.recurringControl = { score: recurringScore, max: 10, label: 'Recurring Control' };

  // ── Total Score ──────────────────────────────────────────────────────────
  const totalScore = Object.values(scores).reduce((sum, f) => sum + f.score, 0);

  let grade, gradeColor, gradeLabel;
  if (totalScore >= 85) { grade = 'A+'; gradeColor = '#00d4aa'; gradeLabel = 'Excellent'; }
  else if (totalScore >= 75) { grade = 'A'; gradeColor = '#10b981'; gradeLabel = 'Very Good'; }
  else if (totalScore >= 65) { grade = 'B'; gradeColor = '#4a9eff'; gradeLabel = 'Good'; }
  else if (totalScore >= 50) { grade = 'C'; gradeColor = '#f59e0b'; gradeLabel = 'Fair'; }
  else if (totalScore >= 35) { grade = 'D'; gradeColor = '#f97316'; gradeLabel = 'Needs Work'; }
  else { grade = 'F'; gradeColor = '#ff4757'; gradeLabel = 'Critical'; }

  return {
    score: totalScore,
    grade,
    gradeColor,
    gradeLabel,
    factors: scores,
    recommendations: recommendations.slice(0, 4),
  };
}

module.exports = { calculateHealthScore };
