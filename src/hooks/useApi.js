import { useState, useCallback } from 'react';

/**
 * Generic API hook with loading, error, data states
 */
export function useApi(apiFn, immediate = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFn(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Request failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { data, loading, error, execute };
}
