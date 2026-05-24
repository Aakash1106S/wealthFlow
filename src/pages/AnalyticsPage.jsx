import { useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { SpendingPieChart } from '../components/charts/SpendingPieChart';
import { MonthlyLineChart } from '../components/charts/MonthlyLineChart';
import { IncomeExpenseBarChart } from '../components/charts/IncomeExpenseBarChart';
import { formatCurrency, getCurrentMonth } from '../utils/formatters';
import {
  getMostSpentCategory, getAverageDailySpend,
  getBiggestTransaction, getMonthlyIncome, getMonthlyExpenses
} from '../utils/calculations';
import { TrendingUp, TrendingDown, Award, Activity, Zap } from 'lucide-react';

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
};

export default function AnalyticsPage() {
  const { state } = useContext(AppContext);
  const { state: authState } = useContext(AuthContext);
  const currency = authState.user?.currency || 'INR';
  const month = getCurrentMonth();
  const { transactions } = state;

  const mostSpent = getMostSpentCategory(transactions.filter(t => t.date.startsWith(month)));
  const avgDaily = getAverageDailySpend(transactions, month);
  const biggestTxn = getBiggestTransaction(transactions);
  const monthIncome = getMonthlyIncome(transactions, month);
  const monthExpenses = getMonthlyExpenses(transactions, month);

  const summaryCards = [
    {
      label: 'Most Spent Category',
      value: mostSpent ? mostSpent[0] : '—',
      sub: mostSpent ? formatCurrency(mostSpent[1], currency) : 'No expenses',
      icon: Award,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Avg. Daily Spend',
      value: formatCurrency(avgDaily, currency),
      sub: 'This month',
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Biggest Transaction',
      value: biggestTxn ? formatCurrency(biggestTxn.amount, currency) : '—',
      sub: biggestTxn ? biggestTxn.note : 'No transactions',
      icon: Zap,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(monthIncome - monthExpenses, currency),
      sub: 'This month',
      icon: monthIncome >= monthExpenses ? TrendingUp : TrendingDown,
      color: monthIncome >= monthExpenses ? 'text-emerald-400' : 'text-red-400',
      bg: monthIncome >= monthExpenses ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
  ];

  return (
    <div className="p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">

      {/* Summary Cards */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
      >
        {summaryCards.map(({ label, value, sub, icon: Icon, color, bg }, i) => (
          <motion.div key={i} variants={stagger.item} className="h-full">
            <Card className="h-full">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} className={color} />
                </div>
              </div>
              <p className="text-sm text-gray-400 font-medium mt-4 mb-1">{label}</p>
              <p className="text-xl font-bold text-white truncate">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{sub}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Monthly Bar Chart — full width */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
        <Card hover={false}>
          <h3 className="text-lg font-semibold text-white mb-6">Monthly Income vs Expenses (6 months)</h3>
          <div className="h-64">
            <IncomeExpenseBarChart transactions={transactions} />
          </div>
        </Card>
      </motion.div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card hover={false}>
            <h3 className="text-lg font-semibold text-white mb-6">Spending by Category</h3>
            <div className="h-64">
              <SpendingPieChart transactions={transactions.filter(t => t.date.startsWith(month))} />
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card hover={false}>
            <h3 className="text-lg font-semibold text-white mb-6">Income &amp; Expense Trends</h3>
            <div className="h-64">
              <MonthlyLineChart transactions={transactions} />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
