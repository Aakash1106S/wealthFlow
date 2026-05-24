import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export function ExpenseHeatmap({ currency = 'INR' }) {
  const now = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(now);
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(false);

  const monthStr = currentDate.toISOString().slice(0, 7);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchHeatmap = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await analyticsAPI.getHeatmap(monthStr);
      setHeatmapData(data.data || {});
    } catch (err) {
      console.error('Heatmap load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [monthStr]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getHeatmapColor = (amount) => {
    if (!amount || amount === 0) return 'rgba(255,255,255,0.02)';
    if (amount < 300) return 'rgba(0,212,170,0.12)';
    if (amount < 1000) return 'rgba(0,212,170,0.3)';
    if (amount < 3000) return 'rgba(0,212,170,0.55)';
    return 'rgba(0,212,170,0.85)'; // Heavy spending day
  };

  const getIntensityLabel = (amount) => {
    if (!amount || amount === 0) return 'No spending';
    return `${formatCurrency(amount, currency)} spent`;
  };

  return (
    <div style={{ padding: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Daily Spend Intensity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ padding: 4, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {currentDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            disabled={monthStr === now.toISOString().slice(0, 7)}
            style={{ padding: 4, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', opacity: monthStr === now.toISOString().slice(0, 7) ? 0.3 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
          Calculating spending intensity...
        </div>
      ) : (
        <div>
          {/* Week Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <div key={idx} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Heatmap Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array(firstDay).fill(null).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${monthStr}-${String(dayNum).padStart(2, '0')}`;
              const dayData = heatmapData[dateStr] || { total: 0, count: 0 };
              
              return (
                <div
                  key={`day-${dayNum}`}
                  title={`${dateStr}\n${getIntensityLabel(dayData.total)} (${dayData.count} txn)`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 4,
                    background: getHeatmapColor(dayData.total),
                    border: '1px solid rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <span style={{ fontSize: 9, fontWeight: 500, color: dayData.total > 1000 ? '#000' : 'var(--text-muted)', opacity: dayData.total > 0 ? 0.9 : 0.4 }}>
                    {dayNum}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Heatmap Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 12, fontSize: 8, color: 'var(--text-muted)' }}>
            <span>Less</span>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: getHeatmapColor(0) }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: getHeatmapColor(150) }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: getHeatmapColor(600) }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: getHeatmapColor(2000) }} />
            <div style={{ width: 10, height: 10, borderRadius: 2, background: getHeatmapColor(4000) }} />
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
