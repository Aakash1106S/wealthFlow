import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend
} from 'chart.js';
import { getMonthlyData, getWeeklyExpenses } from '../../utils/calculations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function IncomeExpenseBarChart({ transactions, weekly = false }) {
  const rawData = weekly ? getWeeklyExpenses(transactions) : getMonthlyData(transactions, 6);

  const chartData = weekly
    ? {
        labels: rawData.map(d => d.label),
        datasets: [{
          label: 'Expenses',
          data: rawData.map(d => d.total),
          backgroundColor: 'rgba(239,68,68,0.7)',
          borderColor: '#ef4444',
          borderWidth: 1,
          borderRadius: 6,
        }],
      }
    : {
        labels: rawData.map(d => d.label),
        datasets: [
          {
            label: 'Income',
            data: rawData.map(d => d.income),
            backgroundColor: 'rgba(16,185,129,0.7)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 6,
          },
          {
            label: 'Expenses',
            data: rawData.map(d => d.expenses),
            backgroundColor: 'rgba(239,68,68,0.7)',
            borderColor: '#ef4444',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#a1a1aa', font: { size: 12 }, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#71717a' } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a' } },
    },
  };

  return <Bar data={chartData} options={options} />;
}
