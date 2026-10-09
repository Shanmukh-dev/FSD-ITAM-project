import Asset from '../models/Asset.js';
import AssetHistory from '../models/AssetHistory.js';
import Assignment from '../models/Assignment.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import { recordAssetHistory } from '../services/historyService.js';
import { calculateAssetDepreciation } from '../services/depreciationService.js';
import { validateAssetTransition } from '../services/assetService.js';
import { ROLES, ASSET_STATUS, HISTORY_ACTIONS, ASSET_TYPES } from '../utils/constants.js';

// @desc    Get all assets with comprehensive search, filters, and pagination
// @route   GET /api/assets
// @access  Private
export const getAssets = async (req, res, next) => {
  try {
    const {
      search,
      category,
      assetType,
      status,
      department,
      location,
      assignedTo,
      warranty,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Role-based visibility check: Employees only see their own assigned assets
    if (req.user.role === ROLES.EMPLOYEE) {
      query.$or = [
        { assignedTo: req.user._id },
        { 'digitalDetails.allocatedUsers.user': req.user._id },
      ];
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { name: searchRegex },
        { assetTag: searchRegex },
        { serialNumber: searchRegex },
        { model: searchRegex },
        { brand: searchRegex },
        { 'digitalDetails.licenseKey': searchRegex },
        { 'digitalDetails.contractNumber': searchRegex },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    if (assetType) query.assetType = assetType;
    if (category) query.category = category;
    if (status) query.status = status;
    if (department) query.department = department;
    if (location) query.location = { $regex: location, $options: 'i' };

    if (warranty === 'active') {
      query.warrantyExpiry = { $gt: new Date() };
    } else if (warranty === 'expired') {
      query.warrantyExpiry = { $lte: new Date() };
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .populate('department', 'name')
      .populate('assignedTo', 'name email')
      .populate('digitalDetails.allocatedUsers.user', 'name email department')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Enrich with depreciation calculations
    const enrichedAssets = assets.map((asset) => {
      const depreciation = calculateAssetDepreciation(asset);
      return {
        ...asset.toObject(),
        depreciationAnalysis: depreciation,
      };
    });

    res.json({
      success: true,
      count: enrichedAssets.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      assets: enrichedAssets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single asset details with depreciation, active assignment, and history
// @route   GET /api/assets/:id
// @access  Private
export const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('department', 'name')
      .populate('assignedTo', 'name email role')
      .populate('digitalDetails.allocatedUsers.user', 'name email department role');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
        code: 'NOT_FOUND',
      });
    }

    // Role check: If employee, verify this asset belongs to them (direct or via digital seat)
    if (req.user.role === ROLES.EMPLOYEE) {
      const isDirectAssignee =
        asset.assignedTo && asset.assignedTo._id.toString() === req.user.id.toString();
      const isSeatAllocated = asset.digitalDetails?.allocatedUsers?.some(
        (u) =>
          u.user &&
          (u.user._id || u.user).toString() === req.user.id.toString()
      );

      if (!isDirectAssignee && !isSeatAllocated) {
        return res.status(403).json({
          success: false,
          message: 'You are only authorized to view assets assigned directly to you.',
          code: 'FORBIDDEN',
        });
      }
    }

    // Calculate depreciation
    const depreciationAnalysis = calculateAssetDepreciation(asset);

    // Get active assignment
    const activeAssignment = await Assignment.findOne({
      asset: asset._id,
      isActive: true,
    })
      .populate('employee', 'name email department')
      .populate('assignedBy', 'name');

    // Get recent maintenance tickets
    const recentMaintenance = await MaintenanceRequest.find({ asset: asset._id })
      .populate('reportedBy', 'name')
      .populate('assignedTechnician', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      asset: {
        ...asset.toObject(),
        depreciationAnalysis,
        activeAssignment,
        recentMaintenance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new physical or digital asset
// @route   POST /api/assets
// @access  Private (Admin, Asset Manager)
export const createAsset = async (req, res, next) => {
  try {
    const {
      assetTag,
      name,
      category,
      assetType = ASSET_TYPES.PHYSICAL,
      brand,
      model,
      serialNumber,
      vendor,
      purchaseDate,
      purchasePrice,
      warrantyExpiry,
      department,
      location,
      condition,
      digitalDetails,
      depreciation,
    } = req.body;

    const existingTag = await Asset.findOne({
      assetTag: assetTag.trim().toUpperCase(),
    });
    if (existingTag) {
      return res.status(409).json({
        success: false,
        message: `Asset tag '${assetTag.toUpperCase()}' is already in use.`,
        code: 'DUPLICATE_ASSET_TAG',
      });
    }

    if (serialNumber && serialNumber.trim()) {
      const existingSerial = await Asset.findOne({
        serialNumber: serialNumber.trim(),
      });
      if (existingSerial) {
        return res.status(409).json({
          success: false,
          message: `Serial number '${serialNumber.trim()}' is already registered to another asset.`,
          code: 'DUPLICATE_SERIAL_NUMBER',
        });
      }
    }

    const isDigital = assetType === ASSET_TYPES.DIGITAL;

    const assetData = {
      assetTag: assetTag.trim().toUpperCase(),
      name: name.trim(),
      category,
      assetType,
      brand: brand ? brand.trim() : (isDigital ? (vendor || 'Digital Provider') : ''),
      model: model ? model.trim() : (isDigital ? 'Software / License' : ''),
      serialNumber: serialNumber?.trim() || (isDigital ? undefined : ''),
      vendor: vendor?.trim(),
      purchaseDate,
      purchasePrice,
      warrantyExpiry: warrantyExpiry || null,
      department: department || null,
      location: location?.trim(),
      status: ASSET_STATUS.AVAILABLE,
      condition: condition || (isDigital ? 'NOT_APPLICABLE' : 'NEW'),
      assignedTo: null,
      depreciation: {
        usefulLifeYears: depreciation?.usefulLifeYears || (isDigital ? 1 : 3),
        method: depreciation?.method || (isDigital ? 'SUBSCRIPTION_AMORTIZATION' : 'STRAIGHT_LINE'),
      },
    };

    if (isDigital) {
      assetData.digitalDetails = {
        licenseKey: digitalDetails?.licenseKey?.trim() || '',
        licenseType: digitalDetails?.licenseType || 'SUBSCRIPTION',
        seatsTotal: Number(digitalDetails?.seatsTotal) || 1,
        seatsAllocated: 0,
        contractNumber: digitalDetails?.contractNumber?.trim() || '',
        contractType: digitalDetails?.contractType?.trim() || '',
        billingCycle: digitalDetails?.billingCycle || 'ANNUAL',
        validFrom: digitalDetails?.validFrom || null,
        validUntil: digitalDetails?.validUntil || null,
        autoRenew: Boolean(digitalDetails?.autoRenew),
        allocatedUsers: [],
      };
    }

    const asset = await Asset.create(assetData);

    // Record lifecycle history
    await recordAssetHistory(
      asset._id,
      HISTORY_ACTIONS.CREATED,
      req.user.id,
      {
        initialStatus: ASSET_STATUS.AVAILABLE,
        purchasePrice,
        vendor,
        assetType,
      }
    );

    const populated = await Asset.findById(asset._id)
      .populate('department', 'name');

    res.status(201).json({
      success: true,
      message: `${isDigital ? 'Digital' : 'Physical'} asset registered successfully.`,
      asset: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset details
// @route   PUT /api/assets/:id
// @access  Private (Admin, Asset Manager)
export const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
        code: 'NOT_FOUND',
      });
    }

    const {
      name,
      category,
      assetType,
      brand,
      model,
      serialNumber,
      vendor,
      purchaseDate,
      purchasePrice,
      warrantyExpiry,
      department,
      location,
      condition,
      digitalDetails,
      depreciation,
    } = req.body;

    if (name) asset.name = name.trim();
    if (category) asset.category = category;
    if (assetType) asset.assetType = assetType;
    if (brand !== undefined) asset.brand = brand.trim();
    if (model !== undefined) asset.model = model.trim();
    if (serialNumber !== undefined) asset.serialNumber = serialNumber?.trim() || undefined;
    if (vendor !== undefined) asset.vendor = vendor?.trim();
    if (purchaseDate) asset.purchaseDate = purchaseDate;
    if (purchasePrice !== undefined) asset.purchasePrice = purchasePrice;
    if (warrantyExpiry !== undefined) asset.warrantyExpiry = warrantyExpiry;
    if (department !== undefined) asset.department = department || null;
    if (location !== undefined) asset.location = location?.trim();
    if (condition) asset.condition = condition;
    if (depreciation?.usefulLifeYears) {
      asset.depreciation.usefulLifeYears = depreciation.usefulLifeYears;
    }
    if (depreciation?.method) {
      asset.depreciation.method = depreciation.method;
    }

    if (digitalDetails && asset.assetType === ASSET_TYPES.DIGITAL) {
      if (!asset.digitalDetails) {
        asset.digitalDetails = { allocatedUsers: [] };
      }
      if (digitalDetails.licenseKey !== undefined) asset.digitalDetails.licenseKey = digitalDetails.licenseKey.trim();
      if (digitalDetails.licenseType !== undefined) asset.digitalDetails.licenseType = digitalDetails.licenseType;
      if (digitalDetails.seatsTotal !== undefined) {
        const newTotal = Number(digitalDetails.seatsTotal);
        if (newTotal < (asset.digitalDetails.seatsAllocated || 0)) {
          return res.status(400).json({
            success: false,
            message: `Total seats cannot be less than currently allocated seats (${asset.digitalDetails.seatsAllocated}).`,
            code: 'INVALID_SEATS_TOTAL',
          });
        }
        asset.digitalDetails.seatsTotal = newTotal;
      }
      if (digitalDetails.contractNumber !== undefined) asset.digitalDetails.contractNumber = digitalDetails.contractNumber.trim();
      if (digitalDetails.contractType !== undefined) asset.digitalDetails.contractType = digitalDetails.contractType.trim();
      if (digitalDetails.billingCycle !== undefined) asset.digitalDetails.billingCycle = digitalDetails.billingCycle;
      if (digitalDetails.validFrom !== undefined) asset.digitalDetails.validFrom = digitalDetails.validFrom;
      if (digitalDetails.validUntil !== undefined) asset.digitalDetails.validUntil = digitalDetails.validUntil;
      if (digitalDetails.autoRenew !== undefined) asset.digitalDetails.autoRenew = Boolean(digitalDetails.autoRenew);
    }

    await asset.save();

    const updated = await Asset.findById(asset._id)
      .populate('department', 'name')
      .populate('assignedTo', 'name email')
      .populate('digitalDetails.allocatedUsers.user', 'name email department');

    res.json({
      success: true,
      message: 'Asset updated successfully.',
      asset: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transition asset status according to state machine rules
// @route   PATCH /api/assets/:id/status
// @access  Private (Admin, Asset Manager)
export const updateAssetStatus = async (req, res, next) => {
  try {
    const { status: targetStatus, reason } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
        code: 'NOT_FOUND',
      });
    }

    // Validate transition
    const transitionCheck = validateAssetTransition(asset.status, targetStatus);
    if (!transitionCheck.valid) {
      return res.status(400).json({
        success: false,
        message: transitionCheck.error,
        code: 'INVALID_STATUS_TRANSITION',
      });
    }

    // Business rule: Cannot retire or dispose if still assigned
    if (
      (targetStatus === ASSET_STATUS.RETIRED || targetStatus === ASSET_STATUS.DISPOSED) &&
      asset.assignedTo
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition asset to ${targetStatus} while it is currently assigned. Process the return first.`,
        code: 'ASSET_CURRENTLY_ASSIGNED',
      });
    }

    const previousStatus = asset.status;
    asset.status = targetStatus;

    if (targetStatus === ASSET_STATUS.RETIRED || targetStatus === ASSET_STATUS.DISPOSED) {
      asset.assignedTo = null;
    }

    await asset.save();

    // Map history action
    let action = HISTORY_ACTIONS.STATUS_CHANGED;
    if (targetStatus === ASSET_STATUS.RETIRED) action = HISTORY_ACTIONS.RETIRED;
    if (targetStatus === ASSET_STATUS.DISPOSED) action = HISTORY_ACTIONS.DISPOSED;

    await recordAssetHistory(asset._id, action, req.user.id, {
      fromStatus: previousStatus,
      toStatus: targetStatus,
      reason: reason || 'Manual status change by administrator',
    });

    res.json({
      success: true,
      message: `Asset status successfully transitioned from ${previousStatus} to ${targetStatus}.`,
      asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete immutable lifecycle audit history for an asset
// @route   GET /api/assets/:id/history
// @access  Private
export const getAssetHistory = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
        code: 'NOT_FOUND',
      });
    }

    const history = await AssetHistory.find({ asset: asset._id })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Allocate a license seat on a digital asset to a staff member
// @route   POST /api/assets/:id/allocate-seat
// @access  Private (Admin, Asset Manager)
export const allocateSeat = async (req, res, next) => {
  try {
    const { userId, notes } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
        code: 'NOT_FOUND',
      });
    }

    if (asset.assetType !== ASSET_TYPES.DIGITAL) {
      return res.status(400).json({
        success: false,
        message: 'Seat allocation is only supported for digital assets.',
        code: 'INVALID_ASSET_TYPE',
      });
    }

    const currentAllocated = asset.digitalDetails?.allocatedUsers || [];
    const seatsTotal = asset.digitalDetails?.seatsTotal || 1;

    if (currentAllocated.length >= seatsTotal) {
      return res.status(400).json({
        success: false,
        message: `All ${seatsTotal} seats for this license are already allocated. Increase total seats before adding more users.`,
        code: 'SEATS_EXHAUSTED',
      });
    }

    const alreadyAllocated = currentAllocated.some(
      (a) => a.user && a.user.toString() === userId.toString()
    );

    if (alreadyAllocated) {
      return res.status(400).json({
        success: false,
        message: 'This user already has a seat allocated for this digital asset.',
        code: 'ALREADY_ALLOCATED',
      });
    }

    if (!asset.digitalDetails) {
      asset.digitalDetails = { allocatedUsers: [] };
    }
    if (!asset.digitalDetails.allocatedUsers) {
      asset.digitalDetails.allocatedUsers = [];
    }

    asset.digitalDetails.allocatedUsers.push({
      user: userId,
      allocatedAt: new Date(),
      notes: notes ? notes.trim() : '',
    });
    asset.digitalDetails.seatsAllocated = asset.digitalDetails.allocatedUsers.length;

    await asset.save();

    await recordAssetHistory(asset._id, HISTORY_ACTIONS.SEAT_ALLOCATED, req.user.id, {
      allocatedToUserId: userId,
      notes,
      seatsAllocated: asset.digitalDetails.seatsAllocated,
      seatsTotal,
    });

    const populated = await Asset.findById(asset._id)
      .populate('department', 'name')
      .populate('digitalDetails.allocatedUsers.user', 'name email department');

    res.json({
      success: true,
      message: 'License seat allocated successfully.',
      asset: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke an allocated seat from a staff member
// @route   POST /api/assets/:id/revoke-seat
// @access  Private (Admin, Asset Manager)
export const revokeSeat = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found.',
        code: 'NOT_FOUND',
      });
    }

    if (asset.assetType !== ASSET_TYPES.DIGITAL) {
      return res.status(400).json({
        success: false,
        message: 'Seat revocation is only supported for digital assets.',
        code: 'INVALID_ASSET_TYPE',
      });
    }

    const initialCount = asset.digitalDetails?.allocatedUsers?.length || 0;
    asset.digitalDetails.allocatedUsers = (asset.digitalDetails?.allocatedUsers || []).filter(
      (a) => a.user && a.user.toString() !== userId.toString()
    );

    if (asset.digitalDetails.allocatedUsers.length === initialCount) {
      return res.status(404).json({
        success: false,
        message: 'User does not have an allocated seat on this asset.',
        code: 'SEAT_NOT_FOUND',
      });
    }

    asset.digitalDetails.seatsAllocated = asset.digitalDetails.allocatedUsers.length;

    await asset.save();

    await recordAssetHistory(asset._id, HISTORY_ACTIONS.SEAT_REVOKED, req.user.id, {
      revokedFromUserId: userId,
      seatsAllocated: asset.digitalDetails.seatsAllocated,
      seatsTotal: asset.digitalDetails?.seatsTotal || 1,
    });

    const populated = await Asset.findById(asset._id)
      .populate('department', 'name')
      .populate('digitalDetails.allocatedUsers.user', 'name email department');

    res.json({
      success: true,
      message: 'License seat revoked successfully.',
      asset: populated,
    });
  } catch (error) {
    next(error);
  }
};
