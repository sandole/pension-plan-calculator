interface CPPCalculationParams {
  birthDate: Date;
  startContributingDate: Date;
  retirementDate: Date;
  yearlyEarnings: number[];  // Array of yearly pensionable earnings
  averageIndustrialWage?: number;  // YMPE (Year's Maximum Pensionable Earnings)
}

  interface CPPBenefitResult {
    monthlyBenefit: number;
    yearlyBenefit: number;
    adjustmentFactor: number;  // Early/late retirement adjustment
    contributionYears: number;
    dropoutYears: number;
    averageEarnings: number;
  }
  
  export class CPPCalculator {
    private static readonly MAX_CONTRIBUTORY_PERIOD = 39; // Maximum years of contribution
    private static readonly DROPOUT_PERCENTAGE = 0.17; // 17% dropout provision
    private static readonly REPLACEMENT_RATE = 0.25; // 25% of average earnings
    private static readonly YMPE_2024 = 68500; // 2024 YMPE value
    
    public static calculateBenefit(params: CPPCalculationParams): CPPBenefitResult {
      const {
        birthDate,
        startContributingDate,
        retirementDate,
        yearlyEarnings,
        averageIndustrialWage = this.YMPE_2024
      } = params;
  
      // Calculate contributory period
      const contributionYears = this.calculateContributoryYears(
        startContributingDate,
        retirementDate
      );
  
      // Calculate dropout years
      const dropoutYears = Math.floor(contributionYears * this.DROPOUT_PERCENTAGE);
  
      // Calculate average earnings with dropout provision
      const averageEarnings = this.calculateAverageEarnings(
        yearlyEarnings,
        dropoutYears,
        averageIndustrialWage
      );
  
      // Calculate adjustment factor for early/late retirement
      const adjustmentFactor = this.calculateAdjustmentFactor(
        birthDate,
        retirementDate
      );
  
      // Calculate base benefit
      const baseBenefit = averageEarnings * this.REPLACEMENT_RATE;
  
      // Apply adjustment factor
      const adjustedBenefit = baseBenefit * adjustmentFactor;
  
      return {
        monthlyBenefit: adjustedBenefit / 12,
        yearlyBenefit: adjustedBenefit,
        adjustmentFactor,
        contributionYears,
        dropoutYears,
        averageEarnings
      };
    }
  
    private static calculateContributoryYears(
      startDate: Date,
      endDate: Date
    ): number {
      const years = endDate.getFullYear() - startDate.getFullYear();
      return Math.min(years, this.MAX_CONTRIBUTORY_PERIOD);
    }
  
    private static calculateAverageEarnings(
      yearlyEarnings: number[],
      dropoutYears: number,
      ympe: number
    ): number {
      // Cap earnings at YMPE for each year
      const cappedEarnings = yearlyEarnings.map(earning => Math.min(earning, ympe));
      
      // Sort earnings to drop out lowest earning years
      const sortedEarnings = [...cappedEarnings].sort((a, b) => b - a);
      
      // Take highest earning years after dropout
      const consideredEarnings = sortedEarnings.slice(0, sortedEarnings.length - dropoutYears);
      
      // Calculate average
      return consideredEarnings.reduce((sum, earning) => sum + earning, 0) / consideredEarnings.length;
    }
  
    private static calculateAdjustmentFactor(
      birthDate: Date,
      retirementDate: Date
    ): number {
      const normalRetirementAge = 65;
      const retirementAge = this.calculateAge(birthDate, retirementDate);
      
      if (retirementAge === normalRetirementAge) return 1;
      
      // Early retirement reduction (0.6% per month before 65)
      if (retirementAge < normalRetirementAge) {
        const monthsEarly = (normalRetirementAge - retirementAge) * 12;
        return 1 - (0.006 * monthsEarly);
      }
      
      // Delayed retirement increase (0.7% per month after 65)
      const monthsLate = (retirementAge - normalRetirementAge) * 12;
      return 1 + (0.007 * monthsLate);
    }
  
    private static calculateAge(birthDate: Date, referenceDate: Date): number {
      let age = referenceDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }
  }