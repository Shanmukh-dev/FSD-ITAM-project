import React from 'react';
import { User, Shield, Building2, Mail, Calendar, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ROLE_LABELS } from '../../utils/constants';

export const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-chalk tracking-tight">
          My Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-0.5">
          Your account details, permissions, and department.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-xs">
            {user?.name?.slice(0, 2) || 'US'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-chalk tracking-tight">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary" size="sm">
                {ROLE_LABELS[user?.role] || user?.role}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="py-6 space-y-3.5 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <Shield size={14} className="text-primary" /> Role
            </span>
            <span className="text-slate-900 dark:text-chalk font-semibold">{ROLE_LABELS[user?.role]}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <Building2 size={14} className="text-primary" /> Department
            </span>
            <span className="text-slate-900 dark:text-chalk font-medium">
              {user?.department?.name || 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <Mail size={14} className="text-primary" /> Work Email
            </span>
            <span className="text-slate-900 dark:text-chalk font-mono text-[11px]">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" /> Account Status
            </span>
            <span className="text-emerald-600 dark:text-emerald font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end">
          <Button variant="danger" size="md" onClick={logout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
