import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getCategoryTotals } from '../../utils/calculations';
import { CATEGORY_COLORS } from '../../utils/sampleData';

ChartJS.register(ArcElement, Tooltip, Legend);

export function SpendingPieChart({ transactions }) {
  const totals = getCategoryTotals(transactions);
  const labels = Object.keys(totals);
  const data = Object.values(totals);
  const colors = labels.map(l => CATEGORY_COLORS[l] || '#6b7280');

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.map(c => c + '99'),
      borderColor: colors,
      borderWidth: 1.5,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#a1a1aa',
          font: { size: 12, family: 'Inter' },
          boxWidth: 12,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toLocaleString('en-IN')}`,
        },
      },
    },
  };

  if (labels.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
        No expense data available
      </div>
    );
  }

  return <Pie data={chartData} options={options} />;
}
