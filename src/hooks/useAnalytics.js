import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../services/api';

export function useAnalytics() {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    try {
      const { data } = await analyticsAPI.getOverview();
      setOverview(data.data);
    } catch (err) {
      console.error('Analytics overview failed:', err.message);
    }
  }, []);

  const fetchMonthly = useCallback(async (months = 6) => {
    try {
      const { data } = await analyticsAPI.getMonthly(months);
      setMonthly(data.data || []);
    } catch (err) {
      console.error('Analytics monthly failed:', err.message);
    }
  }, []);

  const fetchCategories = useCallback(async (month) => {
    try {
      const { data } = await analyticsAPI.getCategories(month);
      setCategories(data.data || []);
    } catch (err) {
      console.error('Analytics categories failed:', err.message);
    }
  }, []);

  const fetchHeatmap = useCallback(async (month) => {
    try {
      const { data } = await analyticsAPI.getHeatmap(month);
      setHeatmap(data.data || {});
    } catch (err) {
      console.error('Analytics heatmap failed:', err.message);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchOverview(), fetchMonthly(), fetchCategories()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchMonthly, fetchCategories]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    overview,
    monthly,
    categories,
    heatmap,
    loading,
    error,
    fetchOverview,
    fetchMonthly,
    fetchCategories,
    fetchHeatmap,
    refresh: fetchAll,
  };
}
