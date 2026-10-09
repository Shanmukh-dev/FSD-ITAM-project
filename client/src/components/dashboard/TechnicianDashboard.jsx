import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from './StatCard';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import ErrorState from '../shared/ErrorState';
import { formatDateTime } from '../../utils/formatters';

export const TechnicianDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/technician');
      if (res.data.success) {
        setData(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load technician workbench.');
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
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Technician Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Technician Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View assigned repairs, track progress, and log service resolutions.
          </p>
        </div>

        <Link to="/maintenance">
          <Button variant="primary" size="md">
            <Wrench size={16} />
            <span>View All Repairs</span>
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Awaiting Tech"
          value={data.pendingTriage}
          subtitle="Unassigned tickets"
          icon={Clock}
          color="primary"
        />
        <StatCard
          title="Assigned to You"
          value={data.assignedToMe}
          subtitle="Tickets in your queue"
          icon={Wrench}
          color="emerald"
        />
        <StatCard
          title="In Progress"
          value={data.inProgress}
          subtitle="Currently being repaired"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Completed This Month"
          value={data.completedThisMonth}
          subtitle="Repaired and back in service"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Assigned Tickets Workbench */}
      <Card>
        <CardHeader
          title="My Assigned Repairs"
          subtitle="Equipment currently assigned to you for repair"
          action={
            <Link to="/maintenance" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">
              All tickets
            </Link>
          }
        />

        {(!data.assignedTickets || data.assignedTickets.length === 0) ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No repair tickets assigned to you right now.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F19]/80 border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Reported Issue</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.assignedTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{t.asset?.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {t.asset?.assetTag}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {t.description}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          t.priority === 'CRITICAL'
                            ? 'danger'
                            : t.priority === 'HIGH'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          t.status === 'COMPLETED'
                            ? 'success'
                            : t.status === 'IN_PROGRESS'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] tabular-nums">
                      {formatDateTime(t.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/maintenance/${t._id}`}>
                        <Button variant="ghost" size="sm">
                          <span>Log Work</span>
                          <ExternalLink size={12} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TechnicianDashboard;
