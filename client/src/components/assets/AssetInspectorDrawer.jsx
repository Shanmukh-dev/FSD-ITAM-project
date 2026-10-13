import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ExternalLink,
  Laptop,
  Layers,
  Building,
  User,
  Calendar,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Wrench,
  Tag,
  Monitor,
  Cpu,
  Hash,
} from 'lucide-react';
import AssetStatusBadge from './AssetStatusBadge';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ASSET_TYPES } from '../../utils/constants';

export const AssetInspectorDrawer = ({ asset, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!asset) return null;

  // Calculate straight-line depreciation if fields are present
  const purchasePrice = Number(asset.purchasePrice || 0);
  const salvageValue = Number(asset.salvageValue || 0);
  const usefulLifeYears = Math.max(1, Number(asset.usefulLifeYears || 3));
  const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date();
  const currentDate = new Date();
  const yearsElapsed = Math.max(
    0,
    (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const totalDepreciable = Math.max(0, purchasePrice - salvageValue);
  const annualDepreciation = totalDepreciable / usefulLifeYears;
  const accumulatedDepreciation = Math.min(
    totalDepreciable,
    annualDepreciation * yearsElapsed
  );
  const currentBookValue = Math.max(
    salvageValue,
    purchasePrice - accumulatedDepreciation
  );
  const depreciationPct =
    totalDepreciable > 0
      ? Math.min(100, (accumulatedDepreciation / totalDepreciable) * 100)
      : 0;

  // Warranty status
  const isWarrantyActive =
    asset.warrantyExpiry && new Date(asset.warrantyExpiry) > new Date();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Frosted Glass Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-Over Glass Panel */}
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-[#0E0E12]/95 backdrop-blur-2xl border-l border-black/[0.08] dark:border-white/[0.1] shadow-2xl h-full flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Header Bar */}
        <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#996E1D] dark:text-[#F1CB8D] px-2.5 py-0.5 rounded-lg bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 shadow-xs">
                  {asset.assetTag}
                </span>
                <AssetStatusBadge status={asset.status} size="sm" />
                <Badge variant={asset.assetType === ASSET_TYPES.HARDWARE ? 'default' : 'secondary'} size="sm">
                  {asset.assetType}
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                {asset.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {asset.brand} {asset.model}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#B88728]/12 text-[#996E1D] dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] font-semibold border border-[#B88728]/25 dark:border-[#F1CB8D]/30 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              360° Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('financials')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'financials'
                  ? 'bg-[#B88728]/12 text-[#996E1D] dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] font-semibold border border-[#B88728]/25 dark:border-[#F1CB8D]/30 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Financials & Value
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custodian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'custodian'
                  ? 'bg-[#B88728]/12 text-[#996E1D] dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] font-semibold border border-[#B88728]/25 dark:border-[#F1CB8D]/30 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Custodian & Location
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Spec Matrix */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Tag size={12} />
                    Category
                  </span>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {asset.category || 'Standard'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Hash size={12} />
                    Serial Number
                  </span>
                  <div className="font-mono font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {asset.serialNumber || 'N/A'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Calendar size={12} />
                    Purchased
                  </span>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {asset.purchaseDate ? formatDate(asset.purchaseDate) : 'Not recorded'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <ShieldCheck size={12} />
                    Warranty
                  </span>
                  <div className="font-medium">
                    {asset.warrantyExpiry ? (
                      <span className={isWarrantyActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        {formatDate(asset.warrantyExpiry)} ({isWarrantyActive ? 'Active' : 'Expired'})
                      </span>
                    ) : (
                      <span className="text-zinc-400">No coverage</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Hardware / Software Specific Specs */}
              {asset.specifications && Object.keys(asset.specifications).length > 0 && (
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Cpu size={13} className="text-[#996E1D] dark:text-[#F1CB8D]" />
                    Hardware Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(asset.specifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 capitalize">{key}</span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {asset.notes && (
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400 block mb-1">Asset Notes</span>
                  <p className="text-zinc-700 dark:text-zinc-300 italic">{asset.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-4">
              {/* Value Summary Card */}
              <div className="p-4 rounded-2xl bg-[#B88728]/10 dark:bg-[#F1CB8D]/10 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 shadow-xs">
                <span className="text-[11px] font-semibold text-[#996E1D] dark:text-[#F1CB8D] uppercase tracking-wider">
                  Current Book Value
                </span>
                <div className="text-2xl font-extrabold text-zinc-900 dark:text-white tabular-nums mt-1 font-mono">
                  {formatCurrency(currentBookValue)}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  {(100 - depreciationPct).toFixed(1)}% of original cost retained
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400">Original Cost</span>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrency(purchasePrice)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400">Total Depreciation</span>
                  <div className="font-bold text-[#996E1D] dark:text-[#F1CB8D] mt-0.5">
                    -{formatCurrency(accumulatedDepreciation)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400">Salvage Floor</span>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {formatCurrency(salvageValue)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400">Lifespan</span>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {usefulLifeYears} Years
                  </div>
                </div>
              </div>

              {/* Visual Depreciation Gauge */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500 dark:text-zinc-400">Depreciation Progress</span>
                  <span className="font-bold text-[#996E1D] dark:text-[#F1CB8D]">
                    {depreciationPct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#B88728] to-[#996E1D] dark:from-[#F1CB8D] dark:to-[#C89C57] transition-all duration-300"
                    style={{ width: `${depreciationPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Purchased</span>
                  <span>{yearsElapsed.toFixed(1)} yrs elapsed</span>
                  <span>End of Life</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custodian' && (
            <div className="space-y-4">
              {/* Custodian Profile Card */}
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-3">
                  <User size={13} className="text-[#996E1D] dark:text-[#F1CB8D]" />
                  Assigned Custodian
                </span>
                {asset.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 flex items-center justify-center font-bold text-sm text-[#996E1D] dark:text-[#F1CB8D]">
                      {asset.assignedTo.name ? asset.assignedTo.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {asset.assignedTo.name || 'Unnamed Employee'}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {asset.assignedTo.email || 'No email registered'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-500 dark:text-zinc-400 italic">
                    Currently unassigned and available in inventory stock.
                  </div>
                )}
              </div>

              {/* Department & Physical Location */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Building size={12} />
                    Department
                  </span>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {asset.department?.name || 'General Inventory'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mb-1">
                    <Layers size={12} />
                    Location / Desk
                  </span>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {asset.location || 'Headquarters'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          <Link to={`/assets/${asset._id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              <span>Open 360° View</span>
              <ExternalLink size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssetInspectorDrawer;
