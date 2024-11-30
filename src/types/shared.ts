import type { PensionPlan } from "@prisma/client";

export interface BaseUserInputs {
  currentAge: string;
  retirementAge: string;
  currentSalary: string;
  yearsOfService: string;
}

export interface ProjectionUserInputs extends BaseUserInputs {
  annualReturn: string;
  salaryGrowth: string;
}

export interface TimelineDataPoint {
  age: number;
  [planName: string]: number;
}

export interface SharedComponentProps {
  plans: PensionPlan[];
  selectedPlans: string[];
  onPlanSelect: (planIds: string[]) => void;
}