import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function BudgetRadarChart({ budgets }) {
  if (!budgets || budgets.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
        Set category budgets to see radar visualization.
      </div>
    );
  }

  const categories = budgets.map(b => b.category);
  const limits = budgets.map(b => b.limit);
  const spents = budgets.map(b => b.spent || 0);

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Budget Limit',
        data: limits,
        borderColor: '#4a9eff',
        backgroundColor: 'rgba(74,158,255,0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#4a9eff',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4a9eff'
      },
      {
        label: 'Actual Spent',
        data: spents,
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0,212,170,0.25)',
        borderWidth: 2,
        pointBackgroundColor: '#00d4aa',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00d4aa'
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
      r: {
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        grid: { color: 'rgba(255,255,255,0.06)' },
        pointLabels: { color: 'var(--text-secondary)', font: { size: 10 } },
        ticks: { display: false }
      }
    }
  };

  return <Radar data={chartData} options={options} />;
}
