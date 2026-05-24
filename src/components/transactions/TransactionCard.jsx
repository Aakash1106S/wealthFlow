import { motion } from 'framer-motion';
import { Edit2, Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { CATEGORY_COLORS } from '../../utils/sampleData';
import { formatCurrency, formatDate } from '../../utils/formatters';

const paymentIcons = {
  cash: <Banknote size={10} />,
  card: <CreditCard size={10} />,
  upi: <Smartphone size={10} />,
};

const CATEGORY_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍', Entertainment: '🎬',
  Health: '🏥', Bills: '💡', Travel: '✈️', Education: '📚',
  Salary: '💰', Freelance: '💻', Investment: '📈', Other: '📦',
};

export function TransactionCard({ transaction, currency = 'INR', onEdit, onDelete, index = 0 }) {
  const { type, amount, category, paymentMethod, note, date } = transaction;
  const color = CATEGORY_COLORS[category] || '#6b7280';
  const emoji = CATEGORY_EMOJI[category] || '💳';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="txn-row group"
    >
      {/* Category icon */}
      <div
        className="txn-icon"
        style={{ background: color + '18' }}
      >
        <span style={{ fontSize: 15 }}>{emoji}</span>
      </div>

      {/* Info */}
      <div className="txn-info">
        <div className="txn-name">{note || category}</div>
        <div className="txn-meta">
          {formatDate(date)}
          <span style={{ margin: '0 4px', opacity: 0.3 }}>·</span>
          <span style={{ textTransform: 'capitalize' }}>{category}</span>
          <span style={{ margin: '0 4px', opacity: 0.3 }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, textTransform: 'capitalize' }}>
            {paymentIcons[paymentMethod]} {paymentMethod}
          </span>
        </div>
      </div>

      {/* Amount */}
      <span className={`txn-amount ${type}`}>
        {type === 'income' ? '+' : '-'}{formatCurrency(amount, currency)}
      </span>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="txn-actions">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: 'rgba(74,158,255,0.08)',
                border: '1px solid rgba(74,158,255,0.15)',
                color: 'var(--blue)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Edit2 size={11} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction)}
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: 'rgba(255,71,87,0.08)',
                border: '1px solid rgba(255,71,87,0.15)',
                color: 'var(--red)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
