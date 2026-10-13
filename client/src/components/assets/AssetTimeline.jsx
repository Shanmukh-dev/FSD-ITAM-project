import React from 'react';
import {
  PlusCircle,
  UserCheck,
  RotateCcw,
  Repeat,
  Wrench,
  CheckCircle,
  Archive,
  Trash2,
  Activity,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

const ACTION_ICONS = {
  CREATED: PlusCircle,
  ASSIGNED: UserCheck,
  RETURNED: RotateCcw,
  TRANSFERRED: Repeat,
  MAINTENANCE_STARTED: Wrench,
  MAINTENANCE_COMPLETED: CheckCircle,
  STATUS_CHANGED: Activity,
  RETIRED: Archive,
  DISPOSED: Trash2,
};

const ACTION_COLORS = {
  CREATED: 'text-[#996E1D] border-[#B88728]/30 bg-[#B88728]/10 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/40 dark:bg-[#F1CB8D]/15',
  ASSIGNED: 'text-zinc-900 border-zinc-300 bg-zinc-100 dark:text-[#F8FAFC] dark:border-white/20 dark:bg-white/10',
  RETURNED: 'text-zinc-700 border-zinc-200 bg-zinc-50 dark:text-zinc-300 dark:border-white/10 dark:bg-white/5',
  TRANSFERRED: 'text-[#996E1D] border-[#B88728]/30 bg-[#B88728]/10 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/40 dark:bg-[#F1CB8D]/15',
  MAINTENANCE_STARTED: 'text-zinc-600 border-zinc-300 bg-zinc-100 dark:text-zinc-400 dark:border-white/15 dark:bg-white/5',
  MAINTENANCE_COMPLETED: 'text-[#996E1D] border-[#B88728]/30 bg-[#B88728]/10 dark:text-[#F1CB8D] dark:border-[#F1CB8D]/40 dark:bg-[#F1CB8D]/15',
  STATUS_CHANGED: 'text-zinc-700 border-zinc-300 bg-zinc-100 dark:text-zinc-200 dark:border-white/20 dark:bg-white/10',
  RETIRED: 'text-zinc-500 border-zinc-200 bg-zinc-100 dark:text-zinc-500 dark:border-white/10 dark:bg-white/5',
  DISPOSED: 'text-zinc-600 border-zinc-300 bg-zinc-200 dark:text-zinc-400 dark:border-white/20 dark:bg-white/10',
};

export const AssetTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        No activity recorded for this asset yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
      {history.map((event) => {
        const Icon = ACTION_ICONS[event.action] || Activity;
        const colorStyle =
          ACTION_COLORS[event.action] || 'text-slate-700 border-slate-300 bg-slate-100 dark:text-white dark:border-white/20 dark:bg-white/10';

        return (
          <div key={event._id} className="relative flex items-start gap-4 text-xs">
            {/* Timeline Marker */}
            <div
              className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${colorStyle}`}
            >
              <Icon size={11} />
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-[#070A12]/70 border border-slate-200/80 dark:border-white/5 rounded-xl p-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <span className="font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                  {event.action.replace('_', ' ')}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>

              <div className="text-slate-600 dark:text-slate-400 text-xs">
                By:{' '}
                <span className="text-slate-900 dark:text-white font-semibold">
                  {event.performedBy?.name || 'System'}
                </span>
              </div>

              {event.details && Object.keys(event.details).length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/5 font-mono text-[11px] space-y-1">
                  {Object.entries(event.details).map(([key, val]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-slate-500 dark:text-slate-400 capitalize">{key}:</span>
                      <span className="text-slate-900 dark:text-white font-medium">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssetTimeline;
