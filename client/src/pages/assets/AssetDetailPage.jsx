import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Server,
  UserCheck,
  RotateCcw,
  Repeat,
  Wrench,
  Coins,
  History,
  Archive,
  Trash2,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Monitor,
  KeyRound,
  Copy,
  Check,
  Users,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input, { Select, Textarea } from '../../components/ui/Input';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import AssetStatusBadge from '../../components/assets/AssetStatusBadge';
import AssetTimeline from '../../components/assets/AssetTimeline';
import DepreciationDisplay from '../../components/assets/DepreciationDisplay';
import {
  ROLES,
  ASSET_STATUS,
  ASSET_TYPES,
  ASSET_CONDITIONS,
  VALID_ASSET_TRANSITIONS,
} from '../../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [allocateSeatModalOpen, setAllocateSeatModalOpen] = useState(false);
  const [seatUserId, setSeatUserId] = useState('');
  const [seatNotes, setSeatNotes] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Form states for modals
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [issueType, setIssueType] = useState('HARDWARE');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueUrgency, setIssueUrgency] = useState('MEDIUM');

  const [modalLoading, setModalLoading] = useState(false);

  const fetchAssetDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assetRes, historyRes] = await Promise.all([
        api.get(`/assets/${id}`),
        api.get(`/assets/${id}/history`),
      ]);

      if (assetRes.data.success) {
        setAsset(assetRes.data.asset);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.history);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load asset details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  // Load employees for assignment & transfer
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users?limit=100');
        if (res.data.success) {
          setAllEmployees(res.data.users);
        }
      } catch (err) {}
    };
    if (hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER)) {
      fetchUsers();
    }
  }, [hasRole]);

  // Actions handlers
  const handleAssign = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await api.post(`/assets/${id}/assign`, {
        employeeId: selectedEmployee,
        expectedReturnDate: expectedReturnDate || null,
        notes: assignNotes,
      });
      if (res.data.success) {
        setAssignModalOpen(false);
        fetchAssetDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign asset.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await api.post(`/assets/${id}/return`, {
        condition: returnCondition,
        notes: returnNotes,
      });
      if (res.data.success) {
        setReturnModalOpen(false);
        fetchAssetDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return asset.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await api.post(`/assets/${id}/transfer`, {
        newEmployeeId: selectedEmployee,
        reason: transferReason,
        expectedReturnDate: expectedReturnDate || null,
      });
      if (res.data.success) {
        setTransferModalOpen(false);
        fetchAssetDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to transfer asset.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await api.patch(`/assets/${id}/status`, {
        status: newStatus,
        reason: statusReason,
      });
      if (res.data.success) {
        setStatusModalOpen(false);
        fetchAssetDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update asset status.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleReportProblem = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await api.post('/maintenance', {
        assetId: id,
        issueType,
        description: issueDesc,
        priority: issueUrgency,
      });
      if (res.data.success) {
        setReportModalOpen(false);
        setIssueDesc('');
        fetchAssetDetails();
        alert('Repair request submitted successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit repair request.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAllocateSeat = async (e) => {
    e.preventDefault();
    if (!seatUserId) return;
    setModalLoading(true);
    try {
      const res = await api.post(`/assets/${id}/allocate-seat`, {
        userId: seatUserId,
        notes: seatNotes,
      });
      if (res.data.success) {
        setAllocateSeatModalOpen(false);
        setSeatUserId('');
        setSeatNotes('');
        fetchAssetDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to allocate license seat.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRevokeSeat = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to revoke the license seat allocated to ${userName}?`)) {
      return;
    }
    setModalLoading(true);
    try {
      const res = await api.post(`/assets/${id}/revoke-seat`, { userId });
      if (res.data.success) {
        fetchAssetDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke license seat.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (asset?.digitalDetails?.licenseKey) {
      navigator.clipboard.writeText(asset.digitalDetails.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState message={error} onRetry={fetchAssetDetails} />;
  if (!asset) return null;

  const isDigital = asset.assetType === ASSET_TYPES.DIGITAL;
  const isManagerOrAdmin = hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER);
  const isTechnician = hasRole(ROLES.TECHNICIAN);
  const isOwner = asset.assignedTo?._id?.toString() === user?.id;

  const allowedNextStatuses = VALID_ASSET_TRANSITIONS[asset.status] || [];

  const tabList = isDigital
    ? [
        { id: 'overview', label: 'License & Specifications' },
        { id: 'seats', label: `Seat Allocations (${asset.digitalDetails?.seatsAllocated || 0}/${asset.digitalDetails?.seatsTotal || 1})` },
        { id: 'financial', label: 'Commercials & Value' },
        { id: 'history', label: 'Activity Audit Log' },
      ]
    : [
        { id: 'overview', label: 'Specifications' },
        { id: 'financial', label: 'Value & Depreciation' },
        { id: 'assignment', label: 'Assignment' },
        { id: 'maintenance', label: 'Maintenance History' },
        { id: 'history', label: 'Activity History' },
      ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link
              to="/assets"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 mt-0.5 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30 font-bold flex items-center gap-1.5">
                  {isDigital ? <KeyRound size={12} /> : <Tag size={12} />}
                  {asset.assetTag}
                </span>
                <AssetStatusBadge status={asset.status} />
                <Badge variant={isDigital ? 'primary' : 'muted'} size="sm">
                  {asset.category?.replace(/_/g, ' ')}
                </Badge>
                {isDigital && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                    DIGITAL ASSET
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {asset.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {isDigital ? (
                  <span>
                    {asset.brand || 'Publisher'} • {asset.digitalDetails?.licenseType || 'Software'} •{' '}
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      {asset.digitalDetails?.seatsAllocated || 0}/{asset.digitalDetails?.seatsTotal || 1} Seats In Use
                    </span>
                  </span>
                ) : (
                  <span>
                    {asset.brand} {asset.model} • Serial #{asset.serialNumber}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Contextual Action Bar based on Role & State */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Digital Asset: Allocate Seat */}
            {isDigital && isManagerOrAdmin && (asset.digitalDetails?.seatsAllocated || 0) < (asset.digitalDetails?.seatsTotal || 1) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSeatUserId('');
                  setSeatNotes('');
                  setAllocateSeatModalOpen(true);
                }}
              >
                <UserPlus size={14} />
                <span>Allocate Seat</span>
              </Button>
            )}

            {/* Employee / Physical Asset: Report Issue */}
            {!isDigital && (isOwner || isManagerOrAdmin) && asset.status !== ASSET_STATUS.MAINTENANCE && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setReportModalOpen(true)}
              >
                <AlertTriangle size={14} />
                <span>Report an Issue</span>
              </Button>
            )}

            {/* Asset Manager: Allocate Physical Asset (if AVAILABLE) */}
            {!isDigital && isManagerOrAdmin && asset.status === ASSET_STATUS.AVAILABLE && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedEmployee(allEmployees[0]?._id || '');
                  setAssignModalOpen(true);
                }}
              >
                <UserCheck size={14} />
                <span>Assign Asset</span>
              </Button>
            )}

            {/* Asset Manager: Return / Transfer (if ASSIGNED) */}
            {!isDigital && isManagerOrAdmin && asset.status === ASSET_STATUS.ASSIGNED && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setReturnModalOpen(true)}
                >
                  <RotateCcw size={14} />
                  <span>Return Asset</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee(allEmployees[0]?._id || '');
                    setTransferModalOpen(true);
                  }}
                >
                  <Repeat size={14} />
                  <span>Transfer Asset</span>
                </Button>
              </>
            )}

            {/* Asset Manager / Admin: Status Transitions (Retire / Dispose) */}
            {isManagerOrAdmin && allowedNextStatuses.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNewStatus(allowedNextStatuses[0]);
                  setStatusModalOpen(true);
                }}
              >
                <Archive size={14} />
                <span>Change Status</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08] overflow-x-auto text-xs scrollbar-none">
          {tabList.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-xs ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold shadow-xs dark:bg-indigo-500/15 dark:text-white dark:border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab 1: Overview & Specs */}
      {activeTab === 'overview' && (
        isDigital ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Software & License Information" subtitle="Licensing credentials and seat capacity" />
              <dl className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Digital Tag:</dt>
                  <dd className="font-bold text-slate-900 dark:text-white font-mono">{asset.assetTag}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Software Category:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{asset.category?.replace(/_/g, ' ')}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Publisher / Vendor:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{asset.brand || asset.vendor || 'Digital Provider'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">License Model:</dt>
                  <dd className="text-indigo-600 dark:text-indigo-400 font-semibold">{asset.digitalDetails?.licenseType || 'SUBSCRIPTION'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Total Seat Capacity:</dt>
                  <dd className="text-slate-900 dark:text-white font-bold">{asset.digitalDetails?.seatsTotal || 1} Seats</dd>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Seats Allocated:</dt>
                  <dd className="text-emerald-600 dark:text-emerald font-semibold">
                    {asset.digitalDetails?.seatsAllocated || 0} / {asset.digitalDetails?.seatsTotal || 1} Used
                  </dd>
                </div>
                <div className="py-2.5 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <dt className="text-slate-500 dark:text-slate-400 font-medium">License / Product Key:</dt>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {showKey ? 'Hide' : 'Reveal'}
                      </button>
                      {asset.digitalDetails?.licenseKey && (
                        <button
                          type="button"
                          onClick={handleCopyKey}
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                        >
                          {copiedKey ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <dd className="font-mono text-[11px] p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 break-all select-all">
                    {showKey
                      ? (asset.digitalDetails?.licenseKey || 'No activation key specified')
                      : (asset.digitalDetails?.licenseKey ? '••••••••••••••••••••••••••••••••' : 'No activation key specified')}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card>
              <CardHeader title="Subscription & Hosting Terms" subtitle="Contract validity, renewals, and billing" />
              <dl className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Department:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {asset.department?.name || 'Unassigned / Company-wide'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Hosting / Cloud URL:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{asset.location || 'Cloud / SaaS'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Contract / Agreement #:</dt>
                  <dd className="font-mono text-slate-900 dark:text-white font-semibold">
                    {asset.digitalDetails?.contractNumber || 'Standard SLA'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Billing Cycle:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {asset.digitalDetails?.billingCycle || 'ANNUAL'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Effective / Start Date:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {formatDate(asset.digitalDetails?.validFrom || asset.purchaseDate)}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Expiration / Renewal:</dt>
                  <dd className="text-slate-900 dark:text-white font-semibold">
                    {formatDate(asset.digitalDetails?.validUntil) || 'Perpetual (No Expiry)'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Auto-Renew Status:</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {asset.digitalDetails?.autoRenew ? 'Enabled (Automatic)' : 'Manual Review'}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Device Details" />
              <dl className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Asset Tag:</dt>
                  <dd className="font-bold text-slate-900 dark:text-white font-mono">{asset.assetTag}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Category:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{asset.category?.replace(/_/g, ' ')}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Brand:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{asset.brand}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Model:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{asset.model}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Serial Number:</dt>
                  <dd className="text-slate-900 dark:text-white font-bold font-mono">#{asset.serialNumber}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Condition:</dt>
                  <dd className="text-emerald-600 dark:text-emerald font-semibold">{asset.condition}</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <CardHeader title="Location & Warranty" />
              <dl className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Department:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {asset.department?.name || 'Unassigned / Depot'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Location:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{asset.location || 'Depot Storage'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Vendor:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{asset.vendor || 'Direct Purchase'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Warranty Expiration:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{formatDate(asset.warrantyExpiry)}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Purchase Date:</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{formatDate(asset.purchaseDate)}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400 font-medium">Assigned To:</dt>
                  <dd className="text-indigo-600 dark:text-primary font-semibold">
                    {asset.assignedTo ? asset.assignedTo.name : 'Unassigned'}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        )
      )}

      {/* Tab Seats: Digital Multi-seat Allocations Deck */}
      {activeTab === 'seats' && isDigital && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">License Seat Utilization</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track multi-seat allocation across organizational team members.
                </p>
              </div>

              {isManagerOrAdmin && (asset.digitalDetails?.seatsAllocated || 0) < (asset.digitalDetails?.seatsTotal || 1) && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSeatUserId('');
                    setSeatNotes('');
                    setAllocateSeatModalOpen(true);
                  }}
                >
                  <UserPlus size={14} />
                  <span>Allocate Seat</span>
                </Button>
              )}
            </div>

            {/* Utilization Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-300">
                  {asset.digitalDetails?.seatsAllocated || 0} of {asset.digitalDetails?.seatsTotal || 1} Seats Assigned
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {Math.round(((asset.digitalDetails?.seatsAllocated || 0) / (asset.digitalDetails?.seatsTotal || 1)) * 100)}% Capacity
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-primary transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round(((asset.digitalDetails?.seatsAllocated || 0) / (asset.digitalDetails?.seatsTotal || 1)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Available Seats: {Math.max(0, (asset.digitalDetails?.seatsTotal || 1) - (asset.digitalDetails?.seatsAllocated || 0))}</span>
                <span>Billing: {asset.digitalDetails?.billingCycle || 'Annual'}</span>
              </div>
            </div>
          </Card>

          {/* Table of Allocated Users */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Seat Holders ({asset.digitalDetails?.allocatedUsers?.length || 0})
              </h3>
            </div>
            {(!asset.digitalDetails?.allocatedUsers || asset.digitalDetails.allocatedUsers.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No employees have been allocated a seat for this license yet. Click "Allocate Seat" to grant access.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#0B0F19]/80 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wide">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Allocated Date</th>
                      <th className="py-3 px-4">Notes</th>
                      {isManagerOrAdmin && <th className="py-3 px-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {asset.digitalDetails.allocatedUsers.map((alloc) => {
                      const u = alloc.user || {};
                      return (
                        <tr key={u._id || alloc._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">{u.name || 'Team Member'}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {u.department?.name || 'General Staff'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {formatDate(alloc.allocatedAt)}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {alloc.notes || '—'}
                          </td>
                          {isManagerOrAdmin && (
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-7 px-2"
                                onClick={() => handleRevokeSeat(u._id, u.name)}
                              >
                                <UserMinus size={13} />
                                <span>Revoke Seat</span>
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Financial Valuation & Depreciation */}
      {activeTab === 'financial' && (
        <DepreciationDisplay analysis={asset.depreciationAnalysis} />
      )}

      {/* Tab 3: Custody & Active Assignment */}
      {activeTab === 'assignment' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Current Assignment"
              subtitle="The team member currently using this device"
            />
            {!asset.activeAssignment ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                This asset is currently in storage and not assigned to anyone.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-[#070A12]/70 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wide">Assigned To</span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {asset.activeAssignment.employee?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {asset.activeAssignment.employee?.email}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#070A12]/70 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wide">Assigned Date</span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {formatDate(asset.activeAssignment.assignedAt)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Assigned by {asset.activeAssignment.assignedBy?.name}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#070A12]/70 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wide">Expected Return</span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {formatDate(asset.activeAssignment.expectedReturnDate)}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald font-semibold">Currently Assigned</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 4: Maintenance Tickets */}
      {activeTab === 'maintenance' && (
        <Card>
          <CardHeader
            title="Maintenance & Repairs"
            subtitle="Past and ongoing repair requests for this device"
          />
          {(!asset.recentMaintenance || asset.recentMaintenance.length === 0) ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No maintenance or repair issues recorded for this device.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {asset.recentMaintenance.map((m) => (
                <div
                  key={m._id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {m.issueType} Repair
                      </span>
                      <Badge variant="warning" size="sm">
                        {m.status}
                      </Badge>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        "{m.description}"
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Reported by {m.reportedBy?.name} • Technician:{' '}
                      {m.assignedTechnician?.name || 'Unassigned'}
                    </div>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    {formatDateTime(m.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Lifecycle Audit Trail */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader
            title="Asset History"
            subtitle="Complete timeline of events and updates for this device"
          />
          <AssetTimeline history={history} />
        </Card>
      )}

      {/* MODAL 1: Assign Asset */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Asset"
        subtitle={`Assign ${asset.name} (${asset.assetTag}) to a team member`}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <Select
            label="Select Team Member"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
          >
            <option value="">-- Choose Team Member --</option>
            {allEmployees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.email}) - {emp.department?.name || 'General'}
              </option>
            ))}
          </Select>

          <Input
            type="date"
            label="Expected Return Date (Optional)"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
          />

          <Textarea
            label="Notes (Optional)"
            placeholder="e.g. Assigned for new hire equipment setup"
            value={assignNotes}
            onChange={(e) => setAssignNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={modalLoading}
            >
              Assign Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Return Asset */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Return Asset"
        subtitle={`Return ${asset.name} (${asset.assetTag}) to storage`}
      >
        <form onSubmit={handleReturn} className="space-y-4">
          <Select
            label="Condition on Return"
            value={returnCondition}
            onChange={(e) => setReturnCondition(e.target.value)}
            required
          >
            {ASSET_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c} {c === 'POOR' || c === 'DAMAGED' ? '(Needs Maintenance)' : '(Available for Use)'}
              </option>
            ))}
          </Select>

          <Textarea
            label="Notes (Optional)"
            placeholder="e.g. Returned with original charger, all working fine"
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReturnModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={modalLoading}
            >
              Return Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Transfer Asset */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Asset"
        subtitle={`Transfer ${asset.name} to another team member`}
      >
        <form onSubmit={handleTransfer} className="space-y-4">
          <Select
            label="New Team Member"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
          >
            <option value="">-- Choose Team Member --</option>
            {allEmployees
              .filter((emp) => emp._id !== asset.assignedTo?._id)
              .map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
          </Select>

          <Input
            label="Reason for Transfer"
            placeholder="e.g. Switching departments, role change"
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
            required
          />

          <Input
            type="date"
            label="Expected Return Date"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTransferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={modalLoading}
            >
              Transfer Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Change Asset Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Change Asset Status"
        subtitle={`Current Status: ${asset.status}`}
      >
        <form onSubmit={handleStatusChange} className="space-y-4">
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            required
          >
            {allowedNextStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Select>

          <Input
            label="Reason for Status Change"
            placeholder="e.g. Reached end of life, retired from service"
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={modalLoading}
            >
              Update Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Report an Issue */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report an Issue"
        subtitle={`Submit a repair request for ${asset.name} (${asset.assetTag})`}
      >
        <form onSubmit={handleReportProblem} className="space-y-4">
          <Select
            label="Issue Type"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            required
          >
            <option value="HARDWARE">Hardware / Physical Damage</option>
            <option value="SOFTWARE">Software / Operating System</option>
            <option value="NETWORK">Network & Connectivity</option>
            <option value="PERIPHERAL">Keyboard, Screen, or Accessories</option>
            <option value="OTHER">Other Issue</option>
          </Select>

          <Select
            label="Priority"
            value={issueUrgency}
            onChange={(e) => setIssueUrgency(e.target.value)}
            required
          >
            <option value="LOW">Low - Still usable with minor issue</option>
            <option value="MEDIUM">Medium - Slows down daily work</option>
            <option value="HIGH">High - Device cannot be used</option>
            <option value="CRITICAL">Critical - Urgent or safety hazard</option>
          </Select>

          <Textarea
            label="Describe the Issue"
            placeholder="Describe what happened and any error messages..."
            value={issueDesc}
            onChange={(e) => setIssueDesc(e.target.value)}
            required
            rows={4}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={modalLoading}
            >
              Submit Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 6: Allocate License Seat */}
      <Modal
        isOpen={allocateSeatModalOpen}
        onClose={() => setAllocateSeatModalOpen(false)}
        title="Allocate License Seat"
        subtitle={`Assign a seat for ${asset.name} (${asset.digitalDetails?.seatsAllocated || 0} / ${asset.digitalDetails?.seatsTotal || 1} currently in use)`}
      >
        <form onSubmit={handleAllocateSeat} className="space-y-4">
          <Select
            label="Select Team Member"
            value={seatUserId}
            onChange={(e) => setSeatUserId(e.target.value)}
            required
          >
            <option value="">-- Choose an employee --</option>
            {allEmployees
              .filter(
                (emp) =>
                  !asset.digitalDetails?.allocatedUsers?.some(
                    (a) => a.user && (a.user._id || a.user).toString() === emp._id.toString()
                  )
              )
              .map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.email}) {emp.department ? `- ${emp.department.name}` : ''}
                </option>
              ))}
          </Select>

          <Input
            label="Allocation Purpose / Notes (Optional)"
            placeholder="e.g. Approved for Frontend team, Project Apollo"
            value={seatNotes}
            onChange={(e) => setSeatNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAllocateSeatModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={modalLoading}
              disabled={!seatUserId}
            >
              Confirm Seat Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetDetailPage;
