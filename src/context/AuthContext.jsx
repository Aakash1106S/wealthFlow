import { createContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    try {
      const user = localStorage.getItem('auth_user');
      if (user) {
        const parsed = JSON.parse(user);
        return { user: parsed, isAuthenticated: true };
      }
    } catch {}
    return initialState;
  });

  const login = (email, password, remember = false) => {
    // Check if user is registered
    const registered = localStorage.getItem('registered_users');
    let users = [];
    try { users = JSON.parse(registered) || []; } catch {}
    
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    const user = { name: found.name, email: found.email, currency: found.currency || 'INR', avatar: found.avatar || '' };
    localStorage.setItem('auth_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: user });
    return { success: true };
  };

  const register = (name, email, password, currency = 'INR') => {
    const registered = localStorage.getItem('registered_users');
    let users = [];
    try { users = JSON.parse(registered) || []; } catch {}
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const newUser = { name, email, password, currency, avatar: '' };
    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    const user = { name, email, currency, avatar: '' };
    localStorage.setItem('auth_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: user });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updatedUser) => {
    const user = { ...state.user, ...updatedUser };
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    // Update in registered_users too
    const registered = localStorage.getItem('registered_users');
    let users = [];
    try { users = JSON.parse(registered) || []; } catch {}
    const idx = users.findIndex(u => u.email === user.email);
    if (idx > -1) {
      users[idx] = { ...users[idx], ...updatedUser };
      localStorage.setItem('registered_users', JSON.stringify(users));
    }
    
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
