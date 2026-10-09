import React from 'react';
import { Menu, Search, ChevronRight, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import QuickActionMenu from './QuickActionMenu';
import { ROLE_LABELS } from '../../utils/constants';

export const Header = ({ onOpenSidebar, onOpenCommandPalette }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Generate dynamic breadcrumb segments
  const pathnames = location.pathname.split('/').filter((x) => x);
  const routeNames = {
    dashboard: 'Dashboard',
    assets: 'Assets',
    requests: 'Requests',
    maintenance: 'Maintenance',
    users: 'Team Members',
    departments: 'Departments',
    reports: 'Reports',
    profile: 'Profile',
    new: 'Add Asset',
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left Area: Mobile Menu + Contextual Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Live Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/dashboard"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            ITAM
          </Link>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const displayName = routeNames[value] || value;

            return (
              <React.Fragment key={to}>
                <ChevronRight size={13} className="text-slate-400 dark:text-slate-600" />
                {isLast ? (
                  <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[160px]">
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {displayName}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Command Palette Trigger Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span className="text-slate-500 dark:text-slate-400">Search assets, pages, or press</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Area: Actions, Theme, Notifications & User */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Global Quick Action Menu */}
        <QuickActionMenu />

        {/* Theme Toggle (Single Icon or Segmented) */}
        <ThemeToggle variant="icon" />

        {/* In-app Notification Bell */}
        <NotificationBell />

        {/* User Identity Chip */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-white/10 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase shadow-xs">
            {user?.name?.slice(0, 2) || 'IT'}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
              {user?.name}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
