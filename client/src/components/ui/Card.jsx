import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`bg-white/85 dark:bg-[#121216]/75 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-bento text-zinc-900 dark:text-zinc-100 transition-all duration-200 ${
        hover
          ? 'hover:border-[#B88728]/40 dark:hover:border-[#F1CB8D]/40 hover:shadow-glow dark:hover:shadow-glow hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        {title && (
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default Card;
