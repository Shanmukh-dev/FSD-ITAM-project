import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), getUsers)
  .post(
    authorize(ROLES.ADMIN),
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
      validate,
    ],
    createUser
  );

router
  .route('/:id')
  .get(getUserById)
  .put(authorize(ROLES.ADMIN), updateUser)
  .delete(authorize(ROLES.ADMIN), deleteUser);

router.patch('/:id/status', authorize(ROLES.ADMIN), toggleUserStatus);

export default router;
