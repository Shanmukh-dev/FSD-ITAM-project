import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
}) => {
  return (
    <div className="bg-white/85 dark:bg-[#121216]/75 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-[#B88728]/40 dark:hover:border-[#F1CB8D]/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-bento flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow dark:hover:shadow-glow group">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-xl border bg-[#B88728]/10 text-[#996E1D] border-[#B88728]/20 dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/30 shadow-xs dark:shadow-[0_0_12px_rgba(241,203,141,0.2)] group-hover:scale-105 transition-transform">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight tabular-nums">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {trend && (
              <span className="font-semibold text-[#996E1D] dark:text-[#F1CB8D] flex items-center gap-0.5">
                {trend}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
