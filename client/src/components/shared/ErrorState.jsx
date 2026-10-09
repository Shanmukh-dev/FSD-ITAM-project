import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this information.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center max-w-lg mx-auto shadow-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3 shadow-xs">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-base font-bold text-rose-800 dark:text-rose-300 mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-rose-600 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          <RefreshCw size={14} className="mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
