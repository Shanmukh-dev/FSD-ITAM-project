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

  const assignedToMe = Number(data.assignedToMe || 0);
  const inProgress = Number(data.inProgress || 0);
  const completed = Number(data.completedThisMonth || 0);
  const pendingTriage = Number(data.pendingTriage || 0);
  const totalWorkload = assignedToMe + inProgress + completed;
  const resolutionRate = totalWorkload > 0 ? Math.round((completed / totalWorkload) * 100) : 100;
  const activeQueuePct = totalWorkload > 0 ? Math.round(((assignedToMe + inProgress) / totalWorkload) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-[#996E1D] dark:text-[#F1CB8D] bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B88728] dark:bg-[#F1CB8D] animate-pulse" />
              Technician Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Technician Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
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

      {/* Top Asymmetrical Bento Hero: Service Readiness & Stacked Sparklines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Service Readiness Hero Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-[#0E0E12]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-bento relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88728]/10 dark:bg-[#F1CB8D]/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#996E1D] dark:text-[#F1CB8D] bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Wrench size={12} />
                  Workbench Service Velocity
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Active Shift
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Monthly Ticket Resolution Rate</span>
                <div className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums mt-1 flex items-baseline gap-2.5">
                  <span>{resolutionRate}%</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans tracking-normal bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    {completed} Restored
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-900 dark:text-white">{assignedToMe + inProgress}</span> open tickets in your direct pipeline
              </div>
            </div>

            {/* Workload Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex border border-black/[0.04] dark:border-white/5">
                <div
                  style={{ width: `${resolutionRate}%` }}
                  className="h-full bg-emerald-500 transition-all duration-500"
                  title={`Resolved: ${resolutionRate}%`}
                />
                <div
                  style={{ width: `${activeQueuePct}%` }}
                  className="h-full bg-gradient-to-r from-[#B88728] to-[#996E1D] dark:from-[#F1CB8D] dark:to-[#C89C57] transition-all duration-500"
                  title={`Active Queue: ${activeQueuePct}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Resolved This Month ({completed})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B88728] dark:bg-[#F1CB8D]" />
                  <span>In Queue ({assignedToMe + inProgress})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Sparklines Deck (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Awaiting Tech"
            value={pendingTriage}
            subtitle="Unassigned pool"
            icon={Clock}
            color="primary"
          />
          <StatCard
            title="Assigned to You"
            value={assignedToMe}
            subtitle="Your direct tickets"
            icon={Wrench}
            color="emerald"
          />
          <StatCard
            title="In Progress"
            value={inProgress}
            subtitle="Under active repair"
            icon={Clock}
            color="warning"
          />
          <StatCard
            title="Resolved"
            value={completed}
            subtitle="Back in service"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      </div>

      {/* Assigned Tickets Workbench */}
      <Card hover>
        <CardHeader
          title="My Assigned Repairs"
          subtitle="Equipment currently assigned to you for repair"
          action={
            <Link to="/maintenance" className="text-xs text-[#996E1D] dark:text-[#F1CB8D] hover:underline font-semibold transition-colors">
              All tickets →
            </Link>
          }
        />

        {(!data.assignedTickets || data.assignedTickets.length === 0) ? (
          <p className="text-xs text-zinc-400 py-6 text-center">
            No repair tickets assigned to you right now.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] dark:bg-black/40 border-b border-black/[0.06] dark:border-white/[0.08] text-zinc-500 dark:text-zinc-400 uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Reported Issue</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
                {data.assignedTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-900 dark:text-white">{t.asset?.name}</div>
                      <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        {t.asset?.assetTag}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
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
                            ? 'gold'
                            : t.status === 'IN_PROGRESS'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 text-[11px] tabular-nums">
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
