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

  return (
    <div className="space-y-6">
      {/* Header Actions Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              Asset Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Asset Manager Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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

      {/* Top Inventory Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtitle="Under repair or diagnostic"
          icon={Wrench}
          color="warning"
        />
      </div>

      {/* Financial Valuation Banner */}
      <Card className="bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 border border-indigo-200/80 dark:from-slate-900 dark:via-[#162032] dark:to-slate-900 dark:border-indigo-500/25 shadow-xs dark:shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
              <Coins size={24} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                Total Asset Value
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums mt-0.5">
                {formatCurrency(data.financials?.totalCurrentBookValue)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Estimated current book value across all assets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Original Cost
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {formatCurrency(data.financials?.totalPurchaseValue)}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Total Depreciation
              </span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                -{formatCurrency(data.financials?.totalDepreciation)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Operational Triage Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/requests" className="block group">
          <Card hover className="h-full border-l-4 border-l-indigo-600 dark:border-l-indigo-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Requests</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                  {data.pendingRequests}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Waiting for your review
                </p>
              </div>
              <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link to="/maintenance" className="block group">
          <Card hover className="h-full border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Maintenance Issues</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                  {data.maintenanceRequiringAttention}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Needs technician assignment
                </p>
              </div>
              <ArrowRight size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link to="/assets?status=ASSIGNED" className="block group">
          <Card hover className="h-full border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upcoming Returns</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
                  {data.pendingReturns}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Due or past return date
                </p>
              </div>
              <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader
          title="Recent Activity"
          subtitle="Latest updates to equipment and assignments"
        />
        {(!data.recentActivity || data.recentActivity.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No recent activity recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {data.recentActivity.map((event) => (
              <div
                key={event._id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors rounded-lg px-2"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white uppercase tracking-wide">
                    {event.action}
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {event.asset?.name || 'Asset'}{' '}
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-normal">
                      ({event.asset?.assetTag || 'TAG'})
                    </span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    by {event.performedBy?.name || 'System'}
                  </span>
                </div>
                <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
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
