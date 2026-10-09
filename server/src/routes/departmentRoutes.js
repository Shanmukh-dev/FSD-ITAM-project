import express from 'express';
import { body } from 'express-validator';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getDepartments)
  .post(
    authorize(ROLES.ADMIN),
    [body('name').trim().notEmpty().withMessage('Department name is required'), validate],
    createDepartment
  );

router
  .route('/:id')
  .get(getDepartmentById)
  .put(authorize(ROLES.ADMIN), updateDepartment)
  .delete(authorize(ROLES.ADMIN), deleteDepartment);

export default router;
