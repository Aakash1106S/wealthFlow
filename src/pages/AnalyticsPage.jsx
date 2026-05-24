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
    <div style={{ padding: '20px 24px 80px', maxWidth: 1400, margin: '0 auto' }}>
      
      {/* Title Header with Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Advanced Financial Analytics</h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Deep insight indicators powered by your transaction historical patterns.</p>
        </div>
        <Button size="sm" variant="ghost" onClick={handleRefreshAll} disabled={analyticsLoading || insightsLoading}>
          <RefreshCw size={12} className={analyticsLoading || insightsLoading ? 'animate-spin' : ''} /> Sync Analytics
        </Button>
      </div>

      {/* Summary Cards */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}
        className="grid-responsive-4"
      >
        {summaryCards.map(({ label, value, sub, icon: Icon, color, bg }, i) => (
          <motion.div key={i} variants={stagger.item}>
            <div className="stat-card" style={{ height: '100%' }}>
              <div className="stat-card-header">
                <span className="stat-card-label">{label}</span>
                <div className={`stat-card-icon ${bg}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7 }}>
                  <Icon size={14} className={color} />
                </div>
              </div>
              <div className="stat-card-value truncate" style={{ fontSize: 20, margin: '8px 0 2px' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }} className="truncate">{sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Monthly Bar Chart — full width */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 20 }}>
        <Card hover={false}>
          <div className="section-header">
            <span className="section-title">Monthly Income vs Expenses Trend</span>
          </div>
          <div style={{ height: 260 }}>
            <IncomeExpenseBarChart transactions={transactions} />
          </div>
        </Card>
      </motion.div>

      {/* Grid of Custom Deep Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }} className="grid-responsive-2">
        {/* Cumulative Savings Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card hover={false}>
            <div className="section-header">
              <span className="section-title">Cumulative Wealth Growth</span>
            </div>
            <div style={{ height: 250 }}>
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
            <div style={{ height: 250 }}>
              <BudgetRadarChart budgets={state.budgets.filter(b => b.month === month)} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Two-Column: Heatmap & Recurring section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }} className="grid-responsive-2">
        {/* Daily Spending Heatmap */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card hover={false} style={{ height: '100%', padding: '16px' }}>
            <ExpenseHeatmap currency={currency} />
          </Card>
        </motion.div>

        {/* Recurring Expense Detection Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card hover={false} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="section-header" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={14} style={{ color: 'var(--accent)' }} />
                <span className="section-title">AI Recurring Bill Detection</span>
              </div>
              <span style={{ fontSize: 10, background: 'rgba(0,212,170,0.12)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                Total: {formatCurrency(recurring?.monthlyTotal || 0, currency)}/mo
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {(!recurring?.autoDetected || recurring.autoDetected.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: 12, margin: 'auto' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🔄</div>
                  No recurring items detected yet. The AI scans for repeating monthly/weekly amounts automatically.
                </div>
              ) : (
                recurring.autoDetected.map((item, idx) => {
                  const isHighConf = item.confidenceScore >= 80;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.category}</span>
                          <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>•</span>
                          <span style={{ fontSize: 9, color: 'var(--accent)', textTransform: 'capitalize', fontWeight: 500 }}>{item.frequency}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(item.amount, currency)}
                        </div>
                        <span style={{
                          fontSize: 8,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: isHighConf ? 'rgba(0,212,170,0.1)' : 'rgba(255,193,7,0.1)',
                          color: isHighConf ? 'var(--accent)' : 'var(--yellow)',
                          marginTop: 3,
                          display: 'inline-block'
                        }}>
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
