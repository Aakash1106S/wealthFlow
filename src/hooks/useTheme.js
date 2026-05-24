import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useTheme() {
  const { state: authState, updateUser } = useContext(AuthContext);
  
  const [theme, setThemeState] = useState(() => {
    // Priority: authState.user.theme -> localStorage -> 'dark'
    if (authState?.user?.theme) return authState.user.theme;
    const stored = localStorage.getItem('wf_theme');
    if (stored) return stored;
    return 'dark';
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wf_theme', theme);
  }, [theme]);

  // If user theme in context updates (e.g., from database on login/sync), apply it
  useEffect(() => {
    if (authState?.user?.theme && authState.user.theme !== theme) {
      setThemeState(authState.user.theme);
    }
  }, [authState?.user?.theme, theme]);

  const setTheme = useCallback(async (newTheme) => {
    if (newTheme !== 'dark' && newTheme !== 'light') return;
    setThemeState(newTheme);
    localStorage.setItem('wf_theme', newTheme);
    
    // If logged in, sync with server profile
    if (authState.isAuthenticated) {
      try {
        await updateUser({ theme: newTheme });
      } catch (err) {
        console.error('Failed to sync theme with server:', err);
      }
    }
  }, [authState.isAuthenticated, updateUser]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
