import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ variant = 'icon' }) => {
  const { theme, setTheme, activeTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className="flex items-center p-0.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-white text-zinc-900 shadow-xs font-semibold'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
          title="Light Mode"
          aria-label="Light Mode"
        >
          <Sun size={14} className={theme === 'light' ? 'text-[#996E1D]' : ''} />
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-zinc-800 text-white shadow-xs font-semibold'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
          title="Dark Mode"
          aria-label="Dark Mode"
        >
          <Moon size={14} className={theme === 'dark' ? 'text-[#F1CB8D]' : ''} />
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
          title="Follow System OS"
          aria-label="Follow System OS"
        >
          <Monitor size={14} />
        </button>
      </div>
    );
  }

  // Single toggle icon mode
  return (
    <button
      type="button"
      onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 transition-colors cursor-pointer"
      title={`Switch to ${activeTheme === 'dark' ? 'Light' : 'Dark'} mode`}
      aria-label={`Switch to ${activeTheme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {activeTheme === 'dark' ? (
        <Sun size={17} className="text-[#F1CB8D]" />
      ) : (
        <Moon size={17} className="text-[#996E1D]" />
      )}
    </button>
  );
};

export default ThemeToggle;
