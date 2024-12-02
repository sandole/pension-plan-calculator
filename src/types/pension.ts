export interface PensionCalculationResult {
  monthlyBenefit: number;
  yearlyBenefit: number;
  replacementRatio: number;
  adjustmentFactor?: number;
}

export interface SavedCalculation {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  currentAge: number;
  retirementAge: number;
  currentSalary: number;
  yearsOfService: number;
  salaryGrowth: number;
  inflationRate: number;
  investmentReturn: number;
  monthlyBenefit: number;
  yearlyBenefit: number;
  replacementRatio: number;
  plans: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}