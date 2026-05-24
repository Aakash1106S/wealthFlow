import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

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
        <button className="navbar-action-btn" aria-label="Notifications">
          <Bell size={14} />
        </button>
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
