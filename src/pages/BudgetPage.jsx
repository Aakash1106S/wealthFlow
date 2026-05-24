import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { BudgetCard } from '../components/budget/BudgetCard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { getCurrentMonth } from '../utils/formatters';
import { CATEGORIES_LIST } from '../utils/sampleData';
import { v4 as uuidv4 } from 'uuid';

const EXPENSE_CATS = CATEGORIES_LIST.filter(c => !['Salary', 'Freelance', 'Business'].includes(c));

export default function BudgetPage() {
  const { state, dispatch } = useContext(AppContext);
  const { state: authState } = useContext(AuthContext);
  const [addOpen, setAddOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ category: 'Food', limit: '', month: getCurrentMonth() });
  const [errors, setErrors] = useState({});

  const currency = authState.user?.currency || 'INR';
  const currentMonth = getCurrentMonth();
  const budgets = state.budgets.filter(b => b.month === currentMonth);

  useEffect(() => {
    budgets.forEach(b => {
      const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
      if (pct >= 90 && pct < 100) {
        dispatch({
          type: 'ADD_TOAST',
          payload: { message: `⚠ ${b.category} budget is at ${pct.toFixed(0)}% — nearly exhausted!`, type: 'warning' }
        });
      }
    });
  }, []); // eslint-disable-line

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.limit || isNaN(Number(form.limit)) || Number(form.limit) <= 0)
      errs.limit = 'Enter a valid amount';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (editData) {
      dispatch({ type: 'EDIT_BUDGET', payload: { ...editData, limit: Number(form.limit), category: form.category, month: form.month } });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget updated!', type: 'success' } });
    } else {
      const existing = state.budgets.find(b => b.category === form.category && b.month === form.month);
      if (existing) {
        dispatch({ type: 'EDIT_BUDGET', payload: { ...existing, limit: Number(form.limit) } });
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget updated!', type: 'success' } });
      } else {
        const newBudget = { id: uuidv4(), category: form.category, limit: Number(form.limit), spent: 0, month: form.month };
        dispatch({ type: 'ADD_BUDGET', payload: newBudget });
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget set!', type: 'success' } });
      }
    }

    setAddOpen(false);
    setEditData(null);
    setForm({ category: 'Food', limit: '', month: currentMonth });
    setErrors({});
  };

  const openEdit = (budget) => {
    setEditData(budget);
    setForm({ category: budget.category, limit: String(budget.limit), month: budget.month });
    setAddOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    dispatch({ type: 'DELETE_BUDGET', payload: deleteTarget });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Budget removed.', type: 'info' } });
    setDeleteTarget(null);
  };

  const totalLimit = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const overBudget = budgets.filter(b => b.spent > b.limit).length;

  return (
    <div className="p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Budgeted', value: totalLimit.toLocaleString('en-IN') },
          { label: 'Total Spent', value: totalSpent.toLocaleString('en-IN') },
          { label: 'Over Budget', value: `${overBudget}`, sub: 'categories' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              {s.sub && <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>}
              <p className="text-sm text-gray-400 font-medium mt-2">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400 font-medium">
          {budgets.length} budget{budgets.length !== 1 ? 's' : ''} for{' '}
          {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditData(null);
            setForm({ category: 'Food', limit: '', month: currentMonth });
            setAddOpen(true);
          }}
        >
          <Plus size={14} /> Add Budget
        </Button>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm">
          <p className="mb-2">No budgets set yet.</p>
          <p>Add a budget to start tracking your spending limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget, i) => (
            <motion.div key={budget.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <BudgetCard
                budget={budget}
                currency={currency}
                onEdit={openEdit}
                onDelete={(id) => setDeleteTarget(id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setEditData(null); setErrors({}); }}
        title={editData ? 'Edit Budget' : 'Set Budget'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Category"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input
            label="Monthly Limit"
            type="number"
            placeholder="5000"
            value={form.limit}
            onChange={e => { setForm(f => ({ ...f, limit: e.target.value })); setErrors(er => ({ ...er, limit: undefined })); }}
            error={errors.limit}
            min="1"
          />
          <Input
            label="Month"
            type="month"
            value={form.month}
            onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
          />
          <div className="flex gap-3 mt-2">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => { setAddOpen(false); setEditData(null); setErrors({}); }}>
              Cancel
            </Button>
            <Button className="flex-1" type="submit">
              {editData ? 'Update' : 'Set Budget'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Remove Budget"
        message="Are you sure you want to remove this budget? This cannot be undone."
      />
    </div>
  );
}
