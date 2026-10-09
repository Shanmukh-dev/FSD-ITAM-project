import express from 'express';
import { body } from 'express-validator';
import {
  getAssignments,
  createAssignment,
  returnAssignment,
  transferAssignment,
} from '../controllers/assignmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAssignments)
  .post(
    authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
    [
      body('asset').notEmpty().withMessage('Asset ID is required'),
      body('employee').notEmpty().withMessage('Employee ID is required'),
      validate,
    ],
    createAssignment
  );

router.post('/:id/return', returnAssignment);

router.post(
  '/:id/transfer',
  authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER),
  [body('newEmployeeId').notEmpty().withMessage('Target employee ID is required'), validate],
  transferAssignment
);

export default router;
