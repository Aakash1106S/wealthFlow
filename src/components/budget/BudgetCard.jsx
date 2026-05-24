import { Edit2, Trash2 } from 'lucide-react';
import { BudgetProgressBar } from './BudgetProgressBar';
import { CATEGORY_COLORS } from '../../utils/sampleData';
import { formatCurrency } from '../../utils/formatters';

export function BudgetCard({ budget, currency, onEdit, onDelete }) {
  const { category, limit, spent } = budget;
  const color = CATEGORY_COLORS[category] || '#6b7280';
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isWarning = percentage >= 90;
  const isOver = spent > limit;

  return (
    <div className={`bg-[#111111] border rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 group
      ${isOver ? 'border-red-500/20' : isWarning ? 'border-yellow-500/20' : 'border-white/[0.06]'}`}>

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: color + '20', color }}
          >
            {category.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{category}</h3>
            {isWarning && (
              <span className={`text-xs ${isOver ? 'text-red-400' : 'text-yellow-400'}`}>
                {isOver ? '⚠ Over budget' : '⚠ Near limit'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(budget)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-400">
          <span className="text-white font-semibold">{formatCurrency(spent, currency)}</span>
          <span className="text-gray-600"> spent</span>
        </span>
        <span className="text-gray-500 text-xs">of {formatCurrency(limit, currency)}</span>
      </div>

      {/* Progress */}
      <BudgetProgressBar spent={spent} limit={limit} />
    </div>
  );
}
