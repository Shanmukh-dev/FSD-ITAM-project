import express from 'express';
import { body } from 'express-validator';
import {
  getMaintenanceRequests,
  getMaintenanceById,
  createMaintenanceRequest,
  assignTechnician,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
} from '../controllers/maintenanceController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ROLES, MAINTENANCE_ISSUE_TYPES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getMaintenanceRequests)
  .post(
    [
      body('asset').notEmpty().withMessage('Asset ID is required'),
      body('issueType')
        .isIn(MAINTENANCE_ISSUE_TYPES)
        .withMessage('Valid issue type is required'),
      body('description')
        .trim()
        .notEmpty()
        .withMessage('Defect description is required'),
      validate,
    ],
    createMaintenanceRequest
  );

router.route('/:id').get(getMaintenanceById);

router.patch(
  '/:id/assign',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  [body('technicianId').notEmpty().withMessage('Technician ID is required'), validate],
  assignTechnician
);

router.post(
  '/:id/start',
  authorize(ROLES.TECHNICIAN, ROLES.ADMIN),
  startMaintenance
);

router.post(
  '/:id/complete',
  authorize(ROLES.TECHNICIAN, ROLES.ADMIN),
  [
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    body('actionTaken').trim().notEmpty().withMessage('Action taken is required'),
    validate,
  ],
  completeMaintenance
);

router.post(
  '/:id/cancel',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  cancelMaintenance
);

export default router;
