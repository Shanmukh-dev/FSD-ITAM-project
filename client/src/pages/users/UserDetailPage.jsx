import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Server, ExternalLink, Shield, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import AssetStatusBadge from '../../components/assets/AssetStatusBadge';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

export const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, hasRole } = useAuth();
  const [user, setUser] = useState(null);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/users/${id}`);
      if (res.data.success) {
        setUser(res.data.user);
        setAssignedAssets(res.data.assignedAssets);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.delete(`/users/${id}`);
      setDeleteDialogOpen(false);
      navigate('/users');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete user account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState message={error} onRetry={fetchUserDetails} />;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/users"
            className="p-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {user.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {user.email} • {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
        </div>

        {hasRole(ROLES.ADMIN) && user._id !== currentUser?._id && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteError(null);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 size={14} />
            <span>Delete User</span>
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader title="User Profile" />
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-3.5 shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-medium">Role</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {ROLE_LABELS[user.role] || user.role}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-3.5 shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-medium">Department</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {user.department?.name || 'Unassigned'}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-3.5 shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-medium">Status</span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald mt-1">
              {user.isActive ? 'Active' : 'Deactivated'}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-3.5 shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 uppercase text-[11px] font-medium">Joined</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {formatDate(user.createdAt)}
            </div>
          </div>
        </dl>
      </Card>

      {/* Assigned Assets */}
      <Card>
        <CardHeader
          title={`Assigned Equipment (${assignedAssets.length})`}
          subtitle="Equipment currently assigned to this team member"
        />

        {assignedAssets.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No equipment is currently assigned to this team member.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Asset Tag</th>
                  <th className="py-2.5 px-3">Device</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {assignedAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {asset.assetTag}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{asset.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {asset.brand} {asset.model}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {asset.category}
                    </td>
                    <td className="py-2.5 px-3">
                      <AssetStatusBadge status={asset.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald">
                      {asset.condition}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link to={`/assets/${asset._id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
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

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        title={deleteError ? 'Cannot Delete User Account' : 'Delete User'}
        message={
          deleteError ||
          `Are you sure you want to delete '${user.name}'? This action cannot be undone.`
        }
        confirmLabel={deleteError ? 'Understood' : 'Delete User'}
        cancelLabel={deleteError ? '' : 'Cancel'}
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default UserDetailPage;
