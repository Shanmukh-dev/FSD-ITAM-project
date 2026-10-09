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

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-emerald-700 dark:text-emerald bg-emerald-50 dark:bg-emerald/10 border border-emerald-200 dark:border-emerald/20 px-2.5 py-0.5 rounded-full">
              My Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Equipment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View your assigned devices, track requests, and report issues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/maintenance">
            <Button variant="danger" size="md">
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

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="My Devices"
          value={data.myAssetsCount}
          subtitle="Devices assigned to you"
          icon={Laptop}
          color="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={data.pendingRequestsCount}
          subtitle="Waiting for approval"
          icon={PlusCircle}
          color="primary"
        />
        <StatCard
          title="Account Status"
          value="100%"
          subtitle="Active & verified"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* My Equipment Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500" />
            My Devices
          </h2>
          <Link to="/assets" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors">
            View all assets <ArrowRight size={13} />
          </Link>
        </div>

        {(!data.myAssets || data.myAssets.length === 0) ? (
          <Card className="text-center py-10">
            <Laptop size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-900 dark:text-white font-semibold">No devices assigned yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
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
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white font-semibold flex items-center gap-1">
                      <Tag size={12} className="text-indigo-600 dark:text-indigo-400" />
                      {asset.assetTag}
                    </span>
                    <AssetStatusBadge status={asset.status} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                    {asset.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {asset.brand} {asset.model} • <span className="font-mono text-slate-500">SN: #{asset.serialNumber}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="text-slate-900 dark:text-white font-medium">{asset.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Condition:</span>
                      <span className="text-slate-900 dark:text-white font-medium">{asset.condition}</span>
                    </div>
                    {asset.location && (
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{asset.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex gap-2">
                  <Link to={`/assets/${asset._id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      Details <ExternalLink size={12} />
                    </Button>
                  </Link>
                  <Link to="/maintenance" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-500/30 hover:border-amber-500">
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
      <Card>
        <CardHeader
          title="Recent Requests"
          subtitle="Track the status of your equipment and repair requests"
          action={
            <Link to="/requests" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">
              View all
            </Link>
          }
        />
        {(!data.myRequests || data.myRequests.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            You don't have any requests right now.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {data.myRequests.map((req) => (
              <div
                key={req._id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Request for {req.category}
                    </span>
                    <Badge
                      variant={
                        req.status === 'APPROVED' || req.status === 'FULFILLED'
                          ? 'success'
                          : req.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Reason: "{req.reason}"
                  </p>
                </div>
                <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
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
