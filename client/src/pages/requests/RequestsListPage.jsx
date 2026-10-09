import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileQuestion,
  Plus,
  CheckCircle,
  XCircle,
  PackageCheck,
  Ban,
  Clock,
  ExternalLink,
  X,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input, { Select, Textarea } from '../../components/ui/Input';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import {
  ROLES,
  ASSET_CATEGORIES,
  REQUEST_STATUS,
  REQUEST_PRIORITIES,
} from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const STATUS_TABS = [
  { label: 'All Requests', value: '' },
  { label: 'Pending', value: REQUEST_STATUS.PENDING, color: 'warning' },
  { label: 'Approved', value: REQUEST_STATUS.APPROVED, color: 'primary' },
  { label: 'Fulfilled', value: REQUEST_STATUS.FULFILLED, color: 'emerald' },
  { label: 'Rejected', value: REQUEST_STATUS.REJECTED, color: 'danger' },
];

export const RequestsListPage = () => {
  const { user, hasRole } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form states
  const [reqCategory, setReqCategory] = useState('LAPTOP');
  const [reqPriority, setReqPriority] = useState('MEDIUM');
  const [reqReason, setReqReason] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await api.get(`/asset-requests?${params.toString()}`);
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load asset requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setActionError(null);
    try {
      await api.post('/asset-requests', {
        category: reqCategory,
        priority: reqPriority,
        reason: reqReason,
        description: reqDesc,
      });
      setNewRequestModalOpen(false);
      setReqReason('');
      setReqDesc('');
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/asset-requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request.');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setModalLoading(true);
    setActionError(null);
    try {
      await api.post(`/asset-requests/${selectedRequest._id}/reject`, {
        rejectionReason,
      });
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setModalLoading(false);
    }
  };

  const openFulfillModal = async (req) => {
    setSelectedRequest(req);
    setFulfillModalOpen(true);
    try {
      const res = await api.get(`/assets?status=AVAILABLE&category=${req.category}`);
      if (res.data.success) {
        setAvailableAssets(res.data.assets);
        setSelectedAssetId(res.data.assets[0]?._id || '');
      }
    } catch (err) {
      setAvailableAssets([]);
    }
  };

  const handleFulfill = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !selectedAssetId) return;
    setModalLoading(true);
    setActionError(null);
    try {
      await api.post(`/asset-requests/${selectedRequest._id}/fulfill`, {
        assetId: selectedAssetId,
      });
      setFulfillModalOpen(false);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to fulfill request.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!requestToCancel) return;
    setModalLoading(true);
    try {
      await api.post(`/asset-requests/${requestToCancel}/cancel`);
      setCancelDialogOpen(false);
      setRequestToCancel(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setModalLoading(false);
    }
  };

  const isManagerOrAdmin = hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Equipment Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isManagerOrAdmin
              ? 'Review, approve, and assign equipment for team requests.'
              : 'Request equipment and track the status of your requests.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setActionError(null);
            setNewRequestModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>New Gear Request</span>
        </Button>
      </div>

      {/* 1-Click Status Filter Pills (Less-Clicky) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:border-white/10 dark:text-slate-300'
              }`}
            >
              {tab.color && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-white' : tab.color === 'emerald' ? 'bg-emerald-500' : tab.color === 'warning' ? 'bg-amber-500' : tab.color === 'danger' ? 'bg-rose-500' : 'bg-indigo-500'
                  }`}
                />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white dark:bg-[#070A12]/90 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-600 dark:focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">All Priorities</option>
            {REQUEST_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {(statusFilter || priorityFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No equipment requests found"
          description="There are currently no requests matching your criteria."
          action={{
            label: 'Submit First Request',
            onClick: () => setNewRequestModalOpen(true),
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F19]/80 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wide">
                <tr>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {req.requester?.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {req.requester?.department?.name || req.requester?.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {req.category}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          req.priority === 'URGENT' || req.priority === 'HIGH'
                            ? 'danger'
                            : req.priority === 'MEDIUM'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {req.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          req.status === 'APPROVED' || req.status === 'FULFILLED'
                            ? 'success'
                            : req.status === 'REJECTED'
                            ? 'danger'
                            : req.status === 'CANCELLED'
                            ? 'muted'
                            : 'warning'
                        }
                        size="sm"
                        dot
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-900 dark:text-white line-clamp-1 font-medium">
                        {req.reason}
                      </div>
                      {req.description && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {req.description}
                        </div>
                      )}
                      {req.rejectionReason && (
                        <div className="text-[11px] text-rose-500 dark:text-rose-400">
                          Rejection reason: {req.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 dark:text-slate-500 text-[11px]">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Manager Approvals / Rejections */}
                        {isManagerOrAdmin && req.status === 'PENDING' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 text-xs text-emerald-600 border-emerald-200 dark:text-emerald dark:border-emerald/30 hover:border-emerald/50"
                              onClick={() => handleApprove(req._id)}
                            >
                              <CheckCircle size={13} />
                              <span>Approve</span>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelectedRequest(req);
                                setRejectModalOpen(true);
                              }}
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </Button>
                          </>
                        )}

                        {/* Manager Fulfillment */}
                        {isManagerOrAdmin &&
                          (req.status === 'APPROVED' || req.status === 'PENDING') && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => openFulfillModal(req)}
                            >
                              <PackageCheck size={13} />
                              <span>Assign Asset</span>
                            </Button>
                          )}

                        {/* Requester Cancel */}
                        {req.requester?._id?.toString() === user?.id &&
                          req.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                              onClick={() => {
                                setRequestToCancel(req._id);
                                setCancelDialogOpen(true);
                              }}
                            >
                              <Ban size={13} />
                              <span>Cancel</span>
                            </Button>
                          )}

                        {req.status === 'FULFILLED' && req.fulfilledAsset && (
                          <Link to={`/assets/${req.fulfilledAsset._id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs font-mono">
                              <span>Asset #{req.fulfilledAsset.assetTag}</span>
                              <ExternalLink size={12} />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: Create Request */}
      <Modal
        isOpen={newRequestModalOpen}
        onClose={() => setNewRequestModalOpen(false)}
        title="Request Equipment"
        subtitle="Submit a request for new or replacement equipment"
      >
        {actionError && (
          <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 mb-4">
            {actionError}
          </div>
        )}
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <Select
            label="Category"
            value={reqCategory}
            onChange={(e) => setReqCategory(e.target.value)}
            required
          >
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={reqPriority}
            onChange={(e) => setReqPriority(e.target.value)}
            required
          >
            {REQUEST_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>

          <Input
            label="Purpose / Reason"
            placeholder="e.g. Workstation upgrade, replacement for damaged device"
            value={reqReason}
            onChange={(e) => setReqReason(e.target.value)}
            required
          />

          <Textarea
            label="Details or Notes (Optional)"
            placeholder="e.g. Preferred model, specs, or accessories needed..."
            value={reqDesc}
            onChange={(e) => setReqDesc(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewRequestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={modalLoading}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Reject Request */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Request"
        subtitle={`Reject request from ${selectedRequest?.requester?.name}`}
      >
        {actionError && (
          <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 mb-4">
            {actionError}
          </div>
        )}
        <form onSubmit={handleReject} className="space-y-4">
          <Textarea
            label="Reason for Rejection"
            placeholder="Explain why this request is being rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            rows={3}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={modalLoading}
            >
              Reject Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Fulfill Request */}
      <Modal
        isOpen={fulfillModalOpen}
        onClose={() => setFulfillModalOpen(false)}
        title="Fulfill Request"
        subtitle={`Assign an available ${selectedRequest?.category} to ${selectedRequest?.requester?.name}`}
      >
        {actionError && (
          <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 mb-4">
            {actionError}
          </div>
        )}
        {availableAssets.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">
              No available {selectedRequest?.category} devices in inventory
            </p>
            <p>Add or check in a unit first before fulfilling this request.</p>
          </div>
        ) : (
          <form onSubmit={handleFulfill} className="space-y-4">
            <Select
              label="Select Available Device"
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              required
            >
              {availableAssets.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.assetTag}) - SN: #{a.serialNumber} [{a.condition}]
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFulfillModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={modalLoading}
              >
                Assign & Fulfill
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Request"
        message="Are you sure you want to cancel this equipment request? This action cannot be undone."
        confirmLabel="Cancel Request"
        loading={modalLoading}
        variant="danger"
      />
    </div>
  );
};

export default RequestsListPage;
