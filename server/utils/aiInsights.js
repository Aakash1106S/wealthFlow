/**
 * WealthFlow AI Insights Engine
 * Pure rule-based financial analysis — no external API needed.
 * Generates human-readable insights from transaction data.
 */

/**
 * Get month string YYYY-MM for n months ago
 */
function getMonthStr(monthsAgo = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().slice(0, 7);
}

/**
 * Get total for a type in a month from transactions array
 */
function getMonthTotal(transactions, month, type) {
  return transactions
    .filter(t => {
      const tDate = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === type && tDate.toISOString().slice(0, 7) === month;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get category totals for a month
 */
function getCategoryTotals(transactions, month, type = 'expense') {
  const totals = {};
  transactions
    .filter(t => {
      const tDate = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === type && tDate.toISOString().slice(0, 7) === month;
    })
    .forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
  return totals;
}

/**
 * Generate AI-powered financial insights
 * @param {Array} transactions - All transactions for this user
 * @param {Array} budgets - Current month budgets
 * @returns {Array} insights array
 */
function generateInsights(transactions, budgets = []) {
  const insights = [];
  const currentMonth = getMonthStr(0);
  const lastMonth = getMonthStr(1);
  const twoMonthsAgo = getMonthStr(2);

  const currentIncome = getMonthTotal(transactions, currentMonth, 'income');
  const currentExpenses = getMonthTotal(transactions, currentMonth, 'expense');
  const lastIncome = getMonthTotal(transactions, lastMonth, 'income');
  const lastExpenses = getMonthTotal(transactions, lastMonth, 'expense');
  const prevExpenses = getMonthTotal(transactions, twoMonthsAgo, 'expense');

  const currentCats = getCategoryTotals(transactions, currentMonth);
  const lastCats = getCategoryTotals(transactions, lastMonth);

  // ─── 1. OVERALL SPENDING CHANGE ───────────────────────────────────────────
  if (lastExpenses > 0) {
    const change = ((currentExpenses - lastExpenses) / lastExpenses) * 100;
    if (change > 20) {
      insights.push({
        type: 'warning',
        icon: '📈',
        title: 'Spending Spike Detected',
        message: `Your total expenses increased by ${change.toFixed(0)}% compared to last month. Consider reviewing your discretionary spending.`,
        priority: 'high',
      });
    } else if (change < -15) {
      insights.push({
        type: 'success',
        icon: '🎉',
        title: 'Great Spending Control!',
        message: `You've reduced your expenses by ${Math.abs(change).toFixed(0)}% vs last month. Keep it up!`,
        priority: 'low',
      });
    }
  }

  // ─── 2. CATEGORY SPIKE ANALYSIS ───────────────────────────────────────────
  const spikeCats = [];
  for (const [cat, amount] of Object.entries(currentCats)) {
    const lastAmount = lastCats[cat] || 0;
    if (lastAmount > 0) {
      const pct = ((amount - lastAmount) / lastAmount) * 100;
      if (pct > 30) {
        spikeCats.push({ cat, pct, amount, lastAmount });
      }
    }
  }
  spikeCats.sort((a, b) => b.pct - a.pct).slice(0, 2).forEach(({ cat, pct, amount, lastAmount }) => {
    insights.push({
      type: 'warning',
      icon: getCategoryIcon(cat),
      title: `${cat} Spending Up ${pct.toFixed(0)}%`,
      message: `You spent ₹${amount.toLocaleString('en-IN')} on ${cat} this month vs ₹${lastAmount.toLocaleString('en-IN')} last month. That's a ${pct.toFixed(0)}% increase.`,
      priority: 'medium',
    });
  });

  // ─── 3. SAVINGS RATE ──────────────────────────────────────────────────────
  if (currentIncome > 0) {
    const savingsRate = ((currentIncome - currentExpenses) / currentIncome) * 100;
    const savedAmount = currentIncome - currentExpenses;

    if (savingsRate >= 30) {
      insights.push({
        type: 'success',
        icon: '💰',
        title: 'Excellent Savings Rate!',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income this month (₹${savedAmount.toLocaleString('en-IN')}). Financial experts recommend 20%+.`,
        priority: 'low',
      });
    } else if (savingsRate < 10 && currentExpenses > 0) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Savings Alert',
        message: `You're only saving ${Math.max(0, savingsRate).toFixed(1)}% of your income. Try to target at least 20% savings by reducing discretionary expenses.`,
        priority: 'high',
      });
    }
  }

  // ─── 4. TOP COST DRIVER ───────────────────────────────────────────────────
  const topCats = Object.entries(currentCats).sort((a, b) => b[1] - a[1]);
  if (topCats.length > 0 && currentExpenses > 0) {
    const [topCat, topAmount] = topCats[0];
    const pct = (topAmount / currentExpenses) * 100;
    if (pct > 35) {
      insights.push({
        type: 'info',
        icon: getCategoryIcon(topCat),
        title: `${topCat} is Your Biggest Expense`,
        message: `${topCat} accounts for ${pct.toFixed(0)}% of your total spending this month (₹${topAmount.toLocaleString('en-IN')}). Consider if this aligns with your priorities.`,
        priority: 'medium',
      });
    }
  }

  // ─── 5. SAVING RECOMMENDATIONS ────────────────────────────────────────────
  if (currentExpenses > 0 && currentIncome > 0) {
    const tenPercentSave = currentExpenses * 0.1;
    const savingsRate = ((currentIncome - currentExpenses) / currentIncome) * 100;
    if (savingsRate < 20) {
      insights.push({
        type: 'tip',
        icon: '💡',
        title: 'Savings Opportunity',
        message: `Reducing your expenses by just 10% could save you ₹${tenPercentSave.toLocaleString('en-IN', { maximumFractionDigits: 0 })} this month. Small cuts add up to ₹${(tenPercentSave * 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })} a year!`,
        priority: 'low',
      });
    }
  }

  // ─── 6. BUDGET ALERTS ─────────────────────────────────────────────────────
  budgets.forEach(budget => {
    const spent = currentCats[budget.category] || 0;
    const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    if (pct >= 100) {
      insights.push({
        type: 'danger',
        icon: '🚨',
        title: `${budget.category} Budget Exceeded!`,
        message: `You've spent ₹${spent.toLocaleString('en-IN')} on ${budget.category}, exceeding your ₹${budget.limit.toLocaleString('en-IN')} budget by ₹${(spent - budget.limit).toLocaleString('en-IN')}.`,
        priority: 'high',
      });
    } else if (pct >= 80) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: `${budget.category} Budget at ${pct.toFixed(0)}%`,
        message: `You have only ₹${(budget.limit - spent).toLocaleString('en-IN')} left in your ${budget.category} budget for this month.`,
        priority: 'medium',
      });
    }
  });

  // ─── 7. MONTH-END PROJECTION ──────────────────────────────────────────────
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  const daysLeft = daysInMonth - daysPassed;

  if (daysPassed > 5 && currentExpenses > 0) {
    const dailyRate = currentExpenses / daysPassed;
    const projectedTotal = dailyRate * daysInMonth;

    if (currentIncome > 0 && projectedTotal > currentIncome) {
      insights.push({
        type: 'warning',
        icon: '📊',
        title: 'Month-End Projection Alert',
        message: `At your current spending rate of ₹${dailyRate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/day, you're projected to spend ₹${projectedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} by month end — exceeding your income.`,
        priority: 'high',
      });
    } else if (currentIncome > 0) {
      const projectedSavings = currentIncome - projectedTotal;
      if (projectedSavings > 0) {
        insights.push({
          type: 'info',
          icon: '📅',
          title: 'Month-End Savings Forecast',
          message: `At your current pace, you'll save approximately ₹${projectedSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })} by end of month. ${daysLeft} days remaining.`,
          priority: 'low',
        });
      }
    }
  }

  // ─── 8. CONSISTENT SAVINGS ────────────────────────────────────────────────
  const last3Months = [currentMonth, lastMonth, twoMonthsAgo];
  const allMonthsSaved = last3Months.every(m => {
    const inc = getMonthTotal(transactions, m, 'income');
    const exp = getMonthTotal(transactions, m, 'expense');
    return inc > 0 && inc > exp;
  });

  if (allMonthsSaved) {
    insights.push({
      type: 'success',
      icon: '🏆',
      title: 'Consistent Savings Streak!',
      message: 'You\'ve been saving money for 3 consecutive months. Great financial discipline! Keep building your emergency fund.',
      priority: 'low',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights.slice(0, 8); // Max 8 insights
}

function getCategoryIcon(category) {
  const icons = {
    Food: '🍽️', Travel: '✈️', Shopping: '🛍️', Health: '🏥',
    Education: '📚', Bills: '📋', Entertainment: '🎬', Salary: '💼',
    Freelance: '💻', Business: '🏢', Investment: '📈', Others: '📦',
  };
  return icons[category] || '💳';
}

module.exports = { generateInsights };
