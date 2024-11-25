export interface PensionCalculationResult {
    monthlyBenefit: number;
    yearlyBenefit: number;
    replacementRatio: number;
    adjustmentFactor?: number;  // Optional for plans with early/late retirement adjustments
  }