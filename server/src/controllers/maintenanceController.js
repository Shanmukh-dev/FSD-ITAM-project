import MaintenanceRequest from '../models/MaintenanceRequest.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Asset from '../models/Asset.js';
import { recordAssetHistory } from '../services/historyService.js';
import { sendNotification, notifyUsersByRole } from '../services/notificationService.js';
import {
  MAINTENANCE_STATUS,
  ASSET_STATUS,
  HISTORY_ACTIONS,
  NOTIFICATION_TYPES,
  ROLES,
} from '../utils/constants.js';

// @desc    Get all maintenance requests with filters
// @route   GET /api/maintenance
// @access  Private
export const getMaintenanceRequests = async (req, res, next) => {
  try {
    const { status, urgency, asset, technician, page = 1, limit = 20 } = req.query;

    const query = {};

    if (req.user.role === ROLES.EMPLOYEE) {
      query.reportedBy = req.user.id;
    } else if (req.user.role === ROLES.TECHNICIAN && technician === 'me') {
      query.assignedTechnician = req.user.id;
    } else if (technician) {
      query.assignedTechnician = technician;
    }

    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (asset) query.asset = asset;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await MaintenanceRequest.countDocuments(query);
    const requests = await MaintenanceRequest.find(query)
      .populate('asset', 'assetTag name category brand model status condition assignedTo')
      .populate('reportedBy', 'name email department')
      .populate('assignedTechnician', 'name email')
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

// @desc    Get single maintenance request with record
// @route   GET /api/maintenance/:id
// @access  Private
export const getMaintenanceById = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('asset')
      .populate('reportedBy', 'name email department')
      .populate('assignedTechnician', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found.',
        code: 'NOT_FOUND',
      });
    }

    const record = await MaintenanceRecord.findOne({
      maintenanceRequest: request._id,
    }).populate('technician', 'name email');

    res.json({
      success: true,
      request,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report an asset defect or maintenance need
// @route   POST /api/maintenance
// @access  Private
export const createMaintenanceRequest = async (req, res, next) => {
  try {
    const { asset: assetId, issueType, description, urgency } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
        code: 'NOT_FOUND',
      });
    }

    // Role check: If employee, verify asset belongs to them
    if (
      req.user.role === ROLES.EMPLOYEE &&
      (!asset.assignedTo || asset.assignedTo.toString() !== req.user.id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only report problems for hardware currently assigned to you.',
        code: 'FORBIDDEN',
      });
    }

    const maintenanceRequest = await MaintenanceRequest.create({
      asset: asset._id,
      reportedBy: req.user.id,
      issueType,
      description: description.trim(),
      urgency: urgency || 'MEDIUM',
      status: MAINTENANCE_STATUS.REPORTED,
    });

    // Update asset status to MAINTENANCE
    const previousStatus = asset.status;
    asset.status = ASSET_STATUS.MAINTENANCE;
    await asset.save();

    // Log history
    await recordAssetHistory(
      asset._id,
      HISTORY_ACTIONS.MAINTENANCE_STARTED,
      req.user.id,
      {
        ticketId: maintenanceRequest._id,
        issueType,
        urgency,
        description,
        previousStatus,
      }
    );

    // Notify Technicians and Asset Managers
    await notifyUsersByRole({
      role: ROLES.TECHNICIAN,
      type: NOTIFICATION_TYPES.MAINTENANCE_REPORTED,
      title: 'New Hardware Maintenance Ticket',
      message: `${asset.name} (${asset.assetTag}) reported for ${issueType} repair [${urgency || 'MEDIUM'}].`,
      relatedId: maintenanceRequest._id,
      relatedType: 'MaintenanceRequest',
    });

    const populated = await MaintenanceRequest.findById(maintenanceRequest._id)
      .populate('asset', 'assetTag name category brand model status')
      .populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Maintenance ticket created. Asset placed under maintenance mode.',
      maintenanceRequest: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign technician to maintenance task
// @route   PATCH /api/maintenance/:id/assign
// @access  Private (Admin, Asset Manager)
export const assignTechnician = async (req, res, next) => {
  try {
    const { technicianId } = req.body;

    const [request, asset] = await Promise.all([
      MaintenanceRequest.findById(req.params.id),
      Asset.findOne({ _id: (await MaintenanceRequest.findById(req.params.id))?.asset }),
    ]);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found.',
        code: 'NOT_FOUND',
      });
    }

    request.assignedTechnician = technicianId;
    request.status = MAINTENANCE_STATUS.ASSIGNED;
    await request.save();

    // Notify technician
    await sendNotification({
      recipient: technicianId,
      type: NOTIFICATION_TYPES.MAINTENANCE_ASSIGNED,
      title: 'Maintenance Ticket Assigned to You',
      message: `You have been assigned to diagnose and repair ${asset?.name || 'hardware'}.`,
      relatedId: request._id,
      relatedType: 'MaintenanceRequest',
    });

    const populated = await MaintenanceRequest.findById(request._id)
      .populate('asset')
      .populate('assignedTechnician', 'name email');

    res.json({
      success: true,
      message: 'Technician assigned successfully.',
      maintenanceRequest: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start maintenance diagnostic work
// @route   POST /api/maintenance/:id/start
// @access  Private (Technician, Admin)
export const startMaintenance = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found.',
        code: 'NOT_FOUND',
      });
    }

    // Assign to self if not already assigned
    if (!request.assignedTechnician) {
      request.assignedTechnician = req.user.id;
    }

    request.status = MAINTENANCE_STATUS.IN_PROGRESS;
    request.startedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: 'Maintenance diagnostic work commenced.',
      maintenanceRequest: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete maintenance, record work details, and restore asset operational state
// @route   POST /api/maintenance/:id/complete
// @access  Private (Technician, Admin)
export const completeMaintenance = async (req, res, next) => {
  try {
    const { diagnosis, actionTaken, partsReplaced = [], cost = 0, notes } = req.body;

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found.',
        code: 'NOT_FOUND',
      });
    }

    const asset = await Asset.findById(request.asset);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Linked asset not found.',
        code: 'NOT_FOUND',
      });
    }

    // 1. Create MaintenanceRecord
    const record = await MaintenanceRecord.create({
      maintenanceRequest: request._id,
      asset: asset._id,
      technician: req.user.id,
      diagnosis: diagnosis.trim(),
      actionTaken: actionTaken.trim(),
      partsReplaced,
      cost: Number(cost) || 0,
      notes: notes?.trim(),
      startedAt: request.startedAt || new Date(),
      completedAt: new Date(),
    });

    // 2. Update MaintenanceRequest
    request.status = MAINTENANCE_STATUS.COMPLETED;
    request.completedAt = new Date();
    if (!request.assignedTechnician) request.assignedTechnician = req.user.id;
    await request.save();

    // 3. Restore Asset Status:
    // If the asset has an active owner assignedTo, it returns to ASSIGNED
    // Otherwise it returns to AVAILABLE
    if (asset.assignedTo) {
      asset.status = ASSET_STATUS.ASSIGNED;
    } else {
      asset.status = ASSET_STATUS.AVAILABLE;
    }
    asset.condition = 'GOOD';
    await asset.save();

    // 4. Log lifecycle history
    await recordAssetHistory(
      asset._id,
      HISTORY_ACTIONS.MAINTENANCE_COMPLETED,
      req.user.id,
      {
        ticketId: request._id,
        diagnosis,
        actionTaken,
        cost,
        restoredStatus: asset.status,
      }
    );

    // 5. Notify reporter
    await sendNotification({
      recipient: request.reportedBy,
      type: NOTIFICATION_TYPES.MAINTENANCE_COMPLETED,
      title: 'Maintenance Completed',
      message: `Repairs on ${asset.name} (${asset.assetTag}) have been completed. The unit is now operational.`,
      relatedId: asset._id,
      relatedType: 'Asset',
    });

    res.json({
      success: true,
      message: `Maintenance completed. Asset returned to ${asset.status} state.`,
      request,
      record,
      asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel maintenance request
// @route   POST /api/maintenance/:id/cancel
// @access  Private (Admin, Asset Manager)
export const cancelMaintenance = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found.',
        code: 'NOT_FOUND',
      });
    }

    request.status = MAINTENANCE_STATUS.CANCELLED;
    await request.save();

    // Restore asset
    const asset = await Asset.findById(request.asset);
    if (asset && asset.status === ASSET_STATUS.MAINTENANCE) {
      asset.status = asset.assignedTo ? ASSET_STATUS.ASSIGNED : ASSET_STATUS.AVAILABLE;
      await asset.save();
    }

    res.json({
      success: true,
      message: 'Maintenance request cancelled.',
      request,
    });
  } catch (error) {
    next(error);
  }
};
