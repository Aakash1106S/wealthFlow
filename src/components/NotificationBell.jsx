import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X } from 'lucide-react';

const typeIcons = {
  budget_exceeded: '🚨',
  budget_warning: '⚠️',
  savings_milestone: '🎯',
  recurring_due: '🔄',
  high_spending: '📈',
  low_savings: '💰',
  weekly_summary: '📊',
  goal_completed: '🏆',
  system: '🔔',
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationBell({ notifications, unreadCount, onMarkRead, onMarkAllRead, onDelete, onClearAll }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          width: 34, height: 34,
          borderRadius: 10,
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        aria-label="Notifications"
      >
        <Bell size={15} color="var(--text-secondary)" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: -4, right: -4,
                background: '#ff4757', color: '#fff',
                fontSize: 9, fontWeight: 700,
                width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-primary)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 42, right: 0,
              width: 340,
              background: 'var(--bg-card-2)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              zIndex: 1000,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, background: '#ff4757', color: '#fff', borderRadius: 10, padding: '2px 6px' }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    style={{ fontSize: 10, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <Check size={11} /> All read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    style={{ fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                  No notifications yet
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n._id}
                    style={{
                      padding: '11px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: n.read ? 'transparent' : 'rgba(0,212,170,0.03)',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                    onClick={() => !n.read && onMarkRead(n._id)}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                      {n.icon || typeIcons[n.type] || '🔔'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: n.read ? 500 : 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {!n.read && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(n._id); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex', opacity: 0.6 }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
