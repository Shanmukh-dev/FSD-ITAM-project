import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from '../ui/Button';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no items to display right now.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4 shadow-xs">
        <Icon size={28} />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          size="md"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
