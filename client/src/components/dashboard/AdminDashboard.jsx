import React, { useState, useEffect } from 'react';
import {
  Server,
  Users,
  Building2,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import StatCard from './StatCard';
import Card, { CardHeader } from '../ui/Card';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import ErrorState from '../shared/ErrorState';
import { formatDateTime } from '../../utils/formatters';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const STATUS_COLORS = isDark
    ? {
        AVAILABLE: '#F1CB8D',
        ASSIGNED: '#F8FAFC',
        MAINTENANCE: '#A1A1AA',
        RETIRED: '#71717A',
        DISPOSED: '#52525B',
      }
    : {
        AVAILABLE: '#B88728',
        ASSIGNED: '#18181B',
        MAINTENANCE: '#71717A',
        RETIRED: '#A1A1AA',
        DISPOSED: '#D4D4D8',
      };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
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

  const pieData = Object.entries(data.assetsByStatus || {}).map(([key, value]) => ({
    name: key,
    value,
  })).filter((item) => item.value > 0);

  const deptData = (data.assetsByDepartment || []).map((d) => ({
    name: d.name && d.name.length > 16 ? d.name.slice(0, 14) + '…' : (d.name || 'Dept'),
    fullName: d.name,
    assets: d.count,
    staff: d.staffCount,
  }));

  const tooltipStyle = {
    backgroundColor: isDark ? 'rgba(18, 18, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDark ? 'rgba(241, 203, 141, 0.3)' : 'rgba(184, 135, 40, 0.3)',
    borderRadius: '12px',
    color: isDark ? '#F8FAFC' : '#09090B',
    fontSize: '12px',
    boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.6)' : '0 10px 25px rgba(0,0,0,0.1)',
  };

  const totalCount = data.totalAssets || 0;
  const assignedCount = data.assetsByStatus?.ASSIGNED || 0;
  const availableCount = data.assetsByStatus?.AVAILABLE || 0;
  const maintenanceCount = data.assetsByStatus?.MAINTENANCE || 0;
  const assignedPct = totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;
  const availablePct = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;
  const maintPct = totalCount > 0 ? Math.round((maintenanceCount / totalCount) * 100) : 0;
  const healthScore = totalCount > 0 ? Math.max(0, 100 - maintPct) : 100;

  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-[#996E1D] dark:text-[#F1CB8D] bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B88728] dark:bg-[#F1CB8D] animate-pulse" />
              All Systems Operational
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Overview of your organization's devices, assignments, and team activity.
          </p>
        </div>
      </div>

      {/* Top Asymmetrical Bento Hero Section: Fleet Vitality + Stacked Sparklines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Fleet Vitality Hero Card (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-[#0E0E12]/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-bento relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B88728]/10 dark:bg-[#F1CB8D]/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#996E1D] dark:text-[#F1CB8D] bg-[#B88728]/10 dark:bg-[#F1CB8D]/15 border border-[#B88728]/25 dark:border-[#F1CB8D]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B88728] dark:bg-[#F1CB8D] animate-ping" />
                  Fleet Operational Vitality
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Live Status
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Operational Readiness Score</span>
                <div className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight tabular-nums mt-1 flex items-baseline gap-2.5">
                  <span>{healthScore}%</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans tracking-normal bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Optimal Health
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-900 dark:text-white">{assignedCount}</span> active deployments / <span className="font-bold text-zinc-900 dark:text-white">{totalCount}</span> registered
              </div>
            </div>

            {/* Fleet Allocation Multi-Segment Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex border border-black/[0.04] dark:border-white/5">
                <div
                  style={{ width: `${assignedPct}%` }}
                  className="h-full bg-gradient-to-r from-[#B88728] to-[#996E1D] dark:from-[#F1CB8D] dark:to-[#C89C57] transition-all duration-500"
                  title={`Assigned: ${assignedPct}%`}
                />
                <div
                  style={{ width: `${availablePct}%` }}
                  className="h-full bg-emerald-500/90 transition-all duration-500"
                  title={`Available: ${availablePct}%`}
                />
                <div
                  style={{ width: `${maintPct}%` }}
                  className="h-full bg-amber-500/90 transition-all duration-500"
                  title={`Maintenance: ${maintPct}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B88728] dark:bg-[#F1CB8D]" />
                  <span>Assigned ({assignedPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Available ({availablePct}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Maintenance ({maintPct}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Micro-Metric Sparklines (5 Cols on desktop) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Fleet"
            value={data.totalAssets}
            subtitle="All registered hardware"
            icon={Server}
            color="primary"
          />
          <StatCard
            title="Available"
            value={data.assetsByStatus?.AVAILABLE || 0}
            subtitle="Ready to deploy"
            icon={ShieldCheck}
            color="emerald"
          />
          <StatCard
            title="Assigned"
            value={data.assetsByStatus?.ASSIGNED || 0}
            subtitle="Active custodians"
            icon={Activity}
            color="primary"
          />
          <StatCard
            title="Maintenance"
            value={data.assetsByStatus?.MAINTENANCE || 0}
            subtitle="In service queue"
            icon={AlertTriangle}
            color="warning"
          />
        </div>
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut */}
        <Card hover>
          <CardHeader
            title="Asset Status Breakdown"
            subtitle="Overview of devices by current status"
          />
          <div className="w-full h-64 min-h-[250px] flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-zinc-400">No asset status data recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || (isDark ? '#F1CB8D' : '#B88728')}
                        stroke={isDark ? '#09090B' : '#FAFAFA'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-3 border-t border-black/[0.06] dark:border-white/5">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{status}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Department Asset Allocation Bar Chart */}
        <Card hover>
          <CardHeader
            title="Assets by Department"
            subtitle="Number of devices assigned to each department"
          />
          <div className="w-full h-64 min-h-[250px] flex items-center justify-center">
            {deptData.length === 0 ? (
              <p className="text-xs text-zinc-400">No department hardware assigned yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptData}>
                  <XAxis
                    dataKey="name"
                    stroke={isDark ? '#71717A' : '#A1A1AA'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke={isDark ? '#71717A' : '#A1A1AA'} fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'assets' ? 'Assigned Assets' : 'Staff']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="assets" fill={isDark ? '#F1CB8D' : '#B88728'} radius={[6, 6, 0, 0]} name="assets" />
                  <Bar dataKey="staff" fill={isDark ? '#71717A' : '#D4D4D8'} radius={[6, 6, 0, 0]} name="staff" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-black/[0.06] dark:border-white/5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#B88728] dark:bg-[#F1CB8D]" />
              <span>Assigned Assets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400 dark:bg-zinc-600" />
              <span>Department Staff</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Activity Stream */}
      <Card hover>
        <CardHeader
          title="Recent Activity"
          subtitle="Latest updates and changes across your organization"
        />
        {(!data.recentActivity || data.recentActivity.length === 0) ? (
          <p className="text-xs text-zinc-400 py-4 text-center">
            No recent activity yet. Updates will appear here.
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

export default AdminDashboard;
