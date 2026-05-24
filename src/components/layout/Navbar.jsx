import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { NotificationBell } from '../NotificationBell';
import { useNotifications } from '../../hooks/useInsights';
import { useTheme } from '../../hooks/useTheme';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/budget': 'Budget',
  '/reports': 'Monthly Reports',
  '/profile': 'Settings',
};

export function Navbar() {
  const { state } = useContext(AuthContext);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'WealthFlow';
  
  const { notifications, unreadCount, markRead, markAllRead, deleteNotif, clearAll } = useNotifications();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="no-print navbar">
      <div className="navbar-left">
        <span className="navbar-breadcrumb">WealthFlow</span>
        <span className="navbar-separator">/</span>
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <button className="navbar-action-btn" aria-label="Search">
          <Search size={14} />
        </button>
        
        <button 
          className="navbar-action-btn" 
          onClick={toggleTheme} 
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onDelete={deleteNotif}
          onClearAll={clearAll}
        />

        <div
          className="sidebar-avatar"
          style={{ width: 30, height: 30, borderRadius: 8, fontSize: 12 }}
        >
          {state.user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
