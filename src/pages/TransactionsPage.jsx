import { useContext, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Calendar, List, Search, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { TransactionCard } from '../components/transactions/TransactionCard';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Card } from '../components/ui/Card';
import { CATEGORIES_LIST } from '../utils/sampleData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useTransactions } from '../hooks/useTransactions';

const defaultFilters = {
  search: '', type: '', category: '', paymentMethod: '',
  dateFrom: '', dateTo: '', sortBy: 'latest',
};

function CalendarView({ transactions, currency }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const now = new Date();
  const [calMonth, setCalMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const monthStr = calMonth.toISOString().slice(0, 7);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const dailySpend = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthStr)).forEach(t => {
      const d = t.date.slice(0, 10);
      map[d] = (map[d] || 0) + t.amount;
    });
    return map;
  }, [transactions, monthStr]);

  const getDayTransactions = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date.startsWith(dateStr));
  };

  const openDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate({ day, dateStr, txns: getDayTransactions(day) });
    setViewModal(true);
  };

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCalMonth(new Date(year, month - 1, 1))}
          className="w-7 h-7 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer flex items-center justify-center text-xs transition-all"
        >←</button>
        <span className="text-xs md:text-sm font-semibold text-[var(--text-primary)]">
          {calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCalMonth(new Date(year, month + 1, 1))}
          className="w-7 h-7 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer flex items-center justify-center text-xs transition-all"
        >→</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const spend = dailySpend[dateStr] || 0;
          const isToday = dateStr === new Date().toISOString().slice(0, 10);
          return (
            <button
              key={day}
              onClick={() => openDay(day)}
              className="min-h-[48px] sm:min-h-[56px] p-1.5 rounded-lg text-left border flex flex-col justify-between cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.02)]"
              style={{
                borderColor: isToday ? 'var(--accent)' : 'var(--border)',
                background: isToday ? 'rgba(0,212,170,0.05)' : 'transparent',
              }}
            >
              <span className="text-[9px] sm:text-xs font-semibold" style={{ color: isToday ? 'var(--accent)' : 'var(--text-muted)' }}>{day}</span>
              {spend > 0 && (
                <div className="mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--red)] mb-0.5" />
                  <span className="text-[8px] sm:text-[9px] text-[var(--red)] font-medium leading-none">{(spend / 1000).toFixed(0)}k</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title={selectedDate ? formatDate(selectedDate.dateStr) : ''}>
        <div className="flex flex-col gap-2">
          {selectedDate?.txns?.length === 0
            ? <p className="text-xs text-[var(--text-muted)] text-center py-4">No transactions on this day</p>
            : selectedDate?.txns?.map(t => (
              <TransactionCard key={t.id} transaction={t} currency={currency} />
            ))
          }
        </div>
      </Modal>
    </div>
  );
}

export default function TransactionsPage() {
  const { state, dispatch } = useContext(AppContext);
  const { state: authState } = useContext(AuthContext);
  const { deleteTransaction } = useTransactions();
  const [filters, setFilters] = useState(defaultFilters);
  const [addOpen, setAddOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const currency = authState.user?.currency || 'INR';

  const filtered = useMemo(() => {
    let txns = [...state.transactions];
    const s = filters.search.toLowerCase();
    if (s) txns = txns.filter(t => t.note.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
    if (filters.type) txns = txns.filter(t => t.type === filters.type);
    if (filters.category) txns = txns.filter(t => t.category === filters.category);
    if (filters.paymentMethod) txns = txns.filter(t => t.paymentMethod === filters.paymentMethod);
    if (filters.dateFrom) txns = txns.filter(t => t.date >= filters.dateFrom);
    if (filters.dateTo) txns = txns.filter(t => t.date <= filters.dateTo + 'T23:59:59');
    const sorts = {
      latest: (a, b) => new Date(b.date) - new Date(a.date),
      oldest: (a, b) => new Date(a.date) - new Date(b.date),
      highest: (a, b) => b.amount - a.amount,
      lowest: (a, b) => a.amount - b.amount,
    };
    txns.sort(sorts[filters.sortBy] || sorts.latest);
    return txns;
  }, [state.transactions, filters]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteTransaction(deleteTarget.id || deleteTarget._id);
    setDeleteTarget(null);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Note'];
    const rows = filtered.map(t => [
      formatDate(t.date), t.type, t.category, t.amount, t.paymentMethod,
      `"${t.note.replace(/"/g, '""')}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_TOAST', payload: { message: 'CSV exported!', type: 'success' } });
  };

  const set = (field) => (e) => setFilters(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="px-4 py-5 md:px-6 lg:px-8 pb-24 md:pb-8 max-w-[1200px] mx-auto w-full">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <span className="text-xs text-[var(--text-muted)] order-2 sm:order-1">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List view"
            >
              <List size={13} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              title="Calendar view"
            >
              <Calendar size={13} />
            </button>
          </div>
          <Button variant="secondary" size="sm" className="min-h-[32px] text-xs" onClick={exportCSV}>
            <Download size={12} /> Export
          </Button>
          <Button size="sm" className="min-h-[32px] text-xs" onClick={() => { setEditData(null); setAddOpen(true); }}>
            <Plus size={12} /> Add
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filters */}
          <Card className="mb-4 p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {/* Search */}
              <div className="relative sm:col-span-2">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  className="wf-input pl-8"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={set('search')}
                />
              </div>

              <select className="wf-input" value={filters.type} onChange={set('type')}>
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select className="wf-input" value={filters.category} onChange={set('category')}>
                <option value="">All Categories</option>
                {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select className="wf-input" value={filters.paymentMethod} onChange={set('paymentMethod')}>
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>

              <input type="date" className="wf-input text-xs" value={filters.dateFrom} onChange={set('dateFrom')} />
              <input type="date" className="wf-input text-xs" value={filters.dateTo} onChange={set('dateTo')} />

              <select className="wf-input" value={filters.sortBy} onChange={set('sortBy')}>
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>

              <button
                onClick={() => setFilters(defaultFilters)}
                className="h-8.5 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium transition-all"
              >
                <X size={12} /> Reset
              </button>
            </div>
          </Card>

          <div className="flex flex-col">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)] text-xs">
                No transactions match your filters
              </div>
            ) : (
              <Card className="py-2 px-1">
                {filtered.map((t, i) => (
                  <TransactionCard
                    key={t.id}
                    transaction={t}
                    currency={currency}
                    index={i}
                    onEdit={(tx) => { setEditData(tx); setAddOpen(true); }}
                    onDelete={(tx) => setDeleteTarget(tx)}
                  />
                ))}
              </Card>
            )}
          </div>
        </>
      ) : (
        <Card className="p-4">
          <CalendarView transactions={state.transactions} currency={currency} />
        </Card>
      )}

      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setEditData(null); }}
        title={editData ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm onClose={() => { setAddOpen(false); setEditData(null); }} editData={editData} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTarget?.note}"? This cannot be undone.`}
      />
    </div>
  );
}
