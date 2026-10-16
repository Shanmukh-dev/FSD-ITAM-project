import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  AlertTriangle,
  Play,
  CheckCircle,
  ExternalLink,
  Plus,
  UserCheck,
  X,
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
import {
  ROLES,
  MAINTENANCE_STATUS,
  MAINTENANCE_URGENCY,
  MAINTENANCE_ISSUE_TYPES,
} from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/formatters';

const STATUS_TABS = [
  { label: 'All Tickets', value: '' },
  { label: 'Reported', value: MAINTENANCE_STATUS.REPORTED, color: 'warning' },
  { label: 'Assigned', value: MAINTENANCE_STATUS.ASSIGNED, color: 'primary' },
  { label: 'In Progress', value: MAINTENANCE_STATUS.IN_PROGRESS, color: 'primary' },
  { label: 'Completed', value: MAINTENANCE_STATUS.COMPLETED, color: 'emerald' },
];

export const MaintenanceListPage = () => {
  const { user, hasRole } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Data for reporting
  const [myAssets, setMyAssets] = useState([]);
  const [allTechnicians, setAllTechnicians] = useState([]);

  // Form states
  const [reportAssetId, setReportAssetId] = useState('');
  const [reportIssueType, setReportIssueType] = useState('HARDWARE');
  const [reportUrgency, setReportUrgency] = useState('MEDIUM');
  const [reportDesc, setReportDesc] = useState('');

  const [selectedTechId, setSelectedTechId] = useState('');

  const [diagnosis, setDiagnosis] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [repairCost, setRepairCost] = useState('0');
  const [partsReplacedName, setPartsReplacedName] = useState('');
  const [partsReplacedCost, setPartsReplacedCost] = useState('0');
  const [repairNotes, setRepairNotes] = useState('');

  const [modalLoading, setModalLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (urgencyFilter) params.append('urgency', urgencyFilter);

      const res = await api.get(`/maintenance?${params.toString()}`);
      if (res.data.success) {
        setTickets(res.data.requests);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load maintenance queue.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, urgencyFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Load assets for defect reporting (my assigned assets or all assets if admin/manager)
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const res = await api.get('/assets?limit=100');
        if (res.data.success) {
          setMyAssets(res.data.assets);
          if (res.data.assets.length > 0) {
            setReportAssetId(res.data.assets[0]._id);
          }
        }
      } catch (err) {}
    };
    loadAssets();
  }, []);

  // Load technicians for assignment
  useEffect(() => {
    const loadTechs = async () => {
      try {
        const res = await api.get('/users?role=TECHNICIAN');
        if (res.data.success) {
          setAllTechnicians(res.data.users);
          if (res.data.users.length > 0) {
            setSelectedTechId(res.data.users[0]._id);
          }
        }
      } catch (err) {}
    };
    if (hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER)) {
      loadTechs();
    }
  }, [hasRole]);

  const handleReportDefect = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setActionError(null);
    try {
      await api.post('/maintenance', {
        asset: reportAssetId,
        issueType: reportIssueType,
        description: reportDesc,
        urgency: reportUrgency,
      });
      setReportModalOpen(false);
      setReportDesc('');
      fetchTickets();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to dispatch maintenance ticket.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !selectedTechId) return;
    setModalLoading(true);
    setActionError(null);
    try {
      await api.post(`/maintenance/${selectedTicket._id}/assign`, {
        technicianId: selectedTechId,
      });
      setAssignModalOpen(false);
      fetchTickets();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to assign technician.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStartWork = async (ticketId) => {
    try {
      await api.patch(`/maintenance/${ticketId}/status`, {
        status: MAINTENANCE_STATUS.IN_PROGRESS,
      });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleCompleteRepair = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setModalLoading(true);
    setActionError(null);
    try {
      const parts = partsReplacedName
        ? [{ partName: partsReplacedName, cost: Number(partsReplacedCost) }]
        : [];

      await api.post(`/maintenance/${selectedTicket._id}/complete`, {
        actionTaken: `${diagnosis} - ${actionTaken}`,
        cost: Number(repairCost) + Number(partsReplacedCost),
        notes: repairNotes,
        partsReplaced: parts,
      });
      setCompleteModalOpen(false);
      fetchTickets();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to complete repair record.');
    } finally {
      setModalLoading(false);
    }
  };

  const isTechnician = hasRole(ROLES.TECHNICIAN, ROLES.ADMIN);
  const isManagerOrAdmin = hasRole(ROLES.ADMIN, ROLES.ASSET_MANAGER);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Maintenance & Repairs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track and manage device repairs and maintenance requests.
          </p>
        </div>

        <Button
          variant="danger"
          size="md"
          onClick={() => {
            setActionError(null);
            setReportModalOpen(true);
          }}
        >
          <AlertTriangle size={16} />
          <span>Report an Issue</span>
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
                    isActive ? 'bg-white' : tab.color === 'emerald' ? 'bg-emerald-500' : tab.color === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-white dark:bg-[#070A12]/90 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-600 dark:focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">All Urgency Levels</option>
            {MAINTENANCE_URGENCY.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          {(statusFilter || urgencyFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setUrgencyFilter('');
              }}
              className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tickets List */}
      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTickets} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No repair tickets active"
          description="All devices are operational. No active repair requests."
          action={{
            label: 'Report an Issue',
            onClick: () => setReportModalOpen(true),
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F19]/80 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wide">
                <tr>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Issue</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {t.asset?.assetTag}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.asset?.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white">{t.issueType}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        "{t.description}"
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          t.urgency === 'CRITICAL' || t.urgency === 'HIGH'
                            ? 'danger'
                            : t.urgency === 'MEDIUM'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {t.urgency}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          t.status === 'COMPLETED'
                            ? 'success'
                            : t.status === 'IN_PROGRESS'
                            ? 'primary'
                            : t.status === 'ASSIGNED'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                        dot
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {t.assignedTechnician ? (
                        <div className="font-medium text-slate-900 dark:text-white">
                          {t.assignedTechnician.name}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {t.reportedBy?.name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {formatDate(t.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Assign Tech */}
                        {isManagerOrAdmin && !t.assignedTechnician && t.status !== 'COMPLETED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedTicket(t);
                              setAssignModalOpen(true);
                            }}
                          >
                            <UserCheck size={13} />
                            <span>Assign Technician</span>
                          </Button>
                        )}

                        {/* Start Work */}
                        {isTechnician && t.status === 'ASSIGNED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30"
                            onClick={() => handleStartWork(t._id)}
                          >
                            <Play size={13} />
                            <span>Start Repair</span>
                          </Button>
                        )}

                        {/* Complete Repair */}
                        {isTechnician && t.status === 'IN_PROGRESS' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedTicket(t);
                              setCompleteModalOpen(true);
                            }}
                          >
                            <CheckCircle size={13} />
                            <span>Complete Repair</span>
                          </Button>
                        )}

                        <Link to={`/maintenance/${t._id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            <ExternalLink size={13} />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: Report Defect */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report an Issue"
        subtitle="Submit a repair request for a damaged or faulty device"
      >
        {actionError && (
          <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 mb-4">
            {actionError}
          </div>
        )}
        <form onSubmit={handleReportDefect} className="space-y-4">
          <Select
            label="Select Device"
            value={reportAssetId}
            onChange={(e) => setReportAssetId(e.target.value)}
            required
          >
            {myAssets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.assetTag}) - SN: #{a.serialNumber}
              </option>
            ))}
          </Select>

          <Select
            label="Issue Type"
            value={reportIssueType}
            onChange={(e) => setReportIssueType(e.target.value)}
            required
          >
            {MAINTENANCE_ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={reportUrgency}
            onChange={(e) => setReportUrgency(e.target.value)}
            required
          >
            {MAINTENANCE_URGENCY.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>

          <Textarea
            label="Describe the Issue"
            placeholder="Describe what happened, error messages, or symptoms..."
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
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

      {/* MODAL 2: Assign Technician */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Technician"
        subtitle={`Assign repair for ${selectedTicket?.asset?.name} (${selectedTicket?.asset?.assetTag})`}
      >
        {actionError && (
          <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 mb-4">
            {actionError}
          </div>
        )}
        <form onSubmit={handleAssignTechnician} className="space-y-4">
          <Select
            label="Select Technician"
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            required
          >
            {allTechnicians.map((tech) => (
              <option key={tech._id} value={tech._id}>
                {tech.name} ({tech.email})
              </option>
            ))}
          </Select>

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
              Assign Technician
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Complete Repair */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Repair"
        subtitle={`Record the repair details for ${selectedTicket?.asset?.name}`}
      >
        {actionError && (
          <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 mb-4">
            {actionError}
          </div>
        )}
        <form onSubmit={handleCompleteRepair} className="space-y-4">
          <Textarea
            label="Problem Found"
            placeholder="What was causing the issue (e.g. damaged cable, faulty battery)"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
            rows={2}
          />

          <Textarea
            label="Action Taken"
            placeholder="e.g. Replaced display cable, reinstalled system, tested device"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            required
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min="0"
              label="Repair Cost (₹)"
              value={repairCost}
              onChange={(e) => setRepairCost(e.target.value)}
            />
            <Input
              type="number"
              min="0"
              label="Parts Cost (₹)"
              value={partsReplacedCost}
              onChange={(e) => setPartsReplacedCost(e.target.value)}
            />
          </div>

          <Input
            label="Parts Replaced (Optional)"
            placeholder="e.g. Kingston 16GB DDR5 SODIMM"
            value={partsReplacedName}
            onChange={(e) => setPartsReplacedName(e.target.value)}
          />

          <Textarea
            label="Additional Notes (Optional)"
            placeholder="e.g. Tested and ready to be used again..."
            value={repairNotes}
            onChange={(e) => setRepairNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCompleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={modalLoading}
            >
              Mark as Repaired
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceListPage;
