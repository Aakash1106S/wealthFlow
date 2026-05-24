import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR — attach JWT ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR — handle 401 ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('wf_token');
      localStorage.removeItem('wf_user');
      // Dispatch a custom event instead of direct navigation
      window.dispatchEvent(new CustomEvent('wf:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ENDPOINTS ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ─── TRANSACTION ENDPOINTS ──────────────────────────────────────────────────
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  bulkImport: (transactions) => api.post('/transactions/bulk-import', { transactions }),
};

// ─── BUDGET ENDPOINTS ────────────────────────────────────────────────────────
export const budgetAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// ─── ANALYTICS ENDPOINTS ─────────────────────────────────────────────────────
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getMonthly: (months) => api.get('/analytics/monthly', { params: { months } }),
  getCategories: (month) => api.get('/analytics/categories', { params: { month } }),
  getHeatmap: (month) => api.get('/analytics/heatmap', { params: { month } }),
};

// ─── INSIGHTS ENDPOINTS ──────────────────────────────────────────────────────
export const insightsAPI = {
  getInsights: () => api.get('/insights'),
  getHealthScore: () => api.get('/insights/health-score'),
  getRecurring: () => api.get('/insights/recurring'),
  // Savings goals
  getGoals: () => api.get('/insights/goals'),
  createGoal: (data) => api.post('/insights/goals', data),
  updateGoal: (id, data) => api.put(`/insights/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/insights/goals/${id}`),
};

// ─── NOTIFICATION ENDPOINTS ──────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear-all'),
};

export default api;
