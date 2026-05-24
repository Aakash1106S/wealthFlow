import { useState, useEffect, useCallback } from 'react';
import { insightsAPI, notificationAPI } from '../services/api';

export function useInsights() {
  const [insights, setInsights] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [recurring, setRecurring] = useState({ manual: [], autoDetected: [], monthlyTotal: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const [insightsRes, healthRes, recurringRes] = await Promise.all([
        insightsAPI.getInsights(),
        insightsAPI.getHealthScore(),
        insightsAPI.getRecurring(),
      ]);
      setInsights(insightsRes.data.data || []);
      setHealthScore(healthRes.data.data);
      setRecurring(recurringRes.data.data || { manual: [], autoDetected: [], monthlyTotal: 0 });
    } catch (err) {
      setError(err.message);
      console.error('Insights fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { insights, healthScore, recurring, loading, error, refresh: fetchInsights };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notificationAPI.getAll({ limit: 30 });
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Notifications fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const deleteNotif = useCallback(async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 2 minutes for new notifications
    const interval = setInterval(fetchNotifications, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, markRead, markAllRead, deleteNotif, clearAll, refresh: fetchNotifications };
}
