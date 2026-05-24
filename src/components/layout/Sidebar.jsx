import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, BarChart2,
  Target, User, LogOut, Wallet, FileText, Settings
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/budget', icon: Target, label: 'Budget' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

const bottomItems = [
  { to: '/profile', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { state, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="no-print sidebar hidden md:flex flex-col sidebar-scroll">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Wallet size={16} color="#000" />
        </div>
        <div>
          <div className="sidebar-logo-text">WealthFlow</div>
          <div className="sidebar-logo-sub">Personal Finance</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav flex-1 sidebar-scroll">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={`nav-icon ${isActive ? 'text-[var(--accent)]' : ''}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={`nav-icon ${isActive ? 'text-[var(--accent)]' : ''}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-left hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut size={15} className="nav-icon" />
          Logout
        </button>

        <div className="sidebar-user mt-1">
          <div className="sidebar-avatar">
            {state.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="sidebar-user-name">{state.user?.name || 'User'}</div>
            <div className="sidebar-user-email">{state.user?.email || ''}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
