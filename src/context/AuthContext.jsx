import { createContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // start true to avoid flash
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('wf_token');
      const cachedUser = localStorage.getItem('wf_user');

      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Use cached user immediately for fast UI
      if (cachedUser) {
        try {
          const user = JSON.parse(cachedUser);
          dispatch({ type: 'LOGIN', payload: { user, token } });
        } catch {}
      }

      // Verify token with server in background
      try {
        const { data } = await authAPI.getMe();
        if (data.user) {
          localStorage.setItem('wf_user', JSON.stringify(data.user));
          dispatch({ type: 'LOGIN', payload: { user: data.user, token } });
        }
      } catch {
        // Token invalid — clear and logout
        localStorage.removeItem('wf_token');
        localStorage.removeItem('wf_user');
        dispatch({ type: 'LOGOUT' });
      }
    };

    restoreSession();

    // Listen for unauthorized events from API interceptor
    const handleUnauthorized = () => {
      localStorage.removeItem('wf_token');
      localStorage.removeItem('wf_user');
      dispatch({ type: 'LOGOUT' });
    };
    window.addEventListener('wf:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('wf:unauthorized', handleUnauthorized);
  }, []);

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('wf_token', data.token);
        localStorage.setItem('wf_user', JSON.stringify(data.user));
        dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  }, []);

  // ── REGISTER ─────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, currency = 'INR') => {
    try {
      const { data } = await authAPI.register({ name, email, password, currency });
      if (data.success) {
        localStorage.setItem('wf_token', data.token);
        localStorage.setItem('wf_user', JSON.stringify(data.user));
        dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  }, []);

  // ── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('wf_token');
    localStorage.removeItem('wf_user');
    // Clear old localStorage keys too
    localStorage.removeItem('auth_user');
    localStorage.removeItem('transactions');
    localStorage.removeItem('budgets');
    localStorage.removeItem('savings_goals');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ── UPDATE USER ───────────────────────────────────────────────────────────
  const updateUser = useCallback(async (updates) => {
    try {
      const { data } = await authAPI.updateProfile(updates);
      if (data.success) {
        localStorage.setItem('wf_user', JSON.stringify(data.user));
        dispatch({ type: 'UPDATE_USER', payload: data.user });
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (err) {
      // Optimistic update if offline
      const updated = { ...state.user, ...updates };
      localStorage.setItem('wf_user', JSON.stringify(updated));
      dispatch({ type: 'UPDATE_USER', payload: updates });
      return { success: true };
    }
  }, [state.user]);

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  const forgotPassword = useCallback(async (email) => {
    try {
      const { data } = await authAPI.forgotPassword(email);
      return { success: true, message: data.message, resetUrl: data.resetUrl };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Request failed.' };
    }
  }, []);

  // ── RESET PASSWORD ────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (token, password) => {
    try {
      const { data } = await authAPI.resetPassword(token, password);
      if (data.token) {
        localStorage.setItem('wf_token', data.token);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Reset failed.' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      state,
      dispatch,
      login,
      register,
      logout,
      updateUser,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
