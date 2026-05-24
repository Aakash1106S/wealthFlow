import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const typeColors = {
  success: { bg: 'rgba(0,212,170,0.08)', border: 'rgba(0,212,170,0.2)', text: '#00d4aa' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  danger: { bg: 'rgba(255,71,87,0.08)', border: 'rgba(255,71,87,0.2)', text: '#ff4757' },
  info: { bg: 'rgba(74,158,255,0.08)', border: 'rgba(74,158,255,0.2)', text: '#4a9eff' },
  tip: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', text: '#8b5cf6' },
};

export function AIInsightsPanel({ insights, loading, onRefresh }) {
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());

  const visible = insights.filter(i => !dismissed.has(i.title));

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 6 }} />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: 'pointer',
        }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>AI Insights</span>
          {visible.length > 0 && (
            <span style={{
              fontSize: 9, fontWeight: 700, background: 'var(--accent)', color: '#000',
              borderRadius: 10, padding: '2px 7px', letterSpacing: '0.05em',
            }}>
              {visible.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onRefresh && (
            <button
              onClick={(e) => { e.stopPropagation(); onRefresh(); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
              title="Refresh insights"
            >
              <RefreshCw size={12} />
            </button>
          )}
          {expanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visible.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 11 }}>
                  🎉 All looks great! No alerts right now.
                </div>
              ) : (
                visible.map((insight, i) => {
                  const colors = typeColors[insight.type] || typeColors.info;
                  return (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 10,
                        padding: '10px 12px',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{insight.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: colors.text, marginBottom: 2 }}>
                            {insight.title}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            {insight.message}
                          </div>
                        </div>
                        <button
                          onClick={() => setDismissed(d => new Set([...d, insight.title]))}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 2, flexShrink: 0,
                          }}
                          title="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
