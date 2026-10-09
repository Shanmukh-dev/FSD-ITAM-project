import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertCircle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex gap-4 items-start">
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            variant === 'danger'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
          }`}
        >
          <AlertCircle size={20} />
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {message}
          </p>
          <div className="flex justify-end gap-2.5">
            <Button variant="ghost" onClick={onClose} disabled={loading} size="sm">
              {cancelLabel}
            </Button>
            <Button
              variant={variant}
              onClick={onConfirm}
              loading={loading}
              size="sm"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
