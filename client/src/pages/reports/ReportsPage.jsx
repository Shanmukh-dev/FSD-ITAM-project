import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Coins,
  Wrench,
  Clock,
  Building2,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../services/api';
import Card, { CardHeader } from '../../components/ui/Card';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_COLORS = {
  AVAILABLE: '#10B981',
  ASSIGNED: '#6366F1',
  MAINTENANCE: '#F59E0B',
  RETIRED: '#64748B',
  DISPOSED: '#475569',
};

export const ReportsPage = () => {
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const [activeTab, setActiveTab] = useState('status');

  const [statusReport, setStatusReport] = useState(null);
  const [deptReport, setDeptReport] = useState(null);
  const [valueReport, setValueReport] = useState(null);
  const [maintReport, setMaintReport] = useState(null);
  const [lifecycleReport, setLifecycleReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, deptRes, valueRes, maintRes, lifeRes] = await Promise.all([
        api.get('/reports/asset-status'),
        api.get('/reports/department'),
        api.get('/reports/asset-value'),
        api.get('/reports/maintenance'),
        api.get('/reports/lifecycle'),
      ]);

      if (statusRes.data.success) setStatusReport(statusRes.data.report);
      if (deptRes.data.success) setDeptReport(deptRes.data.report);
      if (valueRes.data.success) setValueReport(valueRes.data.report);
      if (maintRes.data.success) setMaintReport(maintRes.data.report);
      if (lifeRes.data.success) setLifecycleReport(lifeRes.data.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to aggregate report metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;

  const statusPieData = Object.entries(statusReport?.statusBreakdown || {}).map(
    ([name, value]) => ({ name, value })
  ).filter((i) => i.value > 0);

  const deptBarData = (deptReport?.departments || []).map((d) => ({
    name: d.departmentName && d.departmentName.length > 16 ? d.departmentName.slice(0, 14) + '…' : (d.departmentName || 'Dept'),
    fullName: d.departmentName,
    count: d.assetCount,
    value: d.totalInvestment,
  }));

  const chartTooltipStyle = {
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderRadius: '8px',
    color: isDark ? '#F8FAFC' : '#0F172A',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-chalk tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">
          Overview of asset inventory, department allocation, depreciation, and repair costs.
        </p>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none pb-0.5">
          {[
            { id: 'status', label: '1. Asset Status', icon: PieIcon },
            { id: 'department', label: '2. Department Allocation', icon: Building2 },
            { id: 'financial', label: '3. Valuation & Depreciation', icon: Coins },
            { id: 'maintenance', label: '4. Maintenance & Repairs', icon: Wrench },
            { id: 'lifecycle', label: '5. Retired & Disposed', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/30 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* TAB 1: Asset Status Report */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title="Asset Status"
              subtitle="Breakdown of assets by their current status"
            />
            <div className="w-full h-64 min-h-[250px] flex items-center justify-center">
              {statusPieData.length === 0 ? (
                <p className="text-xs text-slate-400">No asset status data recorded yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.name] || '#6366F1'}
                          stroke={isDark ? '#111827' : '#FFFFFF'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-3 border-t border-slate-100 dark:border-white/5">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Category Breakdown"
              subtitle="Number of assets in each category"
            />
            <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {(statusReport?.categoryBreakdown || []).map((cat) => (
                <div key={cat.category} className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-900 dark:text-chalk font-medium">{cat.category}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold tabular-nums">{cat.count} units</span>
                </div>
              ))}
              <div className="py-3 flex justify-between font-bold text-slate-900 dark:text-chalk border-t border-slate-200 dark:border-white/10">
                <span>Total Assets:</span>
                <span className="tabular-nums">{statusReport?.totalAssets || 0} units</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Department Allocation Report */}
      {activeTab === 'department' && (
        <Card>
          <CardHeader
            title="Assets by Department"
            subtitle="Number of devices allocated to each department"
          />
          <div className="w-full h-72 min-h-[270px]">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={deptBarData}>
                <XAxis dataKey="name" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <Tooltip
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={chartTooltipStyle}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} name="Assets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* TAB 3: Valuation & Depreciation Report */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs dark:shadow-elevated">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Purchase Cost</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-chalk mt-1 tabular-nums">
                {formatCurrency(valueReport?.totalPurchaseValue)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total spent on devices</p>
            </div>

            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs dark:shadow-elevated">
              <span className="text-xs text-amber-600 dark:text-amber font-medium flex items-center gap-1">
                <TrendingDown size={14} /> Total Depreciation
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber mt-1 tabular-nums">
                -{formatCurrency(valueReport?.totalDepreciation)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Estimated loss in value</p>
            </div>

            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs dark:shadow-elevated">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Current Fleet Value</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-chalk mt-1 tabular-nums">
                {formatCurrency(valueReport?.totalCurrentBookValue)}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Estimated current worth</p>
            </div>
          </div>

          <Card>
            <CardHeader
              title="Value by Category"
              subtitle="Cost and current value broken down by category"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0B0F19]/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wide">
                  <tr>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Units</th>
                    <th className="py-2.5 px-4">Purchase Cost</th>
                    <th className="py-2.5 px-4">Current Value</th>
                    <th className="py-2.5 px-4">Depreciation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {(valueReport?.categoryValuations || []).map((c) => {
                    const ratio =
                      c.purchaseValue > 0
                        ? Math.round(((c.purchaseValue - c.currentValue) / c.purchaseValue) * 100)
                        : 0;
                    return (
                      <tr key={c.category} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-chalk">{c.category}</td>
                        <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 tabular-nums">{c.count}</td>
                        <td className="py-3 px-4 tabular-nums text-slate-600 dark:text-slate-300">{formatCurrency(c.purchaseValue)}</td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald font-semibold tabular-nums">
                          {formatCurrency(c.currentValue)}
                        </td>
                        <td className="py-3 px-4 tabular-nums">
                          <span className="text-amber-600 dark:text-amber font-medium">{ratio}%</span> depreciated
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: Maintenance & Service Costs Report */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs dark:shadow-elevated">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Repair Requests</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-chalk mt-1 tabular-nums">
                {maintReport?.totalTickets || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs dark:shadow-elevated">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed Repairs</span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald mt-1 tabular-nums">
                {maintReport?.totalCompletedRepairs || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-surface border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-5 shadow-xs dark:shadow-elevated">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Repair Costs</span>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber mt-1 tabular-nums">
                {formatCurrency(maintReport?.totalRepairCosts)}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader
              title="Most Repaired Devices"
              subtitle="Devices with the most repair requests and total costs"
            />
            {(!maintReport?.frequentRepairs || maintReport.frequentRepairs.length === 0) ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                No repeated maintenance tickets on record yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0B0F19]/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wide">
                    <tr>
                      <th className="py-2.5 px-4">Asset Tag</th>
                      <th className="py-2.5 px-4">Device</th>
                      <th className="py-2.5 px-4">Total Repairs</th>
                      <th className="py-2.5 px-4">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {maintReport.frequentRepairs.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-chalk">{r.asset?.assetTag}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{r.asset?.name}</td>
                        <td className="py-3 px-4 text-amber-600 dark:text-amber font-semibold tabular-nums">{r.repairCount} times</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-chalk tabular-nums">{formatCurrency(r.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 5: Lifecycle Transitions Report */}
      {activeTab === 'lifecycle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title={`Retired Assets (${lifecycleReport?.retiredCount || 0})`}
              subtitle="Devices retired from active use"
            />
            {(!lifecycleReport?.retiredAssets || lifecycleReport.retiredAssets.length === 0) ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                No assets currently in retired status.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {lifecycleReport.retiredAssets.map((a) => (
                  <div key={a._id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-chalk">{a.name}{' '}
                        <span className="font-mono text-slate-500 dark:text-slate-400 font-normal">({a.assetTag})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Purchased {formatDate(a.purchaseDate)}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium">
                      RETIRED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title={`Disposed Assets (${lifecycleReport?.disposedCount || 0})`}
              subtitle="Devices that have been recycled or disposed of"
            />
            {(!lifecycleReport?.disposedAssets || lifecycleReport.disposedAssets.length === 0) ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                No assets in disposed status.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {lifecycleReport.disposedAssets.map((a) => (
                  <div key={a._id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-chalk">{a.name}{' '}
                        <span className="font-mono text-slate-500 dark:text-slate-400 font-normal">({a.assetTag})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        SN: #{a.serialNumber}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 dark:bg-destructive/15 dark:text-rose-300 font-medium">
                      DISPOSED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
