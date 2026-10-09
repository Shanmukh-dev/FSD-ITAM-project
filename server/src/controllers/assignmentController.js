import Assignment from '../models/Assignment.js';
import Asset from '../models/Asset.js';
import User from '../models/User.js';
import AssetRequest from '../models/AssetRequest.js';
import { recordAssetHistory } from '../services/historyService.js';
import { sendNotification } from '../services/notificationService.js';
import { canAssetBeAssigned } from '../services/assetService.js';
import {
  ASSET_STATUS,
  HISTORY_ACTIONS,
  REQUEST_STATUS,
  NOTIFICATION_TYPES,
  ROLES,
} from '../utils/constants.js';

// @desc    Get assignments (filterable by asset, employee, active)
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res, next) => {
  try {
    const { asset, employee, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    if (asset) query.asset = asset;
    if (employee) query.employee = employee;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // If Employee, only see their assignments
    if (req.user.role === ROLES.EMPLOYEE) {
      query.employee = req.user.id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Assignment.countDocuments(query);
    const assignments = await Assignment.find(query)
      .populate('asset', 'assetTag name category brand model status')
      .populate('employee', 'name email department')
      .populate('assignedBy', 'name email')
      .sort({ assignedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: assignments.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign an available asset to an employee
// @route   POST /api/assignments
// @access  Private (Admin, Asset Manager)
export const createAssignment = async (req, res, next) => {
  try {
    const {
      asset: assetId,
      employee: employeeId,
      expectedReturnDate,
      notes,
      requestId,
    } = req.body;

    const [asset, employee] = await Promise.all([
      Asset.findById(assetId),
      User.findById(employeeId),
    ]);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
        code: 'NOT_FOUND',
      });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
        code: 'NOT_FOUND',
      });
    }

    // Verify asset assignment validity
    const assignCheck = canAssetBeAssigned(asset);
    if (!assignCheck.canAssign) {
      return res.status(400).json({
        success: false,
        message: assignCheck.reason,
        code: 'ASSET_NOT_ASSIGNABLE',
      });
    }

    // Check if there is already an active assignment
    const activeAssignment = await Assignment.findOne({
      asset: asset._id,
      isActive: true,
    });
    if (activeAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This asset already has an active assignment record.',
        code: 'ACTIVE_ASSIGNMENT_EXISTS',
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      asset: asset._id,
      employee: employee._id,
      assignedBy: req.user.id,
      assignedAt: new Date(),
      expectedReturnDate: expectedReturnDate || null,
      notes: notes?.trim(),
      isActive: true,
    });

    // Update asset
    asset.status = ASSET_STATUS.ASSIGNED;
    asset.assignedTo = employee._id;
    await asset.save();

    // If linked to an asset request, fulfill it
    if (requestId) {
      const request = await AssetRequest.findById(requestId);
      if (request) {
        request.status = REQUEST_STATUS.FULFILLED;
        request.fulfilledAsset = asset._id;
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();
      }
    }

    // Record lifecycle history
    await recordAssetHistory(
      asset._id,
      HISTORY_ACTIONS.ASSIGNED,
      req.user.id,
      {
        employee: employee.name,
        employeeEmail: employee.email,
        expectedReturnDate,
        notes,
      }
    );

    // Notify employee
    await sendNotification({
      recipient: employee._id,
      type: NOTIFICATION_TYPES.ASSET_ASSIGNED,
      title: 'New Hardware Asset Assigned',
      message: `You have been allocated ${asset.name} (${asset.assetTag}).`,
      relatedId: asset._id,
      relatedType: 'Asset',
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('asset', 'assetTag name category brand model status')
      .populate('employee', 'name email')
      .populate('assignedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Asset assigned successfully.',
      assignment: populatedAssignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process asset return from employee
// @route   POST /api/assignments/:id/return
// @access  Private (Admin, Asset Manager, or Assignee)
export const returnAssignment = async (req, res, next) => {
  try {
    const { returnCondition, notes } = req.body;

    const assignment = await Assignment.findById(req.params.id)
      .populate('asset')
      .populate('employee', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment record not found.',
        code: 'NOT_FOUND',
      });
    }

    if (!assignment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This assignment has already been closed and returned.',
        code: 'ALREADY_RETURNED',
      });
    }

    const asset = await Asset.findById(assignment.asset._id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Linked asset could not be found.',
        code: 'NOT_FOUND',
      });
    }

    // Close assignment
    assignment.isActive = false;
    assignment.returnedAt = new Date();
    assignment.returnCondition = returnCondition || 'GOOD';
    if (notes) assignment.notes = `${assignment.notes || ''} [Return Notes: ${notes}]`.trim();
    await assignment.save();

    // Determine asset condition and next state
    const condition = returnCondition || 'GOOD';
    asset.condition = condition;
    asset.assignedTo = null;

    if (condition === 'POOR' || condition === 'DAMAGED') {
      asset.status = ASSET_STATUS.MAINTENANCE;
    } else {
      asset.status = ASSET_STATUS.AVAILABLE;
    }

    await asset.save();

    // Log history
    await recordAssetHistory(
      asset._id,
      HISTORY_ACTIONS.RETURNED,
      req.user.id,
      {
        returnedBy: assignment.employee.name,
        returnCondition: condition,
        nextStatus: asset.status,
      }
    );

    // Notify employee of return completion
    await sendNotification({
      recipient: assignment.employee._id,
      type: NOTIFICATION_TYPES.ASSET_RETURNED,
      title: 'Asset Return Processed',
      message: `Your return of ${asset.name} (${asset.assetTag}) in ${condition} condition has been confirmed.`,
      relatedId: asset._id,
      relatedType: 'Asset',
    });

    res.json({
      success: true,
      message: `Asset return processed successfully. Asset status updated to ${asset.status}.`,
      assignment,
      asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer asset between employees or departments
// @route   POST /api/assignments/:id/transfer
// @access  Private (Admin, Asset Manager)
export const transferAssignment = async (req, res, next) => {
  try {
    const { newEmployeeId, newDepartmentId, reason, expectedReturnDate } = req.body;

    const currentAssignment = await Assignment.findById(req.params.id)
      .populate('asset')
      .populate('employee', 'name email');

    if (!currentAssignment || !currentAssignment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'An active assignment is required for transfer.',
        code: 'NO_ACTIVE_ASSIGNMENT',
      });
    }

    const [newEmployee, asset] = await Promise.all([
      User.findById(newEmployeeId),
      Asset.findById(currentAssignment.asset._id),
    ]);

    if (!newEmployee) {
      return res.status(404).json({
        success: false,
        message: 'New recipient employee not found.',
        code: 'NOT_FOUND',
      });
    }

    // 1. Close current assignment
    currentAssignment.isActive = false;
    currentAssignment.returnedAt = new Date();
    currentAssignment.notes = `${currentAssignment.notes || ''} [Transferred to ${newEmployee.name}: ${reason || 'N/A'}]`.trim();
    await currentAssignment.save();

    // 2. Create new assignment
    const newAssignment = await Assignment.create({
      asset: asset._id,
      employee: newEmployee._id,
      assignedBy: req.user.id,
      assignedAt: new Date(),
      expectedReturnDate: expectedReturnDate || null,
      notes: `Transferred from ${currentAssignment.employee.name}. Reason: ${reason || 'Department re-allocation'}`,
      isActive: true,
    });

    // 3. Update asset
    asset.assignedTo = newEmployee._id;
    if (newDepartmentId) {
      asset.department = newDepartmentId;
    }
    await asset.save();

    // 4. Log lifecycle history
    await recordAssetHistory(
      asset._id,
      HISTORY_ACTIONS.TRANSFERRED,
      req.user.id,
      {
        fromEmployee: currentAssignment.employee.name,
        toEmployee: newEmployee.name,
        reason: reason || 'Hardware handover',
      }
    );

    // 5. Notify both employees
    await Promise.all([
      sendNotification({
        recipient: currentAssignment.employee._id,
        type: NOTIFICATION_TYPES.SYSTEM_ALERT,
        title: 'Asset Transfer Notice',
        message: `Asset ${asset.name} (${asset.assetTag}) has been transferred to ${newEmployee.name}.`,
        relatedId: asset._id,
        relatedType: 'Asset',
      }),
      sendNotification({
        recipient: newEmployee._id,
        type: NOTIFICATION_TYPES.ASSET_ASSIGNED,
        title: 'Hardware Asset Transferred to You',
        message: `Asset ${asset.name} (${asset.assetTag}) has been transferred into your custody.`,
        relatedId: asset._id,
        relatedType: 'Asset',
      }),
    ]);

    res.json({
      success: true,
      message: 'Asset transfer completed successfully.',
      newAssignment,
      asset,
    });
  } catch (error) {
    next(error);
  }
};
