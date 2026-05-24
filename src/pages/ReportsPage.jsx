import { useContext, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatMonth } from '../utils/formatters';
import {
  getMonthlyIncome, getMonthlyExpenses, getTopCategories,
  getCategoryTotals, getDailySpending
} from '../utils/calculations';
import { Printer, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ReportsPage() {
  const { state, dispatch } = useContext(AppContext);
  const { state: authState } = useContext(AuthContext);
  const currency = authState.user?.currency || 'INR';
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exporting, setExporting] = useState(false);

  const { transactions } = state;

  const handleExportPDF = async () => {
    const element = document.getElementById('report-print-area');
    if (!element) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Double DPI for high resolution print
        useCORS: true,
        backgroundColor: '#0d0d0f',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`wealthflow-report-${month}.pdf`);
      dispatch({ type: 'ADD_TOAST', payload: { message: 'PDF report exported successfully!', type: 'success' } });
    } catch (err) {
      console.error('PDF export failed:', err);
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Failed to generate PDF.', type: 'error' } });
    } finally {
      setExporting(false);
    }
  };

  const income = getMonthlyIncome(transactions, month);
  const expenses = getMonthlyExpenses(transactions, month);
  const savings = income - expenses;
  const topCategories = getTopCategories(transactions, month, 3);
  const categoryTotals = getCategoryTotals(transactions.filter(t => t.date.startsWith(month)));
  const dailySpend = getDailySpending(transactions, month);

  const dailyChartData = useMemo(() => {
    const entries = Object.entries(dailySpend);
    return {
      labels: entries.map(([d]) => d.slice(8)),
      datasets: [{
        label: 'Daily Spend',
        data: entries.map(([, v]) => v),
        backgroundColor: 'rgba(0,212,170,0.5)',
        borderColor: 'rgba(0,212,170,0.8)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }],
    };
  }, [dailySpend]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--bg-card-2)',
        borderColor: 'var(--border)',
        borderWidth: 1,
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-muted)', font: { size: 10 }, maxTicksLimit: 10 },
        border: { color: 'var(--border)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: 'var(--text-muted)', font: { size: 10 } },
        border: { color: 'var(--border)' },
      },
    },
  };

  const summaryCards = [
    { label: 'Total Income', value: formatCurrency(income, currency), icon: TrendingUp, color: 'var(--green)', bg: 'rgba(0,212,170,0.1)' },
    { label: 'Total Expenses', value: formatCurrency(expenses, currency), icon: TrendingDown, color: 'var(--red)', bg: 'rgba(255,71,87,0.1)' },
    { label: 'Net Savings', value: formatCurrency(savings, currency), icon: DollarSign, color: savings >= 0 ? 'var(--blue)' : 'var(--red)', bg: savings >= 0 ? 'rgba(74,158,255,0.1)' : 'rgba(255,71,87,0.1)' },
  ];

  return (
    <div style={{ padding: '20px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Controls */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="wf-label" style={{ marginBottom: 0 }}>Month</label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="wf-input"
            style={{ width: 'auto' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer size={12} /> Print
          </Button>
          <Button size="sm" onClick={handleExportPDF} loading={exporting}>
            Export PDF
          </Button>
        </div>
      </div>

      <div id="report-print-area" className="print-content" style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '16px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.02em' }}>
          {formatMonth(month)} — Financial Report
        </h2>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {summaryCards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">{label}</span>
                  <div className="stat-card-icon" style={{ background: bg }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                </div>
                <div className="stat-card-value" style={{ color, fontSize: 18 }}>{value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top 3 Categories */}
        <Card style={{ marginBottom: 12 }}>
          <div className="section-header">
            <span className="section-title">Top Spending Categories</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>This month</span>
          </div>
          {topCategories.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No expenses this month</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topCategories.map(([cat, amount], i) => {
                const pct = expenses > 0 ? (amount / expenses) * 100 : 0;
                const colors = ['var(--accent)', 'var(--blue)', 'var(--purple)'];
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{cat}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{formatCurrency(amount, currency)}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: colors[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Daily Spending Chart */}
        <Card style={{ marginBottom: 12 }}>
          <div className="section-header">
            <span className="section-title">Daily Spending Trend</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatMonth(month)}</span>
          </div>
          <div style={{ height: 220 }}>
            <Bar data={dailyChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Category Breakdown Table */}
        <Card>
          <div className="section-header">
            <span className="section-title">Category Breakdown</span>
          </div>
          {Object.keys(categoryTotals).length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No expenses recorded this month.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="wf-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Transactions</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amount]) => (
                      <tr key={cat}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat}</td>
                        <td>
                          <span className="badge badge-gray">
                            {transactions.filter(t => t.date.startsWith(month) && t.category === cat).length} txn
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(amount, currency)}</td>
                        <td style={{ textAlign: 'right' }}>
                          {expenses > 0 ? ((amount / expenses) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  <tr>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 700, borderBottom: 'none' }}>Total</td>
                    <td style={{ borderBottom: 'none' }} />
                    <td style={{ textAlign: 'right', color: 'var(--red)', fontWeight: 700, borderBottom: 'none' }}>{formatCurrency(expenses, currency)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', borderBottom: 'none' }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
