import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Server, FileQuestion, Wrench, UserPlus, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export const QuickActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    {
      label: 'Add Asset',
      description: 'Register a device or equipment',
      icon: Server,
      to: '/assets/new',
      show: hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER),
    },
    {
      label: 'Request Equipment',
      description: 'Ask for new hardware',
      icon: FileQuestion,
      to: '/requests',
      show: !hasRole(ROLES.TECHNICIAN),
    },
    {
      label: 'Report an Issue',
      description: 'Request repair or maintenance',
      icon: Wrench,
      to: '/maintenance',
      show: true,
    },
    {
      label: 'Add Team Member',
      description: 'Create a new user account',
      icon: UserPlus,
      to: '/users',
      show: hasRole(ROLES.ADMIN),
    },
  ].filter((a) => a.show);

  const handleSelect = (to) => {
    setIsOpen(false);
    navigate(to);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
        title="Quick Actions"
      >
        <Plus size={15} />
        <span className="hidden sm:inline">Quick Action</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1.5 space-y-0.5">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  type="button"
                  onClick={() => handleSelect(act.to)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon size={14} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                      {act.label}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      {act.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionMenu;
