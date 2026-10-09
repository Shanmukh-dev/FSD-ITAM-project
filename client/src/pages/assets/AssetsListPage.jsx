import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Laptop,
  X,
  Eye,
  Tag,
  Building,
  User,
  ShieldCheck,
  Calendar,
  DollarSign,
  Monitor,
  KeyRound,
  Layers,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import AssetStatusBadge from '../../components/assets/AssetStatusBadge';
import {
  ROLES,
  ASSET_TYPES,
  HARDWARE_CATEGORIES,
  DIGITAL_CATEGORIES,
  ASSET_CATEGORIES,
  ASSET_STATUS,
} from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Available', value: ASSET_STATUS.AVAILABLE, color: 'emerald' },
  { label: 'Assigned', value: ASSET_STATUS.ASSIGNED, color: 'primary' },
  { label: 'Maintenance', value: ASSET_STATUS.MAINTENANCE, color: 'warning' },
  { label: 'Retired', value: ASSET_STATUS.RETIRED, color: 'muted' },
];

export const AssetsListPage = () => {
  const { hasRole } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');
  const [warranty, setWarranty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selected asset for quick slide-over inspection (less clicky)
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Fetch departments for filter dropdown
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {}
    };
    fetchDepts();
  }, []);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
      });

      if (search) params.append('search', search);
      if (assetType) params.append('assetType', assetType);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (department) params.append('department', department);
      if (warranty) params.append('warranty', warranty);

      const res = await api.get(`/assets?${params.toString()}`);
      if (res.data.success) {
        setAssets(res.data.assets);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  }, [page, search, assetType, category, status, department, warranty]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const canCreate = hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER);
  const hasActiveFilters = Boolean(search || assetType || category || status || department || warranty);

  const resetFilters = () => {
    setSearch('');
    setAssetType('');
    setCategory('');
    setStatus('');
    setDepartment('');
    setWarranty('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {hasRole(ROLES.EMPLOYEE) ? 'My Equipment' : 'Assets'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hasRole(ROLES.EMPLOYEE)
              ? 'View your devices, specifications, and details.'
              : `${total} registered assets across your organization.`}
          </p>
        </div>

        {canCreate && (
          <Link to="/assets/new">
            <Button variant="primary" size="md">
              <Plus size={16} />
              <span>Add Asset</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Asset Classification Tabs (All, Hardware, Digital) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => {
            setAssetType('');
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            assetType === ''
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers size={14} />
          <span>All Assets</span>
        </button>

        <button
          onClick={() => {
            setAssetType(ASSET_TYPES.PHYSICAL);
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            assetType === ASSET_TYPES.PHYSICAL
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Monitor size={14} />
          <span>Physical Hardware</span>
        </button>

        <button
          onClick={() => {
            setAssetType(ASSET_TYPES.DIGITAL);
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            assetType === ASSET_TYPES.DIGITAL
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound size={14} />
          <span>Digital & Software</span>
        </button>
      </div>

      {/* 1-Click Quick Status Filters (Less-Clicky) */}
      {!hasRole(ROLES.EMPLOYEE) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const isActive = status === f.value;
            return (
              <button
                key={f.label}
                onClick={() => {
                  setStatus(f.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:border-white/10 dark:text-slate-300'
                }`}
              >
                {f.color && f.color !== 'muted' && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-white' : f.color === 'emerald' ? 'bg-emerald-500' : f.color === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                  />
                )}
                <span>{f.label}</span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 ml-auto px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X size={13} />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by tag, name, serial number, license key..."
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-[#070A12]/90 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-600 dark:focus:border-primary transition-colors cursor-pointer"
            >
              <option value="">All Categories</option>
              <optgroup label="Physical Hardware">
                {HARDWARE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Digital Resources & Software">
                {DIGITAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {!hasRole(ROLES.EMPLOYEE) && (
            <div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white dark:bg-[#070A12]/90 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-600 dark:focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                {Object.values(ASSET_STATUS).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!hasRole(ROLES.EMPLOYEE) && (
            <div>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white dark:bg-[#070A12]/90 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-600 dark:focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSkeleton type="table" rows={10} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAssets} />
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Laptop}
          title="No assets found"
          description={
            hasActiveFilters
              ? 'No assets match your search filters. Try clearing some filters or searching for something else.'
              : 'There are currently no assets registered in the system.'
          }
          action={
            canCreate && !hasActiveFilters
              ? {
                  label: 'Add First Asset',
                  onClick: () => (window.location.href = '/assets/new'),
                }
              : null
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F19]/80 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wide">
                <tr>
                  <th className="py-3 px-4">Tag</th>
                  <th className="py-3 px-4">Device Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Current Value</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {assets.map((asset) => (
                  <tr
                    key={asset._id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${
                      selectedAsset?._id === asset._id ? 'bg-indigo-50/70 dark:bg-indigo-500/[0.08]' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {asset.assetTag}
                        </span>
                        {asset.assetType === ASSET_TYPES.DIGITAL ? (
                          <span className="p-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" title="Digital Asset">
                            <KeyRound size={12} />
                          </span>
                        ) : (
                          <span className="p-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" title="Physical Hardware">
                            <Monitor size={12} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {asset.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                        {asset.assetType === ASSET_TYPES.DIGITAL ? (
                          <>
                            <span>{asset.brand || 'Publisher'}</span>
                            <span>•</span>
                            <span className="font-mono text-purple-600 dark:text-purple-400">
                              {asset.digitalDetails?.licenseType || 'LICENSE'}
                            </span>
                            {asset.digitalDetails?.seatsTotal && (
                              <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium">
                                {asset.digitalDetails.seatsAllocated || 0}/{asset.digitalDetails.seatsTotal} Seats
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span>{asset.brand} {asset.model}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-400 dark:text-slate-500">#{asset.serialNumber}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {asset.category?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <AssetStatusBadge status={asset.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      {asset.assetType === ASSET_TYPES.DIGITAL && (asset.digitalDetails?.seatsTotal > 1) ? (
                        <div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {asset.digitalDetails.seatsAllocated || 0} Staff Allocated
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {asset.department?.name || 'Company-wide'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {asset.assignedTo ? asset.assignedTo.name : '—'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {asset.department?.name || 'Unassigned Dept'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-slate-900 dark:text-white font-medium">
                      <div>
                        {formatCurrency(asset.depreciationAnalysis?.currentBookValue)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        Orig: {formatCurrency(asset.purchasePrice)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedAsset(asset)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                          title="Quick Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <Link to={`/assets/${asset._id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <span>Details</span>
                            <ExternalLink size={12} />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#070A12]/40 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Page <span className="text-slate-900 dark:text-white font-semibold">{page}</span> of {totalPages} ({total} total assets)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Slide-Over Quick Inspection Drawer (Instant View without leaving page) */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-[#070A12]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedAsset(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/[0.08] flex items-start justify-between bg-slate-50/70 dark:bg-[#0B0F19]/60">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25">
                    {selectedAsset.assetTag}
                  </span>
                  <AssetStatusBadge status={selectedAsset.status} size="sm" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {selectedAsset.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedAsset.brand} {selectedAsset.model}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Specs Matrix */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {selectedAsset.assetType === ASSET_TYPES.DIGITAL ? 'Software & License Specs' : 'Device Details'}
                </span>
                <div className="bg-slate-50 dark:bg-[#070A12]/70 rounded-xl p-3.5 border border-slate-200/80 dark:border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Category:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{selectedAsset.category?.replace(/_/g, ' ')}</span>
                  </div>
                  {selectedAsset.assetType === ASSET_TYPES.DIGITAL ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">License Model:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{selectedAsset.digitalDetails?.licenseType || 'SUBSCRIPTION'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Seat Capacity:</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {selectedAsset.digitalDetails?.seatsAllocated || 0} / {selectedAsset.digitalDetails?.seatsTotal || 1} Allocated
                        </span>
                      </div>
                      {selectedAsset.digitalDetails?.validUntil && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Expires / Renews:</span>
                          <span className="text-slate-900 dark:text-white font-medium">{formatDate(selectedAsset.digitalDetails.validUntil)}</span>
                        </div>
                      )}
                      {selectedAsset.digitalDetails?.contractNumber && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Contract #:</span>
                          <span className="font-mono text-slate-900 dark:text-white">{selectedAsset.digitalDetails.contractNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Environment:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{selectedAsset.location || 'Cloud / SaaS'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Serial Number:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">#{selectedAsset.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Condition:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{selectedAsset.condition || 'Good'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Location:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{selectedAsset.location || 'Depot Storage'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Custody Information */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {selectedAsset.assetType === ASSET_TYPES.DIGITAL ? 'Allocation & Custody' : 'Current Assignment'}
                </span>
                <div className="bg-slate-50 dark:bg-[#070A12]/70 rounded-xl p-3.5 border border-slate-200/80 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">
                      {selectedAsset.assetType === ASSET_TYPES.DIGITAL && (selectedAsset.digitalDetails?.seatsTotal > 1) ? 'Assigned Staff:' : 'Assigned To:'}
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {selectedAsset.assetType === ASSET_TYPES.DIGITAL && (selectedAsset.digitalDetails?.seatsTotal > 1)
                        ? `${selectedAsset.digitalDetails?.seatsAllocated || 0} Staff Allocated`
                        : selectedAsset.assignedTo ? selectedAsset.assignedTo.name : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Department:</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {selectedAsset.department?.name || 'Company-wide'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Valuation & Depreciation */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Value & Depreciation
                </span>
                <div className="bg-slate-50 dark:bg-[#070A12]/70 rounded-xl p-3.5 border border-slate-200/80 dark:border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Current Value:</span>
                    <span className="text-slate-900 dark:text-white font-bold tabular-nums">
                      {formatCurrency(selectedAsset.depreciationAnalysis?.currentBookValue || selectedAsset.purchasePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Purchase Price:</span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatCurrency(selectedAsset.purchasePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Purchase Date:</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatDate(selectedAsset.purchaseDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#0B0F19]/60 flex gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedAsset(null)}
              >
                Close
              </Button>
              <Link to={`/assets/${selectedAsset._id}`} className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  <span>View Details</span>
                  <ExternalLink size={13} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsListPage;
