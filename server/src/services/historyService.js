import AssetHistory from '../models/AssetHistory.js';

/**
 * Record an immutable event in the asset's lifecycle history
 * @param {string|ObjectId} assetId - The target asset
 * @param {string} action - Event type from HISTORY_ACTIONS
 * @param {string|ObjectId} performedBy - User ID
 * @param {object} details - Additional contextual metadata
 * @param {ClientSession} [session] - Optional Mongoose transaction session
 */
export const recordAssetHistory = async (
  assetId,
  action,
  performedBy,
  details = {},
  session = null
) => {
  try {
    const historyData = {
      asset: assetId,
      action,
      performedBy,
      timestamp: new Date(),
      details,
    };

    if (session) {
      await AssetHistory.create([historyData], { session });
    } else {
      await AssetHistory.create(historyData);
    }
  } catch (error) {
    console.error(`[History Error] Failed to log history for asset ${assetId}:`, error);
  }
};
