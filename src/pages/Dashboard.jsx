import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, Target, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { TransactionCard } from '../components/transactions/TransactionCard';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { SpendingPieChart } from '../components/charts/SpendingPieChart';
import { IncomeExpenseBarChart } from '../components/charts/IncomeExpenseBarChart';
import {
  getTotalBalance, getMonthlyIncome, getMonthlyExpenses, getSavingsRate
} from '../utils/calculations';
import { formatCurrency, getCurrentMonth, getDaysRemaining } from '../utils/formatters';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { FinancialHealthScore } from '../components/FinancialHealthScore';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { useInsights } from '../hooks/useInsights';
import { useAnalytics } from '../hooks/useAnalytics';
import { insightsAPI } from '../services/api';

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
};

export default function Dashboard() {
  const { state: authState } = useContext(AuthContext);
  const { state, dispatch } = useContext(AppContext);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const goals = state.savingsGoals || [];
  const [goalModal, setGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', savedAmount: '', deadline: '', color: '#00d4aa' });
  const [editGoal, setEditGoal] = useState(null);

  const { insights, healthScore, loading: insightsLoading, refresh: refreshInsights } = useInsights();
  const { overview, loading: analyticsLoading } = useAnalytics();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const currency = authState.user?.currency || 'INR';
  const month = getCurrentMonth();
  const { transactions } = state;

  const totalBalance = overview?.totalBalance ?? getTotalBalance(transactions);
  const monthlyIncome = overview?.currentMonth?.income ?? getMonthlyIncome(transactions, month);
  const monthlyExpenses = overview?.currentMonth?.expenses ?? getMonthlyExpenses(transactions, month);
  const savingsRate = overview?.currentMonth?.savingsRate ?? getSavingsRate(monthlyIncome, monthlyExpenses);
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const incomeTrendVal = overview?.trends?.income ?? 0;
  const expenseTrendVal = overview?.trends?.expenses ?? 0;

  const summaryCards = [
    {
      label: 'Total Balance',
      value: formatCurrency(totalBalance, currency),
      icon: Wallet,
      iconBg: 'rgba(0,212,170,0.12)',
      iconColor: 'var(--accent)',
      trend: 'Real-time',
      trendPositive: true,
    },
    {
      label: 'Monthly Income',
      value: formatCurrency(monthlyIncome, currency),
      icon: TrendingUp,
      iconBg: 'rgba(74,158,255,0.12)',
      iconColor: 'var(--blue)',
      trend: incomeTrendVal !== 0 ? `${incomeTrendVal >= 0 ? '+' : ''}${incomeTrendVal.toFixed(1)}%` : 'Syncing',
      trendPositive: incomeTrendVal >= 0,
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(monthlyExpenses, currency),
      icon: TrendingDown,
      iconBg: 'rgba(255,71,87,0.12)',
      iconColor: 'var(--red)',
      trend: expenseTrendVal !== 0 ? `${expenseTrendVal >= 0 ? '+' : ''}${expenseTrendVal.toFixed(1)}%` : 'Syncing',
      trendPositive: expenseTrendVal <= 0,
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      iconBg: 'rgba(155,89,182,0.12)',
      iconColor: 'var(--purple)',
      trend: savingsRate >= 20 ? 'On track' : 'Optimize',
      trendPositive: savingsRate >= 20,
    },
  ];

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.targetAmount || !goalForm.deadline) return;
    
    try {
      const payload = {
        title: goalForm.title,
        targetAmount: Number(goalForm.targetAmount),
        savedAmount: Number(goalForm.savedAmount) || 0,
        deadline: goalForm.deadline,
        color: goalForm.color
      };

      if (editGoal) {
        const goalId = editGoal.id || editGoal._id;
        const { data } = await insightsAPI.updateGoal(goalId, payload);
        dispatch({ type: 'EDIT_GOAL', payload: { ...data.data, id: data.data._id } });
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Goal updated successfully', type: 'success' } });
        setEditGoal(null);
      } else {
        const { data } = await insightsAPI.createGoal(payload);
        dispatch({ type: 'ADD_GOAL', payload: { ...data.data, id: data.data._id } });
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Goal created successfully', type: 'success' } });
      }
      setGoalForm({ title: '', targetAmount: '', savedAmount: '', deadline: '', color: '#00d4aa' });
      setGoalModal(false);
    } catch (err) {
      dispatch({ type: 'ADD_TOAST', payload: { message: err.response?.data?.message || 'Action failed', type: 'error' } });
    }
  };

  const openEditGoal = (goal) => {
    setEditGoal(goal);
    setGoalForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      savedAmount: String(goal.savedAmount),
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      color: goal.color
    });
    setGoalModal(true);
  };

  const deleteGoal = async (id) => {
    try {
      await insightsAPI.deleteGoal(id);
      dispatch({ type: 'DELETE_GOAL', payload: id });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Goal deleted successfully', type: 'success' } });
    } catch (err) {
      dispatch({ type: 'ADD_TOAST', payload: { message: err.response?.data?.message || 'Failed to delete goal', type: 'error' } });
    }
  };

  return (
    <div style={{ padding: '20px 24px 80px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20 }}
      >
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {greetingTime()}, {authState.user?.name?.split(' ')[0] || 'there'} 👋
        </h2>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}
        className="grid-responsive-4"
      >
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : summaryCards.map(({ label, value, icon: Icon, iconBg, iconColor, trend, trendPositive }, i) => (
            <motion.div key={i} variants={stagger.item}>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">{label}</span>
                  <div className="stat-card-icon" style={{ background: iconBg }}>
                    <Icon size={14} style={{ color: iconColor }} />
                  </div>
                </div>
                <div className="stat-card-value">{value}</div>
                <div className={`stat-card-sub ${trendPositive ? 'positive' : 'negative'}`}>
                  {trendPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {trend} this month
                </div>
              </div>
            </motion.div>
          ))
        }
      </motion.div>

      {/* AI Insights & Financial Health Score Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginBottom: 20 }} className="grid-responsive-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AIInsightsPanel insights={insights} loading={insightsLoading} onRefresh={refreshInsights} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <FinancialHealthScore healthScore={healthScore} loading={insightsLoading} />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12, marginBottom: 20 }} className="grid-responsive-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <div className="section-header">
              <span className="section-title">Spending by Category</span>
              <Link to="/analytics" className="section-action">View all <ChevronRight size={12} /></Link>
            </div>
            <div style={{ minHeight: 280 }}>
              <SpendingPieChart transactions={transactions.filter(t => t.date.startsWith(month))} />
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="section-header">
              <span className="section-title">Weekly Bar Flow</span>
            </div>
            <div style={{ minHeight: 280 }}>
              <IncomeExpenseBarChart transactions={transactions} weekly />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Transactions + Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }} className="grid-responsive-2">
        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card style={{ height: '100%' }}>
            <div className="section-header">
              <span className="section-title">Recent Transactions</span>
              <Link to="/transactions" className="section-action">View all <ChevronRight size={12} /></Link>
            </div>
            <div>
              {recentTransactions.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                    No transactions yet. Add your first!
                  </div>
                )
                : recentTransactions.map((t, i) => (
                  <TransactionCard key={t.id} transaction={t} currency={currency} index={i} />
                ))
              }
            </div>
          </Card>
        </motion.div>

        {/* Savings Goals */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card style={{ height: '100%' }}>
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={14} style={{ color: 'var(--accent)' }} />
                <span className="section-title">Savings Goals</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditGoal(null);
                  setGoalForm({ title: '', targetAmount: '', savedAmount: '', deadline: '', color: '#00d4aa' });
                  setGoalModal(true);
                }}
              >
                <Plus size={12} /> Add
              </Button>
            </div>

            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                No savings goals yet. Set one to stay motivated!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {goals.map(goal => {
                  const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
                  const daysLeft = getDaysRemaining(goal.deadline);
                  const isUrgent = daysLeft <= 7 && pct < 80;
                  return (
                    <div
                      key={goal.id}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isUrgent ? 'rgba(255,71,87,0.2)' : 'var(--border)'}`,
                        borderRadius: 10,
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{goal.title}</div>
                          <div style={{ fontSize: 10, color: isUrgent ? 'var(--red)' : 'var(--text-muted)', marginTop: 2 }}>
                            {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today!' : 'Overdue'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 3 }}>
                          <button
                            onClick={() => openEditGoal(goal)}
                            style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ✏
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.15)', color: 'var(--red)', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>{formatCurrency(goal.savedAmount, currency)}</span>
                        <span>{formatCurrency(goal.targetAmount, currency)}</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%`, background: isUrgent ? 'var(--red)' : goal.color }}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{pct.toFixed(0)}% saved</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* FAB */}
      <motion.button
        onClick={() => setAddOpen(true)}
        style={{
          position: 'fixed',
          bottom: 76,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--accent)',
          border: 'none',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,212,170,0.35)',
          zIndex: 30,
        }}
        className="md:bottom-6 md:right-6"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <Plus size={20} />
      </motion.button>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Transaction">
        <TransactionForm onClose={() => setAddOpen(false)} />
      </Modal>

      <Modal
        isOpen={goalModal}
        onClose={() => { setGoalModal(false); setEditGoal(null); }}
        title={editGoal ? 'Edit Goal' : 'Add Savings Goal'}
      >
        <form onSubmit={handleGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="wf-label">Goal Title</label>
            <input
              className="wf-input"
              placeholder="e.g., Emergency Fund"
              value={goalForm.title}
              onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="wf-label">Target Amount</label>
              <input
                type="number"
                className="wf-input"
                placeholder="50000"
                value={goalForm.targetAmount}
                onChange={e => setGoalForm(f => ({ ...f, targetAmount: e.target.value }))}
                required min="1"
              />
            </div>
            <div>
              <label className="wf-label">Saved So Far</label>
              <input
                type="number"
                className="wf-input"
                placeholder="0"
                value={goalForm.savedAmount}
                onChange={e => setGoalForm(f => ({ ...f, savedAmount: e.target.value }))}
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="wf-label">Deadline</label>
            <input
              type="date"
              className="wf-input"
              value={goalForm.deadline}
              onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="wf-label">Color</label>
            <input
              type="color"
              style={{ height: 36, width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', padding: 2 }}
              value={goalForm.color}
              onChange={e => setGoalForm(f => ({ ...f, color: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button variant="secondary" style={{ flex: 1 }} type="button" onClick={() => { setGoalModal(false); setEditGoal(null); }}>
              Cancel
            </Button>
            <Button style={{ flex: 1 }} type="submit">
              {editGoal ? 'Update' : 'Add Goal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
