import { motion } from 'framer-motion';

export function BudgetProgressBar({ spent, limit, showLabel = true }) {
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isOver = spent > limit;

  const color = isOver || percentage >= 90
    ? 'bg-red-500'
    : percentage >= 70
    ? 'bg-yellow-500'
    : 'bg-emerald-500';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
          <span className="flex-shrink-0">{percentage.toFixed(0)}% used</span>
          <span className={`truncate text-right ${isOver ? 'text-red-400' : ''}`}>
            {isOver
              ? `Over by ${(spent - limit).toLocaleString()}`
              : `${(limit - spent).toLocaleString()} left`
            }
          </span>
        </div>
      )}
    </div>
  );
}
