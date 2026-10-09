import express from 'express';
import { body } from 'express-validator';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  updateAssetStatus,
  getAssetHistory,
  allocateSeat,
  revokeSeat,
} from '../controllers/assetController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ROLES, ASSET_CATEGORIES, ASSET_TYPES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAssets)
  .post(
    authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
    [
      body('assetTag').trim().notEmpty().withMessage('Asset tag is required'),
      body('name').trim().notEmpty().withMessage('Asset name is required'),
      body('category').isIn(ASSET_CATEGORIES).withMessage('Valid category is required'),
      body('assetType')
        .optional()
        .isIn(Object.values(ASSET_TYPES))
        .withMessage('Valid asset type is required'),
      body('brand')
        .custom((value, { req }) => {
          const type = req.body.assetType || ASSET_TYPES.PHYSICAL;
          if (type === ASSET_TYPES.PHYSICAL && (!value || !value.trim())) {
            throw new Error('Brand is required for physical assets');
          }
          return true;
        }),
      body('model')
        .custom((value, { req }) => {
          const type = req.body.assetType || ASSET_TYPES.PHYSICAL;
          if (type === ASSET_TYPES.PHYSICAL && (!value || !value.trim())) {
            throw new Error('Model is required for physical assets');
          }
          return true;
        }),
      body('serialNumber')
        .custom((value, { req }) => {
          const type = req.body.assetType || ASSET_TYPES.PHYSICAL;
          if (type === ASSET_TYPES.PHYSICAL && (!value || !value.trim())) {
            throw new Error('Serial number is required for physical assets');
          }
          return true;
        }),
      body('purchaseDate').isISO8601().withMessage('Valid purchase date is required'),
      body('purchasePrice').isFloat({ min: 0 }).withMessage('Valid non-negative purchase price is required'),
      validate,
    ],
    createAsset
  );

router
  .route('/:id')
  .get(getAssetById)
  .put(authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), updateAsset);

router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  [body('status').notEmpty().withMessage('Target status is required'), validate],
  updateAssetStatus
);

router.get('/:id/history', getAssetHistory);

// Seat allocation for digital multi-seat assets
router.post(
  '/:id/allocate-seat',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  [body('userId').isMongoId().withMessage('Valid user ID is required'), validate],
  allocateSeat
);

router.post(
  '/:id/revoke-seat',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  [body('userId').isMongoId().withMessage('Valid user ID is required'), validate],
  revokeSeat
);

export default router;
