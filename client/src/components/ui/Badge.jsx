import React from 'react';

const variants = {
  default:
    'bg-black/[0.03] text-zinc-600 border-black/[0.06] dark:bg-white/[0.04] dark:text-zinc-300 dark:border-white/10',
  primary:
    'bg-[#B88728]/12 text-[#996E1D] border-[#B88728]/25 dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/30 dark:shadow-[0_0_10px_-2px_rgba(241,203,141,0.25)]',
  gold:
    'bg-[#B88728]/12 text-[#996E1D] border-[#B88728]/25 dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/30 dark:shadow-[0_0_10px_-2px_rgba(241,203,141,0.25)]',
  success:
    'bg-[#B88728]/12 text-[#996E1D] border-[#B88728]/25 dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/30 dark:shadow-[0_0_10px_-2px_rgba(241,203,141,0.25)]',
  warning:
    'bg-black/[0.04] text-zinc-700 border-black/10 dark:bg-white/[0.06] dark:text-zinc-300 dark:border-white/10',
  danger:
    'bg-black/[0.06] text-zinc-800 border-black/15 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  info:
    'bg-black/[0.04] text-zinc-900 border-black/10 dark:bg-white/[0.1] dark:text-[#F8FAFC] dark:border-white/20',
  muted:
    'bg-black/[0.03] text-zinc-500 border-black/[0.06] dark:bg-white/[0.04] dark:text-zinc-400 dark:border-white/[0.06]',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-medium',
    lg: 'text-xs px-3 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none ${
        variants[variant] || variants.default
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            variant === 'primary' || variant === 'gold' || variant === 'success'
              ? 'bg-[#B88728] dark:bg-[#F1CB8D] animate-pulse'
              : variant === 'info'
              ? 'bg-zinc-800 dark:bg-white'
              : 'bg-zinc-500 dark:bg-zinc-400'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
