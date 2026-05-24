import { Search, X } from 'lucide-react';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { CATEGORIES_LIST } from '../../utils/sampleData';

export function TransactionFilters({ filters, onChange, onReset }) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Input
          placeholder="Search by note or category..."
          value={filters.search}
          onChange={set('search')}
          prefix={<Search size={14} />}
        />
        <Select value={filters.type} onChange={set('type')}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
        <Select value={filters.category} onChange={set('category')}>
          <option value="">All Categories</option>
          {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={filters.paymentMethod} onChange={set('paymentMethod')}>
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <Input
          type="date"
          placeholder="From date"
          value={filters.dateFrom}
          onChange={set('dateFrom')}
        />
        <Input
          type="date"
          placeholder="To date"
          value={filters.dateTo}
          onChange={set('dateTo')}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Select value={filters.sortBy} onChange={set('sortBy')}>
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </Select>
          <button
            onClick={onReset}
            title="Reset filters"
            className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-colors duration-200 shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
