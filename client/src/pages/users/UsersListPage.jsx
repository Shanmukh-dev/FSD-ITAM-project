import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input, { Select } from '../../components/ui/Input';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const ROLE_PILLS = [
  { label: 'All Roles', value: '' },
  { label: 'Admins', value: ROLES.ADMIN, color: 'danger' },
  { label: 'Managers', value: ROLES.ASSET_MANAGER, color: 'primary' },
  { label: 'Technicians', value: ROLES.TECHNICIAN, color: 'warning' },
  { label: 'Employees', value: ROLES.EMPLOYEE, color: 'default' },
];

export const UsersListPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.EMPLOYEE,
    department: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      params.append('page', page);
      params.append('limit', '20');

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages || 1);
        setTotalUsers(res.data.total ?? res.data.count ?? 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
    api.get('/departments').then((res) => {
      if (res.data.success) setDepartments(res.data.departments);
    }).catch(() => {});
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      await api.post('/users', formData);
      setModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: ROLES.EMPLOYEE,
        department: '',
      });
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to add user.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user._id}/status`, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Team Members
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage user accounts, roles, and department assignments.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setModalError(null);
            setModalOpen(true);
          }}
        >
          <UserPlus size={16} />
          <span>Provision User</span>
        </Button>
      </div>

      {/* 1-Click Role Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ROLE_PILLS.map((pill) => {
          const isActive = roleFilter === pill.value;
          return (
            <button
              key={pill.label}
              onClick={() => {
                setRoleFilter(pill.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:border-white/10 dark:text-slate-300'
              }`}
            >
              {pill.color && pill.color !== 'default' && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-white' : pill.color === 'danger' ? 'bg-rose-500' : pill.color === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                />
              )}
              <span>{pill.label}</span>
            </button>
          );
        })}

        {(search || roleFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setRoleFilter('');
              setPage(1);
            }}
            className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 ml-auto px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input Card */}
      <Card className="p-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search team members by name or email..."
        />
      </Card>

      {/* User Table */}
      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="No team members match your current search filters."
          action={{
            label: 'Provision First User',
            onClick: () => setModalOpen(true),
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0B0F19]/80 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wide">
                <tr>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {u.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          u.role === 'ADMIN'
                            ? 'danger'
                            : u.role === 'ASSET_MANAGER'
                            ? 'primary'
                            : u.role === 'TECHNICIAN'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {u.department?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={u.isActive ? 'success' : 'muted'}
                        size="sm"
                        dot
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant={u.isActive ? 'outline' : 'secondary'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </Button>
                        <Link to={`/users/${u._id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" title="View Profile">
                            <ExternalLink size={12} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 disabled:opacity-40"
                          title={u._id === currentUser?._id ? 'Cannot delete your own account' : 'Delete user'}
                          disabled={u._id === currentUser?._id}
                          onClick={() => handleDeleteClick(u)}
                        >
                          <Trash2 size={13} />
                        </Button>
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
                Page <span className="text-slate-900 dark:text-white font-semibold">{page}</span> of {totalPages} ({totalUsers} total members)
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

      {/* MODAL: Provision New User */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Team Member"
        subtitle="Create a new account for a team member"
      >
        {modalError && (
          <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 mb-4">
            {modalError}
          </div>
        )}
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Alice Chen"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            type="email"
            label="Work Email"
            placeholder="alice.chen@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          >
            {Object.entries(ROLES).map(([key, val]) => (
              <option key={val} value={val}>
                {ROLE_LABELS[val]}
              </option>
            ))}
          </Select>

          <Select
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          >
            <option value="">-- No Department --</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={modalLoading}
            >
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={userToDelete ? handleConfirmDelete : () => setDeleteDialogOpen(false)}
        title={deleteError ? 'Cannot Delete User Account' : 'Delete User'}
        message={
          deleteError ||
          `Are you sure you want to delete '${userToDelete?.name}'? This action cannot be undone.`
        }
        confirmLabel={deleteError ? 'Understood' : 'Delete User'}
        cancelLabel={deleteError ? '' : 'Cancel'}
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default UsersListPage;
