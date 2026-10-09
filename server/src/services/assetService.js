import { VALID_ASSET_TRANSITIONS, ASSET_STATUS } from '../utils/constants.js';

/**
 * Validates whether an asset state transition is allowed
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateAssetTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  const allowedNextStates = VALID_ASSET_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStates.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid lifecycle transition from ${currentStatus} to ${newStatus}. Permitted next states: [${allowedNextStates.join(', ')}]`,
    };
  }

  return { valid: true };
};

/**
 * Checks if an asset can be assigned
 * @param {object} asset
 * @returns {{ canAssign: boolean, reason?: string }}
 */
export const canAssetBeAssigned = (asset) => {
  if (asset.status !== ASSET_STATUS.AVAILABLE) {
    return {
      canAssign: false,
      reason: `Asset cannot be assigned because its current status is ${asset.status}. Only AVAILABLE assets can be assigned.`,
    };
  }

  if (asset.assignedTo) {
    return {
      canAssign: false,
      reason: 'Asset already has an active assignee.',
    };
  }

  return { canAssign: true };
};
