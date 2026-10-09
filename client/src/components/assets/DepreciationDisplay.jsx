import React from 'react';
import { Coins, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

export const DepreciationDisplay = ({ analysis }) => {
  if (!analysis) return null;

  const {
    purchasePrice = 0,
    annualDepreciation = 0,
    accumulatedDepreciation = 0,
    currentBookValue = 0,
    depreciationPercentage = 0,
    usefulLifeYears = 1,
    yearsElapsed = 0,
    isFullyDepreciated = false,
  } = analysis;

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Coins size={16} className="text-amber-500" />
            Depreciation & Value
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Estimated value breakdown based on original purchase price and expected lifespan.
          </p>
        </div>
        {isFullyDepreciated && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            FULLY DEPRECIATED
          </span>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">Purchase Price</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(purchasePrice)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Original cost</div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
            <TrendingDown size={13} className="text-amber-500" />
            Total Depreciation
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            -{formatCurrency(accumulatedDepreciation)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {formatCurrency(annualDepreciation)} / year
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 uppercase font-semibold">Current Value</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(currentBookValue)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {(100 - depreciationPercentage).toFixed(1)}% remaining value
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono mb-2 text-slate-500 dark:text-slate-400">
          <span>Depreciation Progress</span>
          <span>{depreciationPercentage.toFixed(1)}% depreciated</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, depreciationPercentage))}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1.5">
          <span>Purchased: Year 0</span>
          <span>
            {yearsElapsed} yrs elapsed of {usefulLifeYears} yr lifespan
          </span>
        </div>
      </div>
    </Card>
  );
};

export default DepreciationDisplay;
