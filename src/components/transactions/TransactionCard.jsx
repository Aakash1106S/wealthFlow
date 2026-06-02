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
      className="txn-row group flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-all"
    >
      {/* Left side: Icon and Names */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Category icon */}
        <div
          className="txn-icon w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: color + '18' }}
        >
          <span style={{ fontSize: 15 }}>{emoji}</span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="txn-name text-xs md:text-sm font-medium text-[var(--text-primary)] truncate">{note || category}</div>
          <div className="txn-meta text-[10px] text-[var(--text-muted)] flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
            <span>{formatDate(date)}</span>
            <span className="opacity-30">•</span>
            <span className="capitalize">{category}</span>
            <span className="opacity-30">•</span>
            <span className="inline-flex items-center gap-1 capitalize">
              {paymentIcons[paymentMethod]} {paymentMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Amount and Action buttons */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Amount */}
        <span className={`txn-amount ${type} text-xs md:text-sm font-semibold whitespace-nowrap`}>
          {type === 'income' ? '+' : '-'}{formatCurrency(amount, currency)}
        </span>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="txn-actions flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="w-8 h-8 rounded-lg bg-[rgba(74,158,255,0.08)] border border-[rgba(74,158,255,0.15)] text-[var(--blue)] hover:bg-[rgba(74,158,255,0.16)] cursor-pointer flex items-center justify-center transition-all min-w-[32px] min-h-[32px]"
                aria-label="Edit transaction"
              >
                <Edit2 size={12} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction)}
                className="w-8 h-8 rounded-lg bg-[rgba(255,71,87,0.08)] border border-[rgba(255,71,87,0.15)] text-[var(--red)] hover:bg-[rgba(255,71,87,0.16)] cursor-pointer flex items-center justify-center transition-all min-w-[32px] min-h-[32px]"
                aria-label="Delete transaction"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
