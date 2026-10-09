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
          className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between tracking-wide"
        >
          <span>{label}</span>
          {helperText && <span className="text-slate-400 dark:text-slate-500 text-[11px]">{helperText}</span>}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`w-full bg-white dark:bg-[#070A12]/90 border ${
            error
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 focus:border-indigo-600 dark:focus:border-indigo-500'
          } text-slate-900 dark:text-slate-100 text-sm rounded-lg py-2 ${
            Icon ? 'pl-9 pr-3.5' : 'px-3.5'
          } placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-150 focus:ring-1 ${
            error ? 'focus:ring-rose-500' : 'focus:ring-indigo-500/30'
          } disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">{error}</span>}
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
          className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between tracking-wide"
        >
          <span>{label}</span>
          {helperText && <span className="text-slate-400 dark:text-slate-500 text-[11px]">{helperText}</span>}
        </label>
      )}
      <select
        id={id}
        className={`w-full bg-white dark:bg-[#070A12]/90 border ${
          error
            ? 'border-rose-500 focus:border-rose-500'
            : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 focus:border-indigo-600 dark:focus:border-indigo-500'
        } text-slate-900 dark:text-slate-100 text-sm rounded-lg px-3.5 py-2 outline-none transition-all duration-150 focus:ring-1 ${
          error ? 'focus:ring-rose-500' : 'focus:ring-indigo-500/30'
        } disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">{error}</span>}
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
          className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between tracking-wide"
        >
          <span>{label}</span>
          {helperText && <span className="text-slate-400 dark:text-slate-500 text-[11px]">{helperText}</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full bg-white dark:bg-[#070A12]/90 border ${
          error
            ? 'border-rose-500 focus:border-rose-500'
            : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 focus:border-indigo-600 dark:focus:border-indigo-500'
        } text-slate-900 dark:text-slate-100 text-sm rounded-lg p-3 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-150 focus:ring-1 ${
          error ? 'focus:ring-rose-500' : 'focus:ring-indigo-500/30'
        } disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 resize-y ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
