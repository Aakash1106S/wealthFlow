import { motion } from 'framer-motion';

const factorLabels = {
  savingsRate: 'Savings Rate',
  budgetAdherence: 'Budget Control',
  expenseConsistency: 'Consistency',
  emergencyBuffer: 'Emergency Fund',
  recurringControl: 'Fixed Costs',
};

export function FinancialHealthScore({ healthScore, loading }) {
  if (loading) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 10 }} />
      </div>
    );
  }

  if (!healthScore) return null;

  const { score, grade, gradeColor, gradeLabel, factors, recommendations } = healthScore;

  // SVG gauge
  const radius = 52;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '18px 20px',
        height: '100%',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' }}>
        Financial Health Score
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
        {/* SVG Score Gauge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={130} height={130} viewBox="0 0 130 130">
            {/* Background ring */}
            <circle
              cx={65} cy={65} r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
            />
            {/* Score ring */}
            <motion.circle
              cx={65} cy={65} r={radius}
              fill="none"
              stroke={gradeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '65px 65px' }}
            />
            {/* Filter for glow */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
          </svg>
          {/* Center text */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: gradeColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
              {score}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              / 100
            </div>
          </div>
        </div>

        {/* Grade + Label */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: gradeColor, letterSpacing: '-0.03em' }}>{grade}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: gradeColor,
              background: `${gradeColor}20`, borderRadius: 6,
              padding: '3px 8px', letterSpacing: '0.05em',
            }}>{gradeLabel}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Based on your last<br />3 months of activity
          </div>
        </div>
      </div>

      {/* Factor Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {Object.entries(factors).map(([key, { score: s, max, label }]) => {
          const pct = (s / max) * 100;
          const barColor = pct >= 80 ? '#00d4aa' : pct >= 50 ? '#4a9eff' : pct >= 30 ? '#f59e0b' : '#ff4757';
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{factorLabels[key] || label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: barColor }}>{s}/{max}</span>
              </div>
              <div className="progress-track" style={{ height: 4 }}>
                <motion.div
                  className="progress-fill"
                  style={{ background: barColor, height: '100%' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Recommendation */}
      {recommendations && recommendations.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 10,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}>
          <span style={{ marginRight: 5 }}>{recommendations[0].icon}</span>
          {recommendations[0].text}
        </div>
      )}
    </motion.div>
  );
}
