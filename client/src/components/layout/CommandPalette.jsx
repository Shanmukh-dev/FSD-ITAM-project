import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Server,
  FileQuestion,
  Wrench,
  Users,
  Building2,
  BarChart3,
  User,
  PlusCircle,
  Sun,
  Moon,
  Monitor,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLES } from '../../utils/constants';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { setTheme } = useTheme();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    // Navigation
    {
      id: 'nav-dashboard',
      section: 'Navigation',
      title: 'Dashboard',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
      show: true,
    },
    {
      id: 'nav-assets',
      section: 'Navigation',
      title: 'Assets',
      icon: Server,
      action: () => navigate('/assets'),
      show: true,
    },
    {
      id: 'nav-requests',
      section: 'Navigation',
      title: 'Equipment Requests',
      icon: FileQuestion,
      action: () => navigate('/requests'),
      show: !hasRole(ROLES.TECHNICIAN),
    },
    {
      id: 'nav-maintenance',
      section: 'Navigation',
      title: 'Maintenance & Repairs',
      icon: Wrench,
      action: () => navigate('/maintenance'),
      show: true,
    },
    {
      id: 'nav-users',
      section: 'Navigation',
      title: 'Team Members',
      icon: Users,
      action: () => navigate('/users'),
      show: hasRole(ROLES.ADMIN),
    },
    {
      id: 'nav-departments',
      section: 'Navigation',
      title: 'Departments',
      icon: Building2,
      action: () => navigate('/departments'),
      show: hasRole(ROLES.ADMIN),
    },
    {
      id: 'nav-reports',
      section: 'Navigation',
      title: 'Reports',
      icon: BarChart3,
      action: () => navigate('/reports'),
      show: hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER),
    },
    {
      id: 'nav-profile',
      section: 'Navigation',
      title: 'My Profile',
      icon: User,
      action: () => navigate('/profile'),
      show: true,
    },

    // Fast Actions
    {
      id: 'action-new-asset',
      section: 'Actions',
      title: 'Add New Asset',
      icon: PlusCircle,
      action: () => navigate('/assets/new'),
      show: hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER),
    },
    {
      id: 'action-request',
      section: 'Actions',
      title: 'Request Equipment',
      icon: PlusCircle,
      action: () => navigate('/requests'),
      show: !hasRole(ROLES.TECHNICIAN),
    },
    {
      id: 'action-maintenance',
      section: 'Actions',
      title: 'Report an Issue',
      icon: PlusCircle,
      action: () => navigate('/maintenance'),
      show: true,
    },

    // Theme Switchers
    {
      id: 'theme-light',
      section: 'Preferences',
      title: 'Switch to Light Theme',
      icon: Sun,
      action: () => setTheme('light'),
      show: true,
    },
    {
      id: 'theme-dark',
      section: 'Preferences',
      title: 'Switch to Dark Theme',
      icon: Moon,
      action: () => setTheme('dark'),
      show: true,
    },
    {
      id: 'theme-system',
      section: 'Preferences',
      title: 'Use System Theme',
      icon: Monitor,
      action: () => setTheme('system'),
      show: true,
    },
  ];

  const filtered = items.filter((item) => {
    if (!item.show) return false;
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.section.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleSelect = (item) => {
    onClose();
    item.action();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, or jump anywhere..."
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 text-sm outline-none placeholder-slate-400"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No matching pages or actions found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}
                    />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {item.section}
                    </span>
                    {isSelected && <ArrowRight size={13} className="text-indigo-500" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↑</kbd>
            <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↓</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↵</kbd>
          </div>
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-indigo-500" />
            Quick Navigation
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
