import Asset from '../models/Asset.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Assignment from '../models/Assignment.js';
import AssetRequest from '../models/AssetRequest.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import AssetHistory from '../models/AssetHistory.js';
import { calculateAssetDepreciation } from '../services/depreciationService.js';
import { ASSET_STATUS, REQUEST_STATUS, MAINTENANCE_STATUS } from '../utils/constants.js';

// @desc    Admin organizational control center metrics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalAssets,
      totalUsers,
      totalDepartments,
      assetsByStatusAgg,
      departments,
      recentActivity,
      assetsInMaintenance,
      pendingRequests,
      overdueReturns,
    ] = await Promise.all([
      Asset.countDocuments(),
      User.countDocuments({ isActive: true }),
      Department.countDocuments(),
      Asset.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Department.find().select('name'),
      AssetHistory.find()
        .populate('asset', 'assetTag name')
        .populate('performedBy', 'name role')
        .sort({ timestamp: -1 })
        .limit(10),
      Asset.countDocuments({ status: ASSET_STATUS.MAINTENANCE }),
      AssetRequest.countDocuments({ status: REQUEST_STATUS.PENDING }),
      Assignment.countDocuments({
        isActive: true,
        expectedReturnDate: { $lt: new Date() },
      }),
    ]);

    // Format assetsByStatus map
    const assetsByStatus = {
      AVAILABLE: 0,
      ASSIGNED: 0,
      MAINTENANCE: 0,
      RETIRED: 0,
      DISPOSED: 0,
    };
    assetsByStatusAgg.forEach((item) => {
      if (item._id) assetsByStatus[item._id] = item.count;
    });

    // Real department breakdown
    const assetsByDepartment = await Promise.all(
      departments.map(async (dept) => {
        const count = await Asset.countDocuments({ department: dept._id });
        const staffCount = await User.countDocuments({ department: dept._id });
        return {
          id: dept._id,
          name: dept.name,
          count,
          staffCount,
        };
      })
    );

    res.json({
      success: true,
      stats: {
        totalAssets,
        totalUsers,
        totalDepartments,
        assetsByStatus,
        assetsByDepartment,
        recentActivity,
        alerts: {
          assetsInMaintenance,
          pendingRequests,
          overdueReturns,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Asset Manager operational fleet hub metrics
// @route   GET /api/dashboard/asset-manager
// @access  Private (Asset Manager, Admin)
export const getAssetManagerDashboard = async (req, res, next) => {
  try {
    const [
      totalAssets,
      availableAssets,
      assignedAssets,
      maintenanceAssets,
      pendingRequests,
      pendingReturns,
      maintenanceRequiringAttention,
      allAssets,
      recentActivity,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: ASSET_STATUS.AVAILABLE }),
      Asset.countDocuments({ status: ASSET_STATUS.ASSIGNED }),
      Asset.countDocuments({ status: ASSET_STATUS.MAINTENANCE }),
      AssetRequest.countDocuments({ status: REQUEST_STATUS.PENDING }),
      Assignment.countDocuments({
        isActive: true,
        expectedReturnDate: { $lt: new Date() },
      }),
      MaintenanceRequest.countDocuments({ status: MAINTENANCE_STATUS.REPORTED }),
      Asset.find().select('purchasePrice purchaseDate depreciation status'),
      AssetHistory.find()
        .populate('asset', 'assetTag name')
        .populate('performedBy', 'name role')
        .sort({ timestamp: -1 })
        .limit(10),
    ]);

    // Compute total book value from real assets
    let totalPurchaseValue = 0;
    let totalCurrentBookValue = 0;

    allAssets.forEach((asset) => {
      const dep = calculateAssetDepreciation(asset);
      totalPurchaseValue += dep.purchasePrice;
      totalCurrentBookValue += dep.currentBookValue;
    });

    res.json({
      success: true,
      stats: {
        totalAssets,
        availableAssets,
        assignedAssets,
        maintenanceAssets,
        pendingRequests,
        pendingReturns,
        maintenanceRequiringAttention,
        financials: {
          totalPurchaseValue: Math.round(totalPurchaseValue),
          totalCurrentBookValue: Math.round(totalCurrentBookValue),
          totalDepreciation: Math.round(totalPurchaseValue - totalCurrentBookValue),
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Technician maintenance workbench metrics & work queue
// @route   GET /api/dashboard/technician
// @access  Private (Technician, Admin)
export const getTechnicianDashboard = async (req, res, next) => {
  try {
    const techId = req.user.id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      pendingTriage,
      assignedToMe,
      inProgress,
      completedMonth,
      highPriority,
      myWorkQueue,
    ] = await Promise.all([
      MaintenanceRequest.countDocuments({ status: MAINTENANCE_STATUS.REPORTED }),
      MaintenanceRequest.countDocuments({
        assignedTechnician: techId,
        status: MAINTENANCE_STATUS.ASSIGNED,
      }),
      MaintenanceRequest.countDocuments({
        assignedTechnician: techId,
        status: MAINTENANCE_STATUS.IN_PROGRESS,
      }),
      MaintenanceRequest.countDocuments({
        assignedTechnician: techId,
        status: MAINTENANCE_STATUS.COMPLETED,
        completedAt: { $gte: startOfMonth },
      }),
      MaintenanceRequest.countDocuments({
        urgency: { $in: ['HIGH', 'CRITICAL'] },
        status: { $ne: MAINTENANCE_STATUS.COMPLETED },
      }),
      MaintenanceRequest.find({
        $or: [
          { assignedTechnician: techId, status: { $in: [MAINTENANCE_STATUS.ASSIGNED, MAINTENANCE_STATUS.IN_PROGRESS] } },
          { status: MAINTENANCE_STATUS.REPORTED },
        ],
      })
        .populate('asset', 'assetTag name category brand model location')
        .populate('reportedBy', 'name email')
        .sort({ urgency: -1, createdAt: 1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      stats: {
        pendingTriage,
        assignedToMe,
        inProgress,
        completedThisMonth: completedMonth,
        highPriorityIssues: highPriority,
        myTasks: myWorkQueue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee self-service equipment portal metrics
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [myAssets, myRequests, myMaintenance] = await Promise.all([
      Asset.find({ assignedTo: userId })
        .populate('department', 'name')
        .select('assetTag name category brand model serialNumber status condition warrantyExpiry location'),
      AssetRequest.find({ requester: userId })
        .populate('fulfilledAsset', 'assetTag name')
        .sort({ createdAt: -1 })
        .limit(5),
      MaintenanceRequest.find({ reportedBy: userId })
        .populate('asset', 'assetTag name')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const pendingRequestsCount = myRequests.filter(
      (r) => r.status === REQUEST_STATUS.PENDING
    ).length;

    res.json({
      success: true,
      stats: {
        myAssetsCount: myAssets.length,
        myAssets,
        pendingRequestsCount,
        myRequests,
        myMaintenance,
        quickActions: ['REQUEST_ASSET', 'REPORT_PROBLEM', 'VIEW_MY_ASSETS'],
      },
    });
  } catch (error) {
    next(error);
  }
};
