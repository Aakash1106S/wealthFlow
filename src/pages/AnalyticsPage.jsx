import { useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { SpendingPieChart } from '../components/charts/SpendingPieChart';
import { MonthlyLineChart } from '../components/charts/MonthlyLineChart';
import { IncomeExpenseBarChart } from '../components/charts/IncomeExpenseBarChart';
import { BudgetRadarChart } from '../components/charts/BudgetRadarChart';
import { SavingsLineChart } from '../components/charts/SavingsLineChart';
import { ExpenseHeatmap } from '../components/charts/ExpenseHeatmap';
import { formatCurrency, getCurrentMonth } from '../utils/formatters';
import {
  getMostSpentCategory, getAverageDailySpend,
  getBiggestTransaction, getMonthlyIncome, getMonthlyExpenses
} from '../utils/calculations';
import { useAnalytics } from '../hooks/useAnalytics';
import { useInsights } from '../hooks/useInsights';
import { TrendingUp, TrendingDown, Award, Activity, Zap, RefreshCw, Layers } from 'lucide-react';

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
};

export default function AnalyticsPage() {
  const { state } = useContext(AppContext);
  const { state: authState } = useContext(AuthContext);
  const currency = authState.user?.currency || 'INR';
  const month = getCurrentMonth();
  const { transactions } = state;

  const { overview, monthly, budgets, loading: analyticsLoading, refresh: refreshAnalytics } = useAnalytics();
  const { recurring, loading: insightsLoading, refresh: refreshInsights } = useInsights();

  // Computations (Fallbacks)
  const mostSpent = getMostSpentCategory(transactions.filter(t => t.date.startsWith(month)));
  const avgDaily = getAverageDailySpend(transactions, month);
  const biggestTxn = getBiggestTransaction(transactions);
  const monthIncome = overview?.currentMonth?.income ?? getMonthlyIncome(transactions, month);
  const monthExpenses = overview?.currentMonth?.expenses ?? getMonthlyExpenses(transactions, month);

  const handleRefreshAll = () => {
    refreshAnalytics();
    refreshInsights();
  };

  const summaryCards = [
    {
      label: 'Most Spent Category',
      value: mostSpent ? mostSpent[0] : '—',
      sub: mostSpent ? formatCurrency(mostSpent[1], currency) : 'No expenses',
      icon: Award,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Avg. Daily Spend',
      value: formatCurrency(avgDaily, currency),
      sub: 'This month',
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Biggest Transaction',
      value: biggestTxn ? formatCurrency(biggestTxn.amount, currency) : '—',
      sub: biggestTxn ? biggestTxn.note : 'No transactions',
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(monthIncome - monthExpenses, currency),
      sub: 'This month',
      icon: monthIncome >= monthExpenses ? TrendingUp : TrendingDown,
      color: monthIncome >= monthExpenses ? 'text-emerald-400' : 'text-red-400',
      bg: monthIncome >= monthExpenses ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
  ];

  return (
    <div className="px-4 py-5 md:px-6 lg:px-8 pb-24 md:pb-8 max-w-[1400px] mx-auto w-full">
      
      {/* Title Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Advanced Financial Analytics</h2>
          <p className="text-xs text-[var(--text-muted)]">Deep insight indicators powered by your transaction historical patterns.</p>
        </div>
        <Button size="sm" variant="ghost" className="min-h-[32px] text-xs w-full sm:w-auto" onClick={handleRefreshAll} disabled={analyticsLoading || insightsLoading}>
          <RefreshCw size={12} className={analyticsLoading || insightsLoading ? 'animate-spin shrink-0' : 'shrink-0'} /> Sync Analytics
        </Button>
      </div>

      {/* Summary Cards */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5"
      >
        {summaryCards.map(({ label, value, sub, icon: Icon, color, bg }, i) => (
          <motion.div key={i} variants={stagger.item}>
            <div className="stat-card h-full">
              <div className="stat-card-header">
                <span className="stat-card-label">{label}</span>
                <div className={`stat-card-icon ${bg} flex items-center justify-center w-7 h-7 rounded-lg shrink-0`}>
                  <Icon size={14} className={color} />
                </div>
              </div>
              <div className="stat-card-value text-lg sm:text-xl truncate my-2">{value}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Monthly Bar Chart — full width */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
        <Card hover={false}>
          <div className="section-header">
            <span className="section-title">Monthly Income vs Expenses Trend</span>
          </div>
          <div className="relative h-[260px] sm:h-[300px] w-full">
            <IncomeExpenseBarChart transactions={transactions} />
          </div>
        </Card>
      </motion.div>

      {/* Grid of Custom Deep Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Cumulative Savings Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card hover={false}>
            <div className="section-header">
              <span className="section-title">Cumulative Wealth Growth</span>
            </div>
            <div className="relative h-[250px] sm:h-[280px] w-full">
              <SavingsLineChart monthlyData={monthly} />
            </div>
          </Card>
        </motion.div>

        {/* Budget Utilization Radar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card hover={false}>
            <div className="section-header">
              <span className="section-title">Budget Allocation vs Utilization</span>
            </div>
            <div className="relative h-[250px] sm:h-[280px] w-full">
              <BudgetRadarChart budgets={state.budgets.filter(b => b.month === month)} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Two-Column: Heatmap & Recurring section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        {/* Daily Spending Heatmap */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="w-full overflow-hidden">
          <Card hover={false} className="h-full p-4 overflow-x-auto">
            <ExpenseHeatmap currency={currency} />
          </Card>
        </motion.div>

        {/* Recurring Expense Detection Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full">
          <Card hover={false} className="h-full flex flex-col">
            <div className="section-header mb-3">
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-[var(--accent)] shrink-0" />
                <span className="section-title">AI Recurring Bill Detection</span>
              </div>
              <span className="text-[10px] bg-[rgba(0,212,170,0.12)] text-[var(--accent)] px-2 py-0.5 rounded-full font-semibold shrink-0">
                Total: {formatCurrency(recurring?.monthlyTotal || 0, currency)}/mo
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {(!recurring?.autoDetected || recurring.autoDetected.length === 0) ? (
                <div className="text-center py-10 px-4 text-[var(--text-muted)] text-xs m-auto">
                  <div className="text-2xl mb-2">🔄</div>
                  No recurring items detected yet. The AI scans for repeating monthly/weekly amounts automatically.
                </div>
              ) : (
                recurring.autoDetected.map((item, idx) => {
                  const isHighConf = item.confidenceScore >= 80;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border)] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{item.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-[var(--text-muted)] uppercase truncate">{item.category}</span>
                          <span className="text-[8px] text-[var(--text-muted)]">•</span>
                          <span className="text-[9px] text-[var(--accent)] uppercase font-medium shrink-0">{item.frequency}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          {formatCurrency(item.amount, currency)}
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block shrink-0`}
                          style={{
                            background: isHighConf ? 'rgba(0,212,170,0.1)' : 'rgba(255,193,7,0.1)',
                            color: isHighConf ? 'var(--accent)' : 'var(--yellow)',
                          }}
                        >
                          {item.confidenceScore}% Confidence
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}

// Inline button component mapping for ease
function Button({ children, size = 'md', variant = 'primary', onClick, disabled, className }) {
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  const variantClass = variant === 'ghost' ? 'btn-ghost' : 'btn-primary';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${sizeClass} ${className || ''}`}
    >
      {children}
    </button>
  );
}
