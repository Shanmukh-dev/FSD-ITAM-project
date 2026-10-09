import express from 'express';
import {
  getAdminDashboard,
  getAssetManagerDashboard,
  getTechnicianDashboard,
  getEmployeeDashboard,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorize(ROLES.ADMIN), getAdminDashboard);
router.get(
  '/asset-manager',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  getAssetManagerDashboard
);
router.get(
  '/technician',
  authorize(ROLES.ADMIN, ROLES.TECHNICIAN),
  getTechnicianDashboard
);
router.get('/employee', getEmployeeDashboard);

export default router;
