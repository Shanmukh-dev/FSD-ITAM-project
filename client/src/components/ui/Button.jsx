import React from 'react';

const variants = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white shadow-xs border border-indigo-600 font-medium',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 active:scale-[0.98]',
  outline:
    'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-indigo-500 dark:text-slate-300 dark:border-white/15 dark:hover:bg-white/[0.06] dark:hover:border-indigo-400 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/[0.06] active:scale-[0.98]',
  danger:
    'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 dark:text-rose-300 dark:border-rose-500/30 active:scale-[0.98]',
  warning:
    'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-400 dark:border-amber-500/30 active:scale-[0.98]',
  success:
    'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-400 dark:border-emerald-500/30 active:scale-[0.98]',
};

const sizes = {
  xs: 'px-2 py-1 text-[11px] rounded-md',
  sm: 'px-2.5 py-1.5 text-xs rounded-md font-medium',
  md: 'px-3.5 py-2 text-xs sm:text-sm rounded-lg font-medium',
  lg: 'px-5 py-2.5 text-sm sm:text-base rounded-lg font-semibold',
  icon: 'p-2 rounded-lg',
  iconSm: 'p-1.5 rounded-md',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
