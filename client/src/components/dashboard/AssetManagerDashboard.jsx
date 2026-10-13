import React, { useState, useEffect } from 'react';
import {
  Server,
  PackageCheck,
  CheckCircle2,
  Wrench,
  Clock,
  Coins,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from './StatCard';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import ErrorState from '../shared/ErrorState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const AssetManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/asset-manager');
      if (res.data.success) {
        setData(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fleet operations hub.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton type="stats" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  const purchaseValue = Number(data.financials?.totalPurchaseValue || 0);
  const bookValue = Number(data.financials?.totalCurrentBookValue || 0);
  const depreciationValue = Number(data.financials?.totalDepreciation || 0);
  const retentionPct = purchaseValue > 0 ? Math.round((bookValue / purchaseValue) * 100) : 0;
  const depreciationPct = Math.max(0, 100 - retentionPct);

  return (
    <div className="space-y-6">
      {/* Header Actions Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-[#996E1D] dark:text-[#F1CB8D] bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 px-2.5 py-0.5 rounded-full shadow-xs">
              Asset Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Asset Manager Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage equipment, review requests, and track asset value.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/requests">
            <Button variant="secondary" size="md">
              <Clock size={16} />
              <span>Requests ({data.pendingRequests})</span>
            </Button>
          </Link>
          <Link to="/assets/new">
            <Button variant="primary" size="md">
              <Plus size={16} />
              <span>Add Asset</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Asymmetrical Bento Hero: Capital Valuation & Stacked Sparklines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Financial Capital Hero Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-[#0E0E12]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-bento relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88728]/10 dark:bg-[#F1CB8D]/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#996E1D] dark:text-[#F1CB8D] bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Coins size={12} />
                  Fleet Capital & Book Value
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Straight-Line Model
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Estimated Current Fleet Value</span>
                <div className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums mt-1 flex items-baseline gap-2.5">
                  <span>{formatCurrency(bookValue)}</span>
                  <span className="text-xs font-semibold text-[#996E1D] dark:text-[#F1CB8D] font-sans tracking-normal bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/20 dark:border-[#F1CB8D]/25 px-2 py-0.5 rounded-md">
                    {retentionPct}% Value Retained
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-zinc-500 dark:text-zinc-400">
                Original Cost: <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(purchaseValue)}</span>
              </div>
            </div>

            {/* Value vs Depreciation Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex border border-black/[0.04] dark:border-white/5">
                <div
                  style={{ width: `${retentionPct}%` }}
                  className="h-full bg-gradient-to-r from-[#B88728] to-[#996E1D] dark:from-[#F1CB8D] dark:to-[#C89C57] transition-all duration-500"
                  title={`Retained Book Value: ${retentionPct}%`}
                />
                <div
                  style={{ width: `${depreciationPct}%` }}
                  className="h-full bg-zinc-400/50 dark:bg-zinc-600/50 transition-all duration-500"
                  title={`Accumulated Depreciation: ${depreciationPct}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B88728] dark:bg-[#F1CB8D]" />
                  <span>Book Value ({retentionPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  <span>Depreciation (-{formatCurrency(depreciationValue)})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Sparklines Deck (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Assets"
            value={data.totalAssets}
            subtitle="All registered devices"
            icon={Server}
            color="primary"
          />
          <StatCard
            title="Available"
            value={data.availableAssets}
            subtitle="Ready to assign"
            icon={PackageCheck}
            color="emerald"
          />
          <StatCard
            title="In Use"
            value={data.assignedAssets}
            subtitle="Currently assigned"
            icon={CheckCircle2}
            color="primary"
          />
          <StatCard
            title="In Maintenance"
            value={data.maintenanceAssets}
            subtitle="Service & diagnostics"
            icon={Wrench}
            color="warning"
          />
        </div>
      </div>

      {/* Operational Triage Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/requests" className="block group">
          <Card hover className="h-full border-l-4 border-l-[#B88728] dark:border-l-[#F1CB8D] rounded-2xl sm:rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Pending Requests</span>
                <div className="text-2xl font-extrabold text-zinc-900 dark:text-white tabular-nums mt-1">
                  {data.pendingRequests}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Waiting for your review
                </p>
              </div>
              <ArrowRight size={18} className="text-zinc-400 group-hover:text-[#996E1D] dark:group-hover:text-[#F1CB8D] transition-colors" />
            </div>
          </Card>
        </Link>

        <Link to="/maintenance" className="block group">
          <Card hover className="h-full border-l-4 border-l-zinc-500 dark:border-l-zinc-400 rounded-2xl sm:rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Maintenance Issues</span>
                <div className="text-2xl font-extrabold text-zinc-900 dark:text-white tabular-nums mt-1">
                  {data.maintenanceRequiringAttention}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Needs technician assignment
                </p>
              </div>
              <ArrowRight size={18} className="text-zinc-400 group-hover:text-[#996E1D] dark:group-hover:text-[#F1CB8D] transition-colors" />
            </div>
          </Card>
        </Link>

        <Link to="/assets?status=ASSIGNED" className="block group">
          <Card hover className="h-full border-l-4 border-l-zinc-400 dark:border-l-zinc-300 rounded-2xl sm:rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Upcoming Returns</span>
                <div className="text-2xl font-extrabold text-zinc-900 dark:text-white tabular-nums mt-1">
                  {data.pendingReturns}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Due or past return date
                </p>
              </div>
              <ArrowRight size={18} className="text-zinc-400 group-hover:text-[#996E1D] dark:group-hover:text-[#F1CB8D] transition-colors" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity Log */}
      <Card hover>
        <CardHeader
          title="Recent Activity"
          subtitle="Latest updates to equipment and assignments"
        />
        {(!data.recentActivity || data.recentActivity.length === 0) ? (
          <p className="text-xs text-zinc-400 py-4 text-center">
            No recent activity recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-black/[0.05] dark:divide-white/5 text-xs">
            {data.recentActivity.map((event) => (
              <div
                key={event._id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors rounded-xl px-2"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#B88728]/10 text-[#996E1D] dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] border border-[#B88728]/20 dark:border-[#F1CB8D]/25 uppercase tracking-wide">
                    {event.action}
                  </span>
                  <span className="text-zinc-900 dark:text-white font-semibold">
                    {event.asset?.name || 'Asset'}{' '}
                    <span className="font-mono text-zinc-500 dark:text-zinc-400 font-normal">
                      ({event.asset?.assetTag || 'TAG'})
                    </span>
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    by {event.performedBy?.name || 'System'}
                  </span>
                </div>
                <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AssetManagerDashboard;
