import { createContext, useReducer, useEffect, useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { transactionAPI, budgetAPI, insightsAPI } from '../services/api';
import { AuthContext } from './AuthContext';

export const AppContext = createContext(null);

const initialState = {
  transactions: [],
  budgets: [],
  savingsGoals: [],
  toasts: [],
  loading: { transactions: false, budgets: false, goals: false },
  error: null,
  pagination: { page: 1, limit: 50, total: 0, pages: 1 },
  modals: {
    addTransaction: false,
    editTransaction: null,
    deleteTransaction: null,
    addBudget: false,
    editBudget: null,
    addGoal: false,
    editGoal: null,
  },
};

function appReducer(state, action) {
  switch (action.type) {
    // ── TRANSACTIONS ──────────────────────────────────────────────────────
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: { ...state.loading, transactions: false } };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'EDIT_TRANSACTION':
      return { ...state, transactions: state.transactions.map(t => t._id === action.payload._id || t.id === action.payload.id ? { ...t, ...action.payload } : t) };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t._id !== action.payload && t.id !== action.payload) };

    // ── BUDGETS ───────────────────────────────────────────────────────────
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload, loading: { ...state.loading, budgets: false } };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets.filter(b => !(b.category === action.payload.category && b.month === action.payload.month)), action.payload] };
    case 'EDIT_BUDGET':
      return { ...state, budgets: state.budgets.map(b => (b._id === action.payload._id || b.id === action.payload.id) ? { ...b, ...action.payload } : b) };
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b._id !== action.payload && b.id !== action.payload) };

    // ── SAVINGS GOALS ─────────────────────────────────────────────────────
    case 'SET_GOALS':
      return { ...state, savingsGoals: action.payload, loading: { ...state.loading, goals: false } };
    case 'ADD_GOAL':
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] };
    case 'EDIT_GOAL':
      return { ...state, savingsGoals: state.savingsGoals.map(g => (g._id === action.payload._id || g.id === action.payload.id) ? { ...g, ...action.payload } : g) };
    case 'DELETE_GOAL':
      return { ...state, savingsGoals: state.savingsGoals.filter(g => g._id !== action.payload && g.id !== action.payload) };

    // ── LOADING ───────────────────────────────────────────────────────────
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } };

    // ── PAGINATION ────────────────────────────────────────────────────────
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };

    // ── TOASTS ────────────────────────────────────────────────────────────
    case 'ADD_TOAST': {
      const toast = { id: uuidv4(), ...action.payload };
      return { ...state, toasts: [...state.toasts, toast] };
    }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    // ── MODALS ────────────────────────────────────────────────────────────
    case 'OPEN_MODAL':
      return { ...state, modals: { ...state.modals, [action.payload.modal]: action.payload.data ?? true } };
    case 'CLOSE_MODAL':
      return { ...state, modals: { ...state.modals, [action.payload]: false } };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { state: authState } = useContext(AuthContext);

  // ── Load data when user logs in ──────────────────────────────────────────
  useEffect(() => {
    if (authState.isAuthenticated && !authState.loading) {
      loadTransactions();
      loadBudgets();
      loadGoals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated, authState.loading]);

  const loadTransactions = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: { transactions: true } });
    try {
      const { data } = await transactionAPI.getAll({ limit: 200, ...params });
      // Normalize: ensure each transaction has a consistent `id` and `note` field
      const normalized = (data.data || []).map(t => ({
        ...t,
        id: t._id || t.id,
        note: t.notes || t.note || '',
        date: t.date || new Date().toISOString(),
      }));
      dispatch({ type: 'SET_TRANSACTIONS', payload: normalized });
      if (data.pagination) dispatch({ type: 'SET_PAGINATION', payload: data.pagination });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: { transactions: false } });
      console.error('Failed to load transactions:', err.message);
    }
  }, []);

  const loadBudgets = useCallback(async (month) => {
    dispatch({ type: 'SET_LOADING', payload: { budgets: true } });
    try {
      const params = month ? { month } : {};
      const { data } = await budgetAPI.getAll(params);
      const normalized = (data.data || []).map(b => ({ ...b, id: b._id || b.id }));
      dispatch({ type: 'SET_BUDGETS', payload: normalized });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: { budgets: false } });
      console.error('Failed to load budgets:', err.message);
    }
  }, []);

  const loadGoals = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { goals: true } });
    try {
      const { data } = await insightsAPI.getGoals();
      const normalized = (data.data || []).map(g => ({ ...g, id: g._id || g.id }));
      dispatch({ type: 'SET_GOALS', payload: normalized });
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: { goals: false } });
      console.error('Failed to load goals:', err.message);
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, loadTransactions, loadBudgets, loadGoals }}>
      {children}
    </AppContext.Provider>
  );
}
