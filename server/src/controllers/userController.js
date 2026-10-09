import User from '../models/User.js';
import Asset from '../models/Asset.js';
import Department from '../models/Department.js';
import AssetRequest from '../models/AssetRequest.js';
import Notification from '../models/Notification.js';

// @desc    Get all users (paginated with search & filters)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, department, isActive, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID with assigned assets
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('department', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        code: 'NOT_FOUND',
      });
    }

    // Find all assets assigned to this user
    const assignedAssets = await Asset.find({ assignedTo: user._id })
      .select('assetTag name category brand model status condition');

    res.json({
      success: true,
      user,
      assignedAssets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
        code: 'DUPLICATE_EMAIL',
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'EMPLOYEE',
      department: department || null,
      isActive: true,
    });

    const populatedUser = await User.findById(user._id).populate('department', 'name');

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const { name, role, department } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        code: 'NOT_FOUND',
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department || null;

    if (req.body.password) {
      user.passwordHash = req.body.password;
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('department', 'name');

    res.json({
      success: true,
      message: 'User updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        code: 'NOT_FOUND',
      });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.',
        code: 'CANNOT_DEACTIVATE_SELF',
      });
    }

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        code: 'NOT_FOUND',
      });
    }

    // Prevent deleting own administrative account
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.',
        code: 'CANNOT_DELETE_SELF',
      });
    }

    // Check if user has active assigned assets
    const assignedAssetsCount = await Asset.countDocuments({ assignedTo: user._id });
    if (assignedAssetsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user who currently has ${assignedAssetsCount} assigned asset(s). Please return or reassign equipment before deleting.`,
        code: 'USER_HAS_ASSIGNED_ASSETS',
      });
    }

    // Check if user has active pending asset requests
    const pendingRequestsCount = await AssetRequest.countDocuments({
      requester: user._id,
      status: 'PENDING',
    });
    if (pendingRequestsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user who currently has ${pendingRequestsCount} pending asset request(s). Please resolve or cancel requests before deleting.`,
        code: 'USER_HAS_PENDING_REQUESTS',
      });
    }

    // Clear user as department head if applicable
    await Department.updateMany({ head: user._id }, { head: null });

    // Clean up notifications for this user
    await Notification.deleteMany({ recipient: user._id });

    // Permanently remove the user document
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'User account permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};
