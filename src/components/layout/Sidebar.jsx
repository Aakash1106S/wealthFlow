import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, BarChart2,
  Target, User, LogOut, Wallet, FileText, Settings, X
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

export function Sidebar({ isOpen, onClose }) {
  const { state, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="no-print sidebar hidden md:flex flex-col sidebar-scroll">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Wallet size={16} color="#000" />
          </div>
          <div className="sidebar-logo-details">
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
                  <span className="sidebar-text">{label}</span>
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
                  <span className="sidebar-text">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="sidebar-nav-item w-full text-left hover:text-red-400 hover:bg-red-500/5"
          >
            <LogOut size={15} className="nav-icon" />
            <span className="sidebar-text">Logout</span>
          </button>

          <div className="sidebar-user mt-1">
            <div className="sidebar-avatar">
              {state.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 sidebar-user-details">
              <div className="sidebar-user-name">{state.user?.name || 'User'}</div>
              <div className="sidebar-user-email">{state.user?.email || ''}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (with AnimatePresence) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black backdrop-blur-sm z-[99] md:hidden"
            />

            {/* Slide-in Sidebar Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 h-screen w-[240px] bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col z-[100] md:hidden sidebar-scroll"
            >
              {/* Logo & Close Button */}
              <div className="sidebar-logo flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                  <div className="sidebar-logo-icon">
                    <Wallet size={16} color="#000" />
                  </div>
                  <div>
                    <div className="sidebar-logo-text">WealthFlow</div>
                    <div className="sidebar-logo-sub">Personal Finance</div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer flex items-center justify-center"
                  aria-label="Close sidebar"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Nav */}
              <nav className="sidebar-nav flex-1 sidebar-scroll">
                <div className="sidebar-section-label">Main Menu</div>
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={15} className={`nav-icon ${isActive ? 'text-[var(--accent)]' : ''}`} />
                        <span>{label}</span>
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
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={15} className={`nav-icon ${isActive ? 'text-[var(--accent)]' : ''}`} />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}

                <button
                  onClick={() => {
                    onClose();
                    handleLogout();
                  }}
                  className="sidebar-nav-item w-full text-left hover:text-red-400 hover:bg-red-500/5"
                >
                  <LogOut size={15} className="nav-icon" />
                  <span>Logout</span>
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
