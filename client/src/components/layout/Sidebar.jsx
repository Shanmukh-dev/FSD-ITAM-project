import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  FileQuestion,
  Wrench,
  Users,
  Building2,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { hasRole } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      to: '/assets',
      label: hasRole(ROLES.EMPLOYEE) ? 'My Equipment' : 'Assets',
      icon: Server,
      show: true,
    },
    {
      to: '/requests',
      label: 'Requests',
      icon: FileQuestion,
      show: !hasRole(ROLES.TECHNICIAN),
    },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      show: true,
    },
    {
      to: '/users',
      label: 'Team Members',
      icon: Users,
      show: hasRole(ROLES.ADMIN),
    },
    {
      to: '/departments',
      label: 'Departments',
      icon: Building2,
      show: hasRole(ROLES.ADMIN),
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: BarChart3,
      show: hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Floating Island Glassmorphic Sidebar */}
      <aside
        className={`fixed z-40 bg-white/80 dark:bg-[#0E0E12]/85 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } top-0 bottom-0 left-0 w-64 border-r border-black/[0.06] dark:border-white/[0.08] lg:top-4 lg:bottom-4 lg:left-4 lg:h-[calc(100vh-2rem)] lg:rounded-3xl lg:border lg:shadow-xl dark:lg:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div
            className={`h-16 flex items-center border-b border-black/[0.06] dark:border-white/[0.08] ${
              isCollapsed ? 'lg:justify-center px-3' : 'justify-between px-4'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 flex items-center justify-center text-[#996E1D] dark:text-[#F1CB8D] shadow-xs dark:shadow-[0_0_15px_-2px_rgba(241,203,141,0.25)] shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className={isCollapsed ? 'lg:hidden' : 'block'}>
                <div className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  ITAM <span className="text-[10px] uppercase font-bold text-[#996E1D] dark:text-[#F1CB8D] tracking-wider px-1.5 py-0.2 rounded-sm bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/20 dark:border-[#F1CB8D]/25">OS</span>
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  Equipment & Lifecycle
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    title={item.label}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                        isCollapsed ? 'lg:justify-center lg:px-2' : ''
                      } ${
                        isActive
                          ? 'bg-[#B88728]/12 text-[#996E1D] font-semibold border-l-2 border-[#B88728] dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] dark:border-[#F1CB8D] shadow-xs dark:shadow-[0_0_15px_-2px_rgba(241,203,141,0.2)]'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.05]'
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                      {item.label}
                    </span>

                    {/* Floating Tooltip for Collapsed Rail */}
                    {isCollapsed && (
                      <span className="hidden lg:group-hover:block absolute left-full ml-2 px-2.5 py-1 bg-zinc-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none border border-white/10">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* Footer Area: Desktop Collapse Toggle */}
        <div className="hidden lg:block p-2 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-black/30">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={`w-full flex items-center py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
            }`}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} className="shrink-0" />
                <span className="truncate">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
