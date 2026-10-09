import express from 'express';
import {
  getAssetStatusReport,
  getDepartmentReport,
  getAssetValueReport,
  getMaintenanceReport,
  getLifecycleReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER));

router.get('/asset-status', getAssetStatusReport);
router.get('/department', getDepartmentReport);
router.get('/asset-value', getAssetValueReport);
router.get('/maintenance', getMaintenanceReport);
router.get('/lifecycle', getLifecycleReport);

export default router;
