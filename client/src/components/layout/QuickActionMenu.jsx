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
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#B88728] hover:bg-[#996E1D] dark:bg-[#F1CB8D] dark:hover:bg-[#F8E0B9] text-white dark:text-[#09090B] shadow-xs dark:shadow-[0_0_15px_-2px_rgba(241,203,141,0.25)] transition-all active:scale-95 cursor-pointer"
        title="Quick Actions"
      >
        <Plus size={15} />
        <span className="hidden sm:inline">Quick Action</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#121216]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1.5 space-y-0.5">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.label}
                  type="button"
                  onClick={() => handleSelect(act.to)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 text-[#996E1D] dark:text-[#F1CB8D] group-hover:scale-105 transition-transform">
                    <Icon size={14} />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white leading-tight">
                      {act.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
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
