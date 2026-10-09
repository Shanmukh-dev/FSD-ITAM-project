import AssetRequest from '../models/AssetRequest.js';
import Asset from '../models/Asset.js';
import Assignment from '../models/Assignment.js';
import { recordAssetHistory } from '../services/historyService.js';
import { sendNotification, notifyUsersByRole } from '../services/notificationService.js';
import { canAssetBeAssigned } from '../services/assetService.js';
import {
  REQUEST_STATUS,
  ASSET_STATUS,
  HISTORY_ACTIONS,
  NOTIFICATION_TYPES,
  ROLES,
} from '../utils/constants.js';

// @desc    Get asset requests (filtered by status, requester)
// @route   GET /api/asset-requests
// @access  Private
export const getAssetRequests = async (req, res, next) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    const query = {};

    // If Employee, only see their own requests
    if (req.user.role === ROLES.EMPLOYEE) {
      query.requester = req.user.id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AssetRequest.countDocuments(query);
    const requests = await AssetRequest.find(query)
      .populate('requester', 'name email department')
      .populate('reviewedBy', 'name')
      .populate('fulfilledAsset', 'assetTag name category brand model status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: requests.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single asset request
// @route   GET /api/asset-requests/:id
// @access  Private
export const getAssetRequestById = async (req, res, next) => {
  try {
    const request = await AssetRequest.findById(req.params.id)
      .populate('requester', 'name email department')
      .populate('reviewedBy', 'name')
      .populate('fulfilledAsset', 'assetTag name category brand model status');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Asset request not found.',
        code: 'NOT_FOUND',
      });
    }

    // Role check: Employee can only see own request
    if (
      req.user.role === ROLES.EMPLOYEE &&
      request.requester._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only view your own asset requests.',
        code: 'FORBIDDEN',
      });
    }

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a new asset requisition
// @route   POST /api/asset-requests
// @access  Private
export const createAssetRequest = async (req, res, next) => {
  try {
    const { category, reason, description, priority } = req.body;

    const request = await AssetRequest.create({
      requester: req.user.id,
      category,
      reason: reason.trim(),
      description: description?.trim(),
      priority: priority || 'MEDIUM',
      status: REQUEST_STATUS.PENDING,
    });

    // Notify Asset Managers
    await notifyUsersByRole({
      role: ROLES.ASSET_MANAGER,
      type: NOTIFICATION_TYPES.REQUEST_SUBMITTED,
      title: 'New Hardware Request Submitted',
      message: `${req.user.name} requested a new ${category} (${priority || 'MEDIUM'} priority).`,
      relatedId: request._id,
      relatedType: 'AssetRequest',
    });

    const populated = await AssetRequest.findById(request._id).populate(
      'requester',
      'name email department'
    );

    res.status(201).json({
      success: true,
      message: 'Asset request submitted successfully.',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve asset request
// @route   POST /api/asset-requests/:id/approve
// @access  Private (Admin, Asset Manager)
export const approveAssetRequest = async (req, res, next) => {
  try {
    const request = await AssetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
        code: 'NOT_FOUND',
      });
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Only PENDING requests can be approved. Current status is ${request.status}.`,
        code: 'INVALID_REQUEST_STATE',
      });
    }

    request.status = REQUEST_STATUS.APPROVED;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    // Notify requester
    await sendNotification({
      recipient: request.requester,
      type: NOTIFICATION_TYPES.REQUEST_APPROVED,
      title: 'Hardware Request Approved',
      message: `Your request for a ${request.category} has been approved and queued for allocation.`,
      relatedId: request._id,
      relatedType: 'AssetRequest',
    });

    res.json({
      success: true,
      message: 'Request approved successfully.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject asset request with reason
// @route   POST /api/asset-requests/:id/reject
// @access  Private (Admin, Asset Manager)
export const rejectAssetRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required.',
        code: 'REJECTION_REASON_REQUIRED',
      });
    }

    const request = await AssetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
        code: 'NOT_FOUND',
      });
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Only PENDING requests can be rejected. Current status is ${request.status}.`,
        code: 'INVALID_REQUEST_STATE',
      });
    }

    request.status = REQUEST_STATUS.REJECTED;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason.trim();
    await request.save();

    // Notify requester
    await sendNotification({
      recipient: request.requester,
      type: NOTIFICATION_TYPES.REQUEST_REJECTED,
      title: 'Hardware Request Declined',
      message: `Your request for a ${request.category} was declined: "${rejectionReason.trim()}".`,
      relatedId: request._id,
      relatedType: 'AssetRequest',
    });

    res.json({
      success: true,
      message: 'Request rejected.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fulfill an approved asset request with an available asset
// @route   POST /api/asset-requests/:id/fulfill
// @access  Private (Admin, Asset Manager)
export const fulfillAssetRequest = async (req, res, next) => {
  try {
    const { assetId, expectedReturnDate, notes } = req.body;

    const request = await AssetRequest.findById(req.params.id).populate('requester');
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
        code: 'NOT_FOUND',
      });
    }

    if (request.status !== REQUEST_STATUS.APPROVED && request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Request cannot be fulfilled because its status is ${request.status}.`,
        code: 'INVALID_REQUEST_STATE',
      });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Selected asset not found.',
        code: 'NOT_FOUND',
      });
    }

    const check = canAssetBeAssigned(asset);
    if (!check.canAssign) {
      return res.status(400).json({
        success: false,
        message: check.reason,
        code: 'ASSET_NOT_ASSIGNABLE',
      });
    }

    // 1. Create Assignment
    const assignment = await Assignment.create({
      asset: asset._id,
      employee: request.requester._id,
      assignedBy: req.user.id,
      assignedAt: new Date(),
      expectedReturnDate: expectedReturnDate || null,
      notes: notes || `Fulfilled via request #${request._id}`,
      isActive: true,
    });

    // 2. Update Asset
    asset.status = ASSET_STATUS.ASSIGNED;
    asset.assignedTo = request.requester._id;
    await asset.save();

    // 3. Update Request
    request.status = REQUEST_STATUS.FULFILLED;
    request.fulfilledAsset = asset._id;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    await request.save();

    // 4. Log history
    await recordAssetHistory(
      asset._id,
      HISTORY_ACTIONS.ASSIGNED,
      req.user.id,
      {
        employee: request.requester.name,
        requestId: request._id,
      }
    );

    // 5. Notify Requester
    await sendNotification({
      recipient: request.requester._id,
      type: NOTIFICATION_TYPES.ASSET_ASSIGNED,
      title: 'Hardware Request Fulfilled',
      message: `Your request has been fulfilled. You have been assigned ${asset.name} (${asset.assetTag}).`,
      relatedId: asset._id,
      relatedType: 'Asset',
    });

    res.json({
      success: true,
      message: 'Request fulfilled and asset allocated successfully.',
      request,
      assignment,
      asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pending request (Requester only)
// @route   POST /api/asset-requests/:id/cancel
// @access  Private
export const cancelAssetRequest = async (req, res, next) => {
  try {
    const request = await AssetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
        code: 'NOT_FOUND',
      });
    }

    if (request.requester.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests.',
        code: 'FORBIDDEN',
      });
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Only PENDING requests can be cancelled. Current status is ${request.status}.`,
        code: 'CANNOT_CANCEL',
      });
    }

    request.status = REQUEST_STATUS.CANCELLED;
    await request.save();

    res.json({
      success: true,
      message: 'Request cancelled successfully.',
      request,
    });
  } catch (error) {
    next(error);
  }
};
