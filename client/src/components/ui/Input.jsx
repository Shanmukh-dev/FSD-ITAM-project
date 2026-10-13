import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  icon: Icon,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between tracking-wide"
        >
          <span>{label}</span>
          {helperText && <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-normal">{helperText}</span>}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`w-full bg-white dark:bg-[#0E0E12] border ${
            error
              ? 'border-zinc-500 focus:border-zinc-500'
              : 'border-black/[0.1] dark:border-white/10 hover:border-[#B88728]/40 dark:hover:border-[#F1CB8D]/40 focus:border-[#B88728] dark:focus:border-[#F1CB8D]'
          } text-zinc-900 dark:text-zinc-100 text-sm rounded-xl py-2.5 ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all duration-150 focus:ring-2 ${
            error ? 'focus:ring-zinc-400/20' : 'focus:ring-[#B88728]/20 dark:focus:ring-[#F1CB8D]/20'
          } disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900 shadow-xs ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{error}</span>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  helperText,
  className = '',
  id,
  children,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between tracking-wide"
        >
          <span>{label}</span>
          {helperText && <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-normal">{helperText}</span>}
        </label>
      )}
      <select
        id={id}
        className={`w-full bg-white dark:bg-[#0E0E12] border ${
          error
            ? 'border-zinc-500 focus:border-zinc-500'
            : 'border-black/[0.1] dark:border-white/10 hover:border-[#B88728]/40 dark:hover:border-[#F1CB8D]/40 focus:border-[#B88728] dark:focus:border-[#F1CB8D]'
        } text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all duration-150 focus:ring-2 ${
          error ? 'focus:ring-zinc-400/20' : 'focus:ring-[#B88728]/20 dark:focus:ring-[#F1CB8D]/20'
        } disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900 shadow-xs ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{error}</span>}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between tracking-wide"
        >
          <span>{label}</span>
          {helperText && <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-normal">{helperText}</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full bg-white dark:bg-[#0E0E12] border ${
          error
            ? 'border-zinc-500 focus:border-zinc-500'
            : 'border-black/[0.1] dark:border-white/10 hover:border-[#B88728]/40 dark:hover:border-[#F1CB8D]/40 focus:border-[#B88728] dark:focus:border-[#F1CB8D]'
        } text-zinc-900 dark:text-zinc-100 text-sm rounded-xl p-3 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all duration-150 focus:ring-2 ${
          error ? 'focus:ring-zinc-400/20' : 'focus:ring-[#B88728]/20 dark:focus:ring-[#F1CB8D]/20'
        } disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900 resize-y shadow-xs ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
