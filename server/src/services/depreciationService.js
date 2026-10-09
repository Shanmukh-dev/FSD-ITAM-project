/**
 * Calculate straight-line depreciation or subscription amortization for an IT asset
 * @param {object} asset - Mongoose asset document or plain object
 * @returns {object} Depreciation / Amortization financial analysis
 */
export const calculateAssetDepreciation = (asset) => {
  const purchasePrice = Number(asset.purchasePrice) || 0;
  const now = new Date();

  // If digital asset with explicit contract/subscription term dates
  if (
    asset.assetType === 'DIGITAL' &&
    asset.digitalDetails?.validFrom &&
    asset.digitalDetails?.validUntil
  ) {
    const validFrom = new Date(asset.digitalDetails.validFrom);
    const validUntil = new Date(asset.digitalDetails.validUntil);
    const totalDurationMs = Math.max(1, validUntil - validFrom);
    const elapsedMs = Math.max(0, now - validFrom);
    const ratio = Math.min(1, elapsedMs / totalDurationMs);
    const accumulatedDepreciation = purchasePrice * ratio;
    const currentBookValue = Math.max(0, purchasePrice - accumulatedDepreciation);
    const depreciationPercentage = purchasePrice > 0 ? ratio * 100 : 0;
    const termYears = totalDurationMs / (1000 * 60 * 60 * 24 * 365.25);
    const daysRemaining = Math.max(
      0,
      Math.round((validUntil - now) / (1000 * 60 * 60 * 24))
    );

    return {
      purchasePrice: Math.round(purchasePrice * 100) / 100,
      usefulLifeYears: Math.round(termYears * 10) / 10 || 1,
      annualDepreciation:
        termYears > 0 ? Math.round((purchasePrice / termYears) * 100) / 100 : purchasePrice,
      accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
      currentBookValue: Math.round(currentBookValue * 100) / 100,
      depreciationPercentage: Math.round(depreciationPercentage * 10) / 10,
      yearsElapsed: Math.round((elapsedMs / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10,
      isFullyDepreciated: now >= validUntil,
      daysRemaining,
      method: 'SUBSCRIPTION_AMORTIZATION',
    };
  }

  // Standard Straight-Line Depreciation for Physical Hardware & Perpetual Licenses
  const purchaseDate = new Date(asset.purchaseDate);
  const usefulLifeYears = Number(asset.depreciation?.usefulLifeYears) || 1;

  // Milliseconds difference
  const diffTime = Math.max(0, now - purchaseDate);
  // Fractional years passed
  const yearsElapsed = diffTime / (1000 * 60 * 60 * 24 * 365.25);

  const annualDepreciation = purchasePrice / usefulLifeYears;
  const effectiveYears = Math.min(yearsElapsed, usefulLifeYears);
  const accumulatedDepreciation = annualDepreciation * effectiveYears;
  const currentBookValue = Math.max(0, purchasePrice - accumulatedDepreciation);
  const depreciationPercentage =
    purchasePrice > 0 ? (accumulatedDepreciation / purchasePrice) * 100 : 0;

  return {
    purchasePrice: Math.round(purchasePrice * 100) / 100,
    usefulLifeYears,
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
    currentBookValue: Math.round(currentBookValue * 100) / 100,
    depreciationPercentage: Math.round(depreciationPercentage * 10) / 10,
    yearsElapsed: Math.round(yearsElapsed * 10) / 10,
    isFullyDepreciated: yearsElapsed >= usefulLifeYears,
    method:
      asset.assetType === 'DIGITAL'
        ? asset.depreciation?.method || 'SOFTWARE_AMORTIZATION'
        : asset.depreciation?.method || 'STRAIGHT_LINE',
  };
};
