export function getTotalBalance(transactions) {
  return transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
}

export function getMonthlyIncome(transactions, month) {
  return transactions
    .filter(t => t.type === 'income' && t.date.startsWith(month))
    .reduce((acc, t) => acc + t.amount, 0);
}

export function getMonthlyExpenses(transactions, month) {
  return transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(month))
    .reduce((acc, t) => acc + t.amount, 0);
}

export function getSavingsRate(income, expenses) {
  if (income === 0) return 0;
  return Math.max(0, ((income - expenses) / income) * 100);
}

export function getCategoryTotals(transactions) {
  const totals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  return totals;
}

export function getMonthlyData(transactions, months = 6) {
  const result = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    
    const income = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(monthStr))
      .reduce((a, t) => a + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthStr))
      .reduce((a, t) => a + t.amount, 0);
    
    result.push({ month: monthStr, label, income, expenses });
  }
  return result;
}

export function getWeeklyExpenses(transactions) {
  const result = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
    
    const total = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
      .reduce((a, t) => a + t.amount, 0);
    
    result.push({ date: dateStr, label, total });
  }
  return result;
}

export function getMostSpentCategory(transactions) {
  const totals = getCategoryTotals(transactions);
  if (Object.keys(totals).length === 0) return null;
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
}

export function getAverageDailySpend(transactions, month) {
  const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(month));
  const total = monthExpenses.reduce((a, t) => a + t.amount, 0);
  const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
  return total / daysInMonth;
}

export function getBiggestTransaction(transactions) {
  if (transactions.length === 0) return null;
  return transactions.reduce((max, t) => t.amount > max.amount ? t : max);
}

export function getDailySpending(transactions, month) {
  const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
  const result = {};
  
  for (let i = 1; i <= daysInMonth; i++) {
    const day = String(i).padStart(2, '0');
    result[`${month}-${day}`] = 0;
  }
  
  transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(month))
    .forEach(t => {
      const dateKey = t.date.slice(0, 10);
      if (result[dateKey] !== undefined) {
        result[dateKey] += t.amount;
      }
    });
  
  return result;
}

export function getTopCategories(transactions, month, count = 3) {
  const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(month));
  const totals = getCategoryTotals(monthExpenses);
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);
}

export function updateBudgetSpent(budgets, transactions) {
  return budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(budget.month))
      .reduce((a, t) => a + t.amount, 0);
    return { ...budget, spent };
  });
}
