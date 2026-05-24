import { createContext, useReducer, useEffect } from 'react';
import { sampleTransactions, sampleBudgets } from '../utils/sampleData';
import { updateBudgetSpent } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

export const AppContext = createContext(null);

const initialState = {
  transactions: [],
  budgets: [],
  toasts: [],
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
    case 'INIT_DATA':
      return { ...state, transactions: action.payload.transactions, budgets: action.payload.budgets };

    case 'ADD_TRANSACTION': {
      const transactions = [action.payload, ...state.transactions];
      const budgets = updateBudgetSpent(state.budgets, transactions);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('budgets', JSON.stringify(budgets));
      return { ...state, transactions, budgets };
    }

    case 'EDIT_TRANSACTION': {
      const transactions = state.transactions.map(t => t.id === action.payload.id ? action.payload : t);
      const budgets = updateBudgetSpent(state.budgets, transactions);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('budgets', JSON.stringify(budgets));
      return { ...state, transactions, budgets };
    }

    case 'DELETE_TRANSACTION': {
      const transactions = state.transactions.filter(t => t.id !== action.payload);
      const budgets = updateBudgetSpent(state.budgets, transactions);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      localStorage.setItem('budgets', JSON.stringify(budgets));
      return { ...state, transactions, budgets };
    }

    case 'ADD_BUDGET': {
      const budgets = [...state.budgets, action.payload];
      const updated = updateBudgetSpent(budgets, state.transactions);
      localStorage.setItem('budgets', JSON.stringify(updated));
      return { ...state, budgets: updated };
    }

    case 'EDIT_BUDGET': {
      const budgets = state.budgets.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b);
      const updated = updateBudgetSpent(budgets, state.transactions);
      localStorage.setItem('budgets', JSON.stringify(updated));
      return { ...state, budgets: updated };
    }

    case 'DELETE_BUDGET': {
      const budgets = state.budgets.filter(b => b.id !== action.payload);
      localStorage.setItem('budgets', JSON.stringify(budgets));
      return { ...state, budgets };
    }

    case 'ADD_TOAST': {
      const toast = { id: uuidv4(), ...action.payload };
      return { ...state, toasts: [...state.toasts, toast] };
    }

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    case 'OPEN_MODAL':
      return { ...state, modals: { ...state.modals, [action.payload.modal]: action.payload.data ?? true } };

    case 'CLOSE_MODAL':
      return { ...state, modals: { ...state.modals, [action.payload]: false } };

    default:
      return state;
  }
}

function loadOrInit() {
  try {
    const txRaw = localStorage.getItem('transactions');
    const bgRaw = localStorage.getItem('budgets');
    
    let transactions = txRaw ? JSON.parse(txRaw) : null;
    let budgets = bgRaw ? JSON.parse(bgRaw) : null;
    
    if (!transactions) {
      transactions = sampleTransactions;
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    if (!budgets) {
      budgets = sampleBudgets;
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
    
    budgets = updateBudgetSpent(budgets, transactions);
    return { transactions, budgets };
  } catch {
    return { transactions: sampleTransactions, budgets: sampleBudgets };
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const data = loadOrInit();
    dispatch({ type: 'INIT_DATA', payload: data });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
