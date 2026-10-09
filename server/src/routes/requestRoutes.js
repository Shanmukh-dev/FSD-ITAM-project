import express from 'express';
import { body } from 'express-validator';
import {
  getAssetRequests,
  getAssetRequestById,
  createAssetRequest,
  approveAssetRequest,
  rejectAssetRequest,
  fulfillAssetRequest,
  cancelAssetRequest,
} from '../controllers/requestController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ROLES, ASSET_CATEGORIES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAssetRequests)
  .post(
    [
      body('category').isIn(ASSET_CATEGORIES).withMessage('Valid asset category is required'),
      body('reason').trim().notEmpty().withMessage('Reason for request is required'),
      validate,
    ],
    createAssetRequest
  );

router.route('/:id').get(getAssetRequestById);

router.post(
  '/:id/approve',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  approveAssetRequest
);

router.post(
  '/:id/reject',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  [body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required'), validate],
  rejectAssetRequest
);

router.post(
  '/:id/fulfill',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  [body('assetId').notEmpty().withMessage('Asset ID to assign is required'), validate],
  fulfillAssetRequest
);

router.post('/:id/cancel', cancelAssetRequest);

export default router;
