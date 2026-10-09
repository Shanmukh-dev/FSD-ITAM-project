import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/layout/AppShell';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AssetsListPage from '../pages/assets/AssetsListPage';
import AssetCreatePage from '../pages/assets/AssetCreatePage';
import AssetDetailPage from '../pages/assets/AssetDetailPage';
import RequestsListPage from '../pages/requests/RequestsListPage';
import MaintenanceListPage from '../pages/maintenance/MaintenanceListPage';
import MaintenanceDetailPage from '../pages/maintenance/MaintenanceDetailPage';
import UsersListPage from '../pages/users/UsersListPage';
import UserDetailPage from '../pages/users/UserDetailPage';
import DepartmentsListPage from '../pages/departments/DepartmentsListPage';
import ReportsPage from '../pages/reports/ReportsPage';
import ProfilePage from '../pages/profile/ProfilePage';

import { ROLES } from '../utils/constants';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes wrapped in AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Asset Management */}
          <Route path="/assets" element={<AssetsListPage />} />
          <Route
            path="/assets/new"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER]} />
            }
          >
            <Route index element={<AssetCreatePage />} />
          </Route>
          <Route path="/assets/:id" element={<AssetDetailPage />} />

          {/* Allocation & Requests */}
          <Route path="/requests" element={<RequestsListPage />} />

          {/* Maintenance */}
          <Route path="/maintenance" element={<MaintenanceListPage />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />

          {/* Admin Identity Management */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/departments" element={<DepartmentsListPage />} />
          </Route>

          {/* Reports & Analytics */}
          <Route
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER]} />
            }
          >
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
