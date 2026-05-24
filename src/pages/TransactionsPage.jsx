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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={() => setCalMonth(new Date(year, month - 1, 1))}
          style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
        >←</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCalMonth(new Date(year, month + 1, 1))}
          style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
        >→</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const spend = dailySpend[dateStr] || 0;
          const isToday = dateStr === new Date().toISOString().slice(0, 10);
          return (
            <button
              key={day}
              onClick={() => openDay(day)}
              style={{
                minHeight: 52, padding: 6, borderRadius: 8, textAlign: 'left',
                border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
                background: isToday ? 'rgba(0,212,170,0.05)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: isToday ? 'var(--accent)' : 'var(--text-muted)' }}>{day}</span>
              {spend > 0 && (
                <div style={{ marginTop: 3 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', marginBottom: 2 }} />
                  <span style={{ fontSize: 9, color: 'var(--red)', lineHeight: 1 }}>{(spend / 1000).toFixed(1)}k</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title={selectedDate ? formatDate(selectedDate.dateStr) : ''}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {selectedDate?.txns?.length === 0
            ? <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No transactions on this day</p>
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

  const handleDelete = () => {
    if (!deleteTarget) return;
    dispatch({ type: 'DELETE_TRANSACTION', payload: deleteTarget.id });
    dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction deleted.', type: 'info' } });
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
    <div style={{ padding: '20px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download size={12} /> Export
          </Button>
          <Button size="sm" onClick={() => { setEditData(null); setAddOpen(true); }}>
            <Plus size={12} /> Add
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filters */}
          <Card style={{ marginBottom: 16, padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {/* Search */}
              <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="wf-input"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={set('search')}
                  style={{ paddingLeft: 30 }}
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

              <input type="date" className="wf-input" value={filters.dateFrom} onChange={set('dateFrom')} />
              <input type="date" className="wf-input" value={filters.dateTo} onChange={set('dateTo')} />

              <select className="wf-input" value={filters.sortBy} onChange={set('sortBy')}>
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>

              <button
                onClick={() => setFilters(defaultFilters)}
                style={{
                  height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 11, fontFamily: 'inherit',
                }}
              >
                <X size={11} /> Reset
              </button>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                No transactions match your filters
              </div>
            ) : (
              <Card style={{ padding: '8px 0' }}>
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
        <Card>
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
