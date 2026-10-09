import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES } from '../utils/constants.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'itam_super_secret_jwt_key_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Check if system has initial admin or needs bootstrap setup
// @route   GET /api/auth/setup-status
// @access  Public
export const getSetupStatus = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    res.json({
      success: true,
      initialized: userCount > 0,
      userCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bootstrap the initial administrator account (only allowed when DB has 0 users)
// @route   POST /api/auth/setup-admin
// @access  Public
export const setupInitialAdmin = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'System is already initialized with existing users.',
        code: 'ALREADY_INITIALIZED',
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
        code: 'VALIDATION_ERROR',
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: ROLES.ADMIN,
      isActive: true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'System administrator registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get JWT token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
        code: 'MISSING_CREDENTIALS',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .populate('department', 'name');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact an Administrator.',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department', 'name');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (token invalidated on client)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};
