import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export function SavingsLineChart({ monthlyData }) {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
        No historical savings data available yet.
      </div>
    );
  }

  // Calculate cumulative savings
  let runningTotal = 0;
  const cumulativeSavings = monthlyData.map(d => {
    const net = d.income - d.expenses;
    runningTotal += net;
    return runningTotal;
  });

  const chartData = {
    labels: monthlyData.map(d => d.label),
    datasets: [
      {
        label: 'Growing Savings Buffer',
        data: cumulativeSavings,
        borderColor: '#9b59b6',
        backgroundColor: 'rgba(155,89,182,0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#9b59b6',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'var(--text-secondary)', font: { size: 11 }, boxWidth: 10 }
      },
      tooltip: {
        backgroundColor: 'var(--bg-card-2)',
        borderColor: 'var(--border)',
        borderWidth: 1,
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        padding: 10
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)', font: { size: 10 } } }
    }
  };

  return <Line data={chartData} options={options} />;
}
