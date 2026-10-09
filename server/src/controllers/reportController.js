import Asset from '../models/Asset.js';
import Department from '../models/Department.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import { calculateAssetDepreciation } from '../services/depreciationService.js';
import { ASSET_STATUS } from '../utils/constants.js';

// @desc    Asset Status breakdown report
// @route   GET /api/reports/asset-status
// @access  Private (Admin, Asset Manager)
export const getAssetStatusReport = async (req, res, next) => {
  try {
    const statusCounts = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = {
      AVAILABLE: 0,
      ASSIGNED: 0,
      MAINTENANCE: 0,
      RETIRED: 0,
      DISPOSED: 0,
    };

    statusCounts.forEach((s) => {
      if (s._id) result[s._id] = s.count;
    });

    const categoryBreakdown = await Asset.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      report: {
        statusBreakdown: result,
        categoryBreakdown: categoryBreakdown.map((c) => ({
          category: c._id,
          count: c.count,
        })),
        totalAssets: Object.values(result).reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Department hardware allocation distribution report
// @route   GET /api/reports/department
// @access  Private (Admin, Asset Manager)
export const getDepartmentReport = async (req, res, next) => {
  try {
    const departments = await Department.find();

    const data = await Promise.all(
      departments.map(async (dept) => {
        const assets = await Asset.find({ department: dept._id }).select('status purchasePrice');
        const count = assets.length;
        const totalValue = assets.reduce((acc, a) => acc + (a.purchasePrice || 0), 0);

        return {
          id: dept._id,
          departmentName: dept.name,
          assetCount: count,
          totalInvestment: totalValue,
        };
      })
    );

    // Assets without a department assigned
    const unassignedCount = await Asset.countDocuments({ department: null });

    res.json({
      success: true,
      report: {
        departments: data,
        unassignedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Financial valuation and depreciation report
// @route   GET /api/reports/asset-value
// @access  Private (Admin, Asset Manager)
export const getAssetValueReport = async (req, res, next) => {
  try {
    const assets = await Asset.find().populate('department', 'name');

    let totalPurchaseValue = 0;
    let totalCurrentBookValue = 0;
    let totalDepreciation = 0;

    const categorized = {};

    assets.forEach((asset) => {
      const dep = calculateAssetDepreciation(asset);
      totalPurchaseValue += dep.purchasePrice;
      totalCurrentBookValue += dep.currentBookValue;
      totalDepreciation += dep.accumulatedDepreciation;

      const cat = asset.category || 'OTHER';
      if (!categorized[cat]) {
        categorized[cat] = {
          category: cat,
          count: 0,
          purchaseValue: 0,
          currentValue: 0,
        };
      }
      categorized[cat].count += 1;
      categorized[cat].purchaseValue += dep.purchasePrice;
      categorized[cat].currentValue += dep.currentBookValue;
    });

    res.json({
      success: true,
      report: {
        totalPurchaseValue: Math.round(totalPurchaseValue),
        totalCurrentBookValue: Math.round(totalCurrentBookValue),
        totalDepreciation: Math.round(totalDepreciation),
        categoryValuations: Object.values(categorized),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Maintenance and repair cost analytics report
// @route   GET /api/reports/maintenance
// @access  Private (Admin, Asset Manager)
export const getMaintenanceReport = async (req, res, next) => {
  try {
    const [totalTickets, completedRecords, currentlyInMaintenance] = await Promise.all([
      MaintenanceRequest.countDocuments(),
      MaintenanceRecord.find().populate('asset', 'assetTag name category brand model'),
      Asset.find({ status: ASSET_STATUS.MAINTENANCE })
        .populate('assignedTo', 'name')
        .populate('department', 'name'),
    ]);

    let totalRepairCosts = 0;
    const assetRepairMap = {};

    completedRecords.forEach((rec) => {
      totalRepairCosts += rec.cost || 0;
      if (rec.asset) {
        const id = rec.asset._id.toString();
        if (!assetRepairMap[id]) {
          assetRepairMap[id] = {
            asset: rec.asset,
            repairCount: 0,
            totalCost: 0,
          };
        }
        assetRepairMap[id].repairCount += 1;
        assetRepairMap[id].totalCost += rec.cost || 0;
      }
    });

    const frequentRepairs = Object.values(assetRepairMap)
      .sort((a, b) => b.repairCount - a.repairCount)
      .slice(0, 10);

    res.json({
      success: true,
      report: {
        totalTickets,
        totalCompletedRepairs: completedRecords.length,
        totalRepairCosts: Math.round(totalRepairCosts),
        currentlyInMaintenance,
        frequentRepairs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lifecycle history report (acquisitions, retirements, disposals)
// @route   GET /api/reports/lifecycle
// @access  Private (Admin, Asset Manager)
export const getLifecycleReport = async (req, res, next) => {
  try {
    const [retiredAssets, disposedAssets, recentlyPurchased] = await Promise.all([
      Asset.find({ status: ASSET_STATUS.RETIRED })
        .populate('department', 'name')
        .sort({ updatedAt: -1 }),
      Asset.find({ status: ASSET_STATUS.DISPOSED })
        .populate('department', 'name')
        .sort({ updatedAt: -1 }),
      Asset.find()
        .populate('department', 'name')
        .sort({ purchaseDate: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      report: {
        retiredCount: retiredAssets.length,
        disposedCount: disposedAssets.length,
        retiredAssets,
        disposedAssets,
        recentlyPurchased,
      },
    });
  } catch (error) {
    next(error);
  }
};
