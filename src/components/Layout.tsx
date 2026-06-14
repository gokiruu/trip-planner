import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  onSignOut?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onSignOut }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'My Trips' },
    { path: '/create', label: 'New Trip' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="site-nav">
        <div className="site-nav-inner">
          <Link to="/" className="site-nav-brand">
            Trip Planner
          </Link>
          <div className="site-nav-links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`site-nav-link${location.pathname === item.path ? ' active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            {onSignOut && (
              <button onClick={onSignOut} className="site-nav-signout">
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="site-main">
        {children}
      </main>
    </div>
  );
};
