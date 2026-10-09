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

const STATUS_COLORS = {
  AVAILABLE: '#10B981',
  ASSIGNED: '#6366F1',
  MAINTENANCE: '#F59E0B',
  RETIRED: '#64748B',
  DISPOSED: '#EF4444',
};

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

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
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
    borderRadius: '8px',
    color: isDark ? '#F8FAFC' : '#0F172A',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-emerald-700 dark:text-emerald bg-emerald-50 dark:bg-emerald/10 border border-emerald-200 dark:border-emerald/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of your organization's devices, assignments, and team activity.
          </p>
        </div>
      </div>

      {/* Top Stat Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={data.totalAssets}
          subtitle="All registered devices"
          icon={Server}
          color="primary"
        />
        <StatCard
          title="Assigned"
          value={data.assetsByStatus?.ASSIGNED || 0}
          subtitle={`${data.totalAssets > 0 ? Math.round(((data.assetsByStatus?.ASSIGNED || 0) / data.totalAssets) * 100) : 0}% currently assigned`}
          icon={Activity}
          color="emerald"
        />
        <StatCard
          title="Available"
          value={data.assetsByStatus?.AVAILABLE || 0}
          subtitle="Ready to assign"
          icon={ShieldCheck}
          color="primary"
        />
        <StatCard
          title="In Maintenance"
          value={data.assetsByStatus?.MAINTENANCE || 0}
          subtitle="Under repair or diagnostic"
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut */}
        <Card>
          <CardHeader
            title="Asset Status Breakdown"
            subtitle="Overview of devices by current status"
          />
          <div className="w-full h-64 min-h-[250px] flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No asset status data recorded yet.</p>
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
                        fill={STATUS_COLORS[entry.name] || '#6366F1'}
                        stroke={isDark ? '#111827' : '#FFFFFF'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-3 border-t border-slate-100 dark:border-white/5">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{status}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Department Asset Allocation Bar Chart */}
        <Card>
          <CardHeader
            title="Assets by Department"
            subtitle="Number of devices assigned to each department"
          />
          <div className="w-full h-64 min-h-[250px] flex items-center justify-center">
            {deptData.length === 0 ? (
              <p className="text-xs text-slate-400">No department hardware assigned yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptData}>
                  <XAxis
                    dataKey="name"
                    stroke={isDark ? '#64748B' : '#94A3B8'}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'assets' ? 'Assigned Assets' : 'Staff']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="assets" fill="#6366F1" radius={[4, 4, 0, 0]} name="assets" />
                  <Bar dataKey="staff" fill="#10B981" radius={[4, 4, 0, 0]} name="staff" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600" />
              <span>Assigned Assets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>Department Staff</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Activity Stream */}
      <Card>
        <CardHeader
          title="Recent Activity"
          subtitle="Latest updates and changes across your organization"
        />
        {(!data.recentActivity || data.recentActivity.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No recent activity yet. Updates will appear here.
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

export default AdminDashboard;
