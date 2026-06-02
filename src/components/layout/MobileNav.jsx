import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart2, Target, FileText } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Txns' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/budget', icon: Target, label: 'Budget' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export function MobileNav() {
  return (
    <nav className="no-print mobile-nav flex md:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <Icon size={18} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
