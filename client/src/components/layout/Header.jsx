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
    <header className="sticky top-3 z-20 mx-3 sm:mx-6 my-2 h-16 px-4 sm:px-6 bg-white/85 dark:bg-[#0E0E12]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-2xl flex items-center justify-between shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all">
      {/* Left Area: Mobile Menu + Contextual Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Live Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Link
            to="/dashboard"
            className="hover:text-[#996E1D] dark:hover:text-[#F1CB8D] transition-colors font-semibold"
          >
            ITAM
          </Link>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const displayName = routeNames[value] || value;

            return (
              <React.Fragment key={to}>
                <ChevronRight size={13} className="text-zinc-400 dark:text-zinc-600" />
                {isLast ? (
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200 truncate max-w-[160px]">
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="hover:text-[#996E1D] dark:hover:text-[#F1CB8D] transition-colors"
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
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.07] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#B88728]/30 dark:hover:border-[#F1CB8D]/30 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-zinc-400 group-hover:text-[#996E1D] dark:group-hover:text-[#F1CB8D] transition-colors" />
            <span className="text-zinc-500 dark:text-zinc-400">Search assets, pages, or press</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/10 rounded-md shadow-xs">
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
          className="md:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
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
          className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-black/[0.08] dark:border-white/10 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/35 flex items-center justify-center text-[#996E1D] dark:text-[#F1CB8D] font-bold text-xs uppercase shadow-xs dark:shadow-[0_0_12px_rgba(241,203,141,0.2)]">
            {user?.name?.slice(0, 2) || 'IT'}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
              {user?.name}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
