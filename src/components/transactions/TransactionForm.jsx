import { useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/Button';
import { AppContext } from '../../context/AppContext';
import { CATEGORIES_LIST } from '../../utils/sampleData';

const initialForm = {
  type: 'expense',
  amount: '',
  category: 'Food',
  paymentMethod: 'upi',
  note: '',
  date: new Date().toISOString().slice(0, 10),
};

export function TransactionForm({ onClose, editData = null }) {
  const { dispatch } = useContext(AppContext);
  const [form, setForm] = useState(editData
    ? { ...editData, date: editData.date.slice(0, 10), amount: String(editData.amount) }
    : initialForm
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Enter a valid amount';
    if (!form.note.trim()) errs.note = 'Note is required';
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const transaction = {
      id: editData?.id || uuidv4(),
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      paymentMethod: form.paymentMethod,
      note: form.note.trim(),
      date: new Date(form.date).toISOString(),
    };

    if (editData) {
      dispatch({ type: 'EDIT_TRANSACTION', payload: transaction });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction updated!', type: 'success' } });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Transaction added!', type: 'success' } });
    }
    setLoading(false);
    onClose();
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Type Toggle */}
      <div style={{ display: 'flex', gap: 6, padding: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10 }}>
        {['expense', 'income'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setForm(f => ({ ...f, type: t, category: t === 'income' ? 'Salary' : 'Food' }))}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'inherit',
              background: form.type === t
                ? t === 'expense' ? 'rgba(255,71,87,0.15)' : 'rgba(0,212,170,0.15)'
                : 'transparent',
              border: form.type === t
                ? t === 'expense' ? '1px solid rgba(255,71,87,0.3)' : '1px solid rgba(0,212,170,0.3)'
                : '1px solid transparent',
              color: form.type === t
                ? t === 'expense' ? 'var(--red)' : 'var(--accent)'
                : 'var(--text-muted)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="wf-label">Amount</label>
        <input
          type="number"
          className="wf-input"
          placeholder="0.00"
          value={form.amount}
          onChange={set('amount')}
          min="0"
          step="0.01"
        />
        {errors.amount && <p style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>{errors.amount}</p>}
      </div>

      {/* Category & Payment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="wf-label">Category</label>
          <select className="wf-input" value={form.category} onChange={set('category')}>
            {CATEGORIES_LIST
              .filter(c =>
                form.type === 'income'
                  ? ['Salary', 'Freelance', 'Business', 'Others'].includes(c)
                  : !['Salary', 'Freelance', 'Business'].includes(c)
              )
              .map(c => <option key={c} value={c}>{c}</option>)
            }
          </select>
        </div>
        <div>
          <label className="wf-label">Payment Method</label>
          <select className="wf-input" value={form.paymentMethod} onChange={set('paymentMethod')}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="wf-label">Date</label>
        <input
          type="date"
          className="wf-input"
          value={form.date}
          onChange={set('date')}
          max={new Date().toISOString().slice(0, 10)}
        />
        {errors.date && <p style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>{errors.date}</p>}
      </div>

      {/* Note */}
      <div>
        <label className="wf-label">Note</label>
        <input
          className="wf-input"
          placeholder="What was this for?"
          value={form.note}
          onChange={set('note')}
        />
        {errors.note && <p style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>{errors.note}</p>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Button variant="secondary" style={{ flex: 1 }} onClick={onClose} type="button">
          Cancel
        </Button>
        <Button style={{ flex: 1 }} type="submit" loading={loading}>
          {editData ? 'Update' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
}
