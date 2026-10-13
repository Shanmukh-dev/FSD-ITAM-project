import React from 'react';

const variants = {
  primary:
    'bg-[#B88728] hover:bg-[#996E1D] text-white dark:bg-[#F1CB8D] dark:hover:bg-[#F8E0B9] dark:text-[#09090B] font-semibold shadow-xs dark:shadow-[0_0_15px_-2px_rgba(241,203,141,0.25)] border border-transparent active:scale-[0.98]',
  secondary:
    'bg-black/[0.04] hover:bg-black/[0.08] text-zinc-800 border border-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-zinc-200 dark:border-white/10 active:scale-[0.98]',
  outline:
    'bg-transparent hover:bg-black/[0.04] text-zinc-700 border border-black/[0.15] hover:border-[#B88728] dark:text-zinc-300 dark:border-white/15 dark:hover:bg-white/[0.06] dark:hover:border-[#F1CB8D] active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-black/[0.04] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/[0.06] active:scale-[0.98]',
  danger:
    'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 active:scale-[0.98]',
  warning:
    'bg-[#B88728]/15 hover:bg-[#B88728]/25 text-[#996E1D] border border-[#B88728]/30 dark:bg-[#F1CB8D]/15 dark:hover:bg-[#F1CB8D]/25 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/30 active:scale-[0.98]',
  success:
    'bg-[#B88728]/15 hover:bg-[#B88728]/25 text-[#996E1D] border border-[#B88728]/30 dark:bg-[#F1CB8D]/15 dark:hover:bg-[#F1CB8D]/25 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/30 active:scale-[0.98]',
};

const sizes = {
  xs: 'px-2 py-1 text-[11px] rounded-lg',
  sm: 'px-2.5 py-1.5 text-xs rounded-xl font-medium',
  md: 'px-3.5 py-2 text-xs sm:text-sm rounded-xl font-medium',
  lg: 'px-5 py-2.5 text-sm sm:text-base rounded-2xl font-semibold',
  icon: 'p-2 rounded-xl',
  iconSm: 'p-1.5 rounded-lg',
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
