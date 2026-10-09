import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  CheckCircle,
  Clock,
  Coins,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export const MaintenanceDetailPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/maintenance/${id}`);
      if (res.data.success) {
        setTicket(res.data.request);
        setRecord(res.data.record);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load maintenance ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingSkeleton rows={6} />;
  if (error) return <ErrorState message={error} onRetry={fetchDetails} />;
  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/maintenance"
          className="p-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              TICKET #{ticket._id?.slice(-8).toUpperCase()}
            </span>
            <Badge
              variant={ticket.status === 'COMPLETED' ? 'success' : 'warning'}
              size="sm"
            >
              {ticket.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {ticket.asset?.name} ({ticket.asset?.assetTag}) Repair Details
          </h1>
        </div>
      </div>

      {/* Ticket Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Issue Details" />
          <dl className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-mono">
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Issue Type:</dt>
              <dd className="font-bold text-slate-900 dark:text-white">{ticket.issueType}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Priority:</dt>
              <dd className="text-amber-600 dark:text-amber-400 font-bold">{ticket.urgency}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Reported By:</dt>
              <dd className="text-slate-900 dark:text-white">{ticket.reportedBy?.name}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Reported On:</dt>
              <dd className="text-slate-500 dark:text-slate-400">{formatDateTime(ticket.createdAt)}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Assigned Technician:</dt>
              <dd className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {ticket.assignedTechnician?.name || 'Unassigned'}
              </dd>
            </div>
          </dl>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Description:</span>
            <p className="text-xs text-slate-900 dark:text-white mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
              "{ticket.description}"
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Device Details" />
          <dl className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-mono">
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Asset Tag:</dt>
              <dd className="font-bold text-indigo-600 dark:text-indigo-400">{ticket.asset?.assetTag}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Category:</dt>
              <dd className="text-slate-900 dark:text-white">{ticket.asset?.category}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Model:</dt>
              <dd className="text-slate-900 dark:text-white">
                {ticket.asset?.brand} {ticket.asset?.model}
              </dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Serial Number:</dt>
              <dd className="text-slate-900 dark:text-white font-bold">#{ticket.asset?.serialNumber}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Current Status:</dt>
              <dd className="text-slate-900 dark:text-white">{ticket.asset?.status}</dd>
            </div>
          </dl>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
            <Link to={`/assets/${ticket.asset?._id}`}>
              <Button variant="secondary" size="sm" className="w-full text-xs">
                <span>View Asset Details</span>
                <ExternalLink size={12} />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Completed Maintenance Record (if finished) */}
      {record && (
        <Card className="border border-emerald-300 dark:border-emerald/20">
          <CardHeader
            title="Repair Summary"
            subtitle={`Completed by ${record.technician?.name || 'Technician'} on ${formatDateTime(record.completedAt)}`}
          />
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold">Diagnosis</span>
              <p className="text-slate-900 dark:text-white text-xs font-sans mt-1 leading-relaxed">
                {record.diagnosis}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold">Action Taken</span>
              <p className="text-slate-900 dark:text-white text-xs font-sans mt-1 leading-relaxed">
                {record.actionTaken}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold">Total Cost</span>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {formatCurrency(record.cost)}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold">Parts Replaced</span>
                <div className="text-xs text-slate-900 dark:text-white mt-1">
                  {record.partsReplaced && record.partsReplaced.length > 0 ? (
                    record.partsReplaced.map((p, idx) => (
                      <div key={idx} className="flex justify-between py-0.5">
                        <span>{p.name}</span>
                        <span className="font-bold">{formatCurrency(p.cost)}</span>
                      </div>
                    ))
                  ) : (
                    <span>No parts replaced</span>
                  )}
                </div>
              </div>
            </div>

            {record.notes && (
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-4 shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold">Technician Notes</span>
                <p className="text-slate-600 dark:text-slate-300 font-sans text-xs mt-1">
                  {record.notes}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MaintenanceDetailPage;
