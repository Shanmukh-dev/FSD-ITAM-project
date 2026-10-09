import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Server, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Textarea } from '../../components/ui/Input';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

export const DepartmentsListPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    try {
      await api.post('/departments', { name, description });
      setModalOpen(false);
      setName('');
      setDescription('');
      fetchDepartments();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setModalLoading(false);
    }
  };

  const initiateDelete = (dept) => {
    if (dept.employeeCount > 0 || dept.assetCount > 0) {
      setDeleteError(
        `Cannot delete department '${dept.name}'. There are currently ${dept.employeeCount} members and ${dept.assetCount} assets assigned to it. Please reassign them first.`
      );
      setDeptToDelete(null);
      setDeleteDialogOpen(true);
      return;
    }
    setDeleteError(null);
    setDeptToDelete(dept);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;
    setModalLoading(true);
    try {
      await api.delete(`/departments/${deptToDelete._id}`);
      setDeleteDialogOpen(false);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete department.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Departments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage company departments, team members, and assigned equipment.
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
          <Plus size={16} />
          <span>New Department</span>
        </Button>
      </div>

      {/* Grid of Department Cards */}
      {loading ? (
        <LoadingSkeleton type="cards" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDepartments} />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Add departments to organize your team members and devices."
          action={{
            label: 'Add Department',
            onClick: () => setModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept._id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 shadow-xs">
                    <Building2 size={20} />
                  </div>
                  <button
                    type="button"
                    onClick={() => initiateDelete(dept)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Department"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-[#070A12]/70 border border-slate-200/80 dark:border-white/5 rounded-lg p-2.5 flex items-center gap-2">
                  <Users size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      Members
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {dept.employeeCount || 0}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#070A12]/70 border border-slate-200/80 dark:border-white/5 rounded-lg p-2.5 flex items-center gap-2">
                  <Server size={16} className="text-emerald-600 dark:text-emerald shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                      Assets
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {dept.assetCount || 0}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Department"
        subtitle="Create a new department to group team members and assets"
      >
        {modalError && (
          <div className="bg-rose-50 dark:bg-destructive/15 border border-rose-200 dark:border-destructive/30 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 mb-4">
            {modalError}
          </div>
        )}
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <Input
            id="name"
            label="Department Name"
            placeholder="e.g. Engineering, Marketing, Operations"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of this department..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

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
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeptToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={deptToDelete ? confirmDelete : () => setDeleteDialogOpen(false)}
        title={deleteError ? 'Cannot Delete Department' : 'Delete Department'}
        message={
          deleteError ||
          `Are you sure you want to delete '${deptToDelete?.name}'? This action cannot be undone.`
        }
        confirmLabel={deleteError ? 'Understood' : 'Delete Department'}
        cancelLabel={deleteError ? '' : 'Cancel'}
        loading={modalLoading}
        variant="danger"
      />
    </div>
  );
};

export default DepartmentsListPage;
