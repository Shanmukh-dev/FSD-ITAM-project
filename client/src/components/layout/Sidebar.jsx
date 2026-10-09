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
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-[#0D131F] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64`}
      >
        <div>
          {/* Brand Header */}
          <div
            className={`h-16 flex items-center border-b border-slate-200/80 dark:border-white/[0.08] ${
              isCollapsed ? 'lg:justify-center px-3' : 'justify-between px-4'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className={isCollapsed ? 'lg:hidden' : 'block'}>
                <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  IT Asset Manager
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Equipment & Devices
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
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                        isCollapsed ? 'lg:justify-center lg:px-2' : ''
                      } ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600 dark:bg-indigo-500/15 dark:text-white dark:border-indigo-400 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                      {item.label}
                    </span>

                    {/* Floating Tooltip for Collapsed Rail */}
                    {isCollapsed && (
                      <span className="hidden lg:group-hover:block absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* Footer Area: Desktop Collapse Toggle */}
        <div className="hidden lg:block p-2 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#070A12]/50">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={`w-full flex items-center py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all cursor-pointer ${
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
