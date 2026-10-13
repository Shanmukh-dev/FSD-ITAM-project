import React, { useState, useEffect } from 'react';
import {
  Laptop,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from './StatCard';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import ErrorState from '../shared/ErrorState';
import AssetStatusBadge from '../assets/AssetStatusBadge';
import { formatDate } from '../../utils/formatters';

export const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/employee');
      if (res.data.success) {
        setData(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load self-service deck.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton type="cards" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  const myDevicesCount = Number(data.myAssetsCount || 0);
  const pendingRequestsCount = Number(data.pendingRequestsCount || 0);

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-[#996E1D] dark:text-[#F1CB8D] bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 px-2.5 py-0.5 rounded-full shadow-xs">
              My Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            My Equipment
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            View your assigned devices, track requests, and report issues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/maintenance">
            <Button variant="secondary" size="md">
              <AlertTriangle size={16} />
              <span>Report Issue</span>
            </Button>
          </Link>
          <Link to="/requests">
            <Button variant="primary" size="md">
              <PlusCircle size={16} />
              <span>Request Equipment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Asymmetrical Bento Hero: Personal Workspace & Stacked Sparklines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Workstation Vitality Hero Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-[#0E0E12]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-bento relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88728]/10 dark:bg-[#F1CB8D]/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#996E1D] dark:text-[#F1CB8D] bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Laptop size={12} />
                  Workspace Hardware Vitality
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Active Custody
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Assigned Workstation Assets</span>
                <div className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums mt-1 flex items-baseline gap-2.5">
                  <span>{myDevicesCount}</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans tracking-normal bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    In Service
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-900 dark:text-white">{pendingRequestsCount}</span> equipment request{pendingRequestsCount === 1 ? '' : 's'} in progress
              </div>
            </div>

            {/* Quick Self-Service Action Bar */}
            <div className="mt-6 pt-4 border-t border-black/[0.05] dark:border-white/5 flex items-center gap-3">
              <Link to="/requests" className="flex-1">
                <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-[#B88728]/10 dark:hover:bg-[#F1CB8D]/15 border border-black/[0.06] dark:border-white/5 transition-all text-center">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Request New Gear</span>
                </div>
              </Link>
              <Link to="/maintenance" className="flex-1">
                <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-amber-500/10 border border-black/[0.06] dark:border-white/5 transition-all text-center">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Log Hardware Issue</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Stacked Sparklines Deck (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="My Devices"
            value={myDevicesCount}
            subtitle="Active hardware"
            icon={Laptop}
            color="primary"
          />
          <StatCard
            title="Pending Requests"
            value={pendingRequestsCount}
            subtitle="Under review"
            icon={PlusCircle}
            color="emerald"
          />
          <StatCard
            title="Compliance"
            value="100%"
            subtitle="Security verified"
            icon={ShieldCheck}
            color="primary"
          />
          <StatCard
            title="Service Access"
            value="Active"
            subtitle="All systems ready"
            icon={Tag}
            color="emerald"
          />
        </div>
      </div>

      {/* My Equipment Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B88728] dark:bg-[#F1CB8D]" />
            My Devices
          </h2>
          <Link to="/assets" className="text-xs text-[#996E1D] dark:text-[#F1CB8D] hover:underline flex items-center gap-1 font-semibold transition-colors">
            View all assets <ArrowRight size={13} />
          </Link>
        </div>

        {(!data.myAssets || data.myAssets.length === 0) ? (
          <Card hover className="text-center py-10">
            <Laptop size={32} className="mx-auto text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-900 dark:text-white font-semibold">No devices assigned yet</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
              You don't have any devices assigned to you right now. Need something for work? Submit a request below.
            </p>
            <Link to="/requests">
              <Button size="sm">Request Equipment</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.myAssets.map((asset) => (
              <Card key={asset._id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-[#B88728]/10 text-[#996E1D] dark:bg-[#F1CB8D]/15 dark:text-[#F1CB8D] border border-[#B88728]/20 dark:border-[#F1CB8D]/30 font-semibold flex items-center gap-1">
                      <Tag size={12} />
                      {asset.assetTag}
                    </span>
                    <AssetStatusBadge status={asset.status} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
                    {asset.name}
                  </h3>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {asset.brand} {asset.model} • <span className="font-mono text-zinc-500">SN: #{asset.serialNumber}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/[0.05] dark:border-white/5 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="text-zinc-900 dark:text-white font-medium">{asset.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Condition:</span>
                      <span className="text-zinc-900 dark:text-white font-medium">{asset.condition}</span>
                    </div>
                    {asset.location && (
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="text-zinc-900 dark:text-white font-medium">{asset.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-black/[0.05] dark:border-white/5 flex gap-2">
                  <Link to={`/assets/${asset._id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      Details <ExternalLink size={12} />
                    </Button>
                  </Link>
                  <Link to="/maintenance" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Report Issue
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Open Requests Status */}
      <Card hover>
        <CardHeader
          title="Recent Requests"
          subtitle="Track the status of your equipment and repair requests"
          action={
            <Link to="/requests" className="text-xs text-[#996E1D] dark:text-[#F1CB8D] hover:underline font-semibold transition-colors">
              View all →
            </Link>
          }
        />
        {(!data.myRequests || data.myRequests.length === 0) ? (
          <p className="text-xs text-zinc-400 py-4 text-center">
            You don't have any requests right now.
          </p>
        ) : (
          <div className="divide-y divide-black/[0.05] dark:divide-white/5 text-xs">
            {data.myRequests.map((req) => (
              <div
                key={req._id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      Request for {req.category}
                    </span>
                    <Badge
                      variant={
                        req.status === 'APPROVED' || req.status === 'FULFILLED'
                          ? 'gold'
                          : req.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                    Reason: "{req.reason}"
                  </p>
                </div>
                <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
                  {formatDate(req.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
