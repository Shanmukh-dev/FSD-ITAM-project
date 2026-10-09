import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import AssetManagerDashboard from '../../components/dashboard/AssetManagerDashboard';
import TechnicianDashboard from '../../components/dashboard/TechnicianDashboard';
import EmployeeDashboard from '../../components/dashboard/EmployeeDashboard';
import { ROLES } from '../../utils/constants';

export const DashboardPage = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case ROLES.ADMIN:
      return <AdminDashboard />;
    case ROLES.ASSET_MANAGER:
      return <AssetManagerDashboard />;
    case ROLES.TECHNICIAN:
      return <TechnicianDashboard />;
    case ROLES.EMPLOYEE:
    default:
      return <EmployeeDashboard />;
  }
};

export default DashboardPage;
