import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import type { SavedCalculation, PensionCalculationResult } from "~/types/pension";

export interface TimelineDataPoint {
  age: number;
  [planName: string]: number;
}

export const pensionRouter = createTRPCRouter({
  // Public Queries
  getPlans: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.pensionPlan.findMany();
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pension plans",
        cause: error
      });
    }
  }),

  getPlan: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const plan = await ctx.db.pensionPlan.findUnique({
          where: { id: input.id },
        });
        
        if (!plan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pension plan not found"
          });
        }
        
        return plan;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch pension plan",
          cause: error
        });
      }
    }),

  // Protected Mutations
  calculateBenefits: protectedProcedure
    .input(z.object({
      currentAge: z.number(),
      retirementAge: z.number(),
      currentSalary: z.number(),
      yearsOfService: z.number(),
      planIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }): Promise<Record<string, PensionCalculationResult>> => {
      try {
        const results: Record<string, PensionCalculationResult> = {};
        
        const plans = await ctx.db.pensionPlan.findMany({
          where: {
            id: {
              in: input.planIds
            }
          }
        });

        for (const plan of plans) {
          let monthlyBenefit = 0;
          let yearlyBenefit = 0;
          let replacementRatio = 0;

          switch (plan.type) {
            case 'DEFINED_BENEFIT':
              if (plan.accrualRate) {
                yearlyBenefit = input.currentSalary * plan.accrualRate * input.yearsOfService;
                monthlyBenefit = yearlyBenefit / 12;
                replacementRatio = (yearlyBenefit / input.currentSalary) * 100;
              }
              break;

            case 'DEFINED_CONTRIBUTION':
              if (plan.employerMatch) {
                const annualContribution = input.currentSalary * (plan.employerMatch * 2);
                const years = input.retirementAge - input.currentAge;
                const totalAccumulation = annualContribution * Math.pow(1.05, years);
                yearlyBenefit = totalAccumulation * 0.04;
                monthlyBenefit = yearlyBenefit / 12;
                replacementRatio = (yearlyBenefit / input.currentSalary) * 100;
              }
              break;

            case 'CPP':
              const maxCPP = 1306.57;
              const adjustmentFactor = input.retirementAge >= 65 ? 1 : 0.7;
              monthlyBenefit = maxCPP * adjustmentFactor;
              yearlyBenefit = monthlyBenefit * 12;
              replacementRatio = (yearlyBenefit / input.currentSalary) * 100;
              break;

            default:
              yearlyBenefit = input.currentSalary * 0.02 * input.yearsOfService;
              monthlyBenefit = yearlyBenefit / 12;
              replacementRatio = (yearlyBenefit / input.currentSalary) * 100;
          }

          results[plan.id] = {
            monthlyBenefit,
            yearlyBenefit,
            replacementRatio
          };

          // Save calculation to database
          await ctx.db.savedCalculation.create({
            data: {
              userId: ctx.session.user.id,
              name: `Calculation for ${plan.name}`,
              currentAge: input.currentAge,
              retirementAge: input.retirementAge,
              currentSalary: input.currentSalary,
              yearsOfService: input.yearsOfService,
              monthlyBenefit,
              yearlyBenefit,
              replacementRatio,
              plans: {
                connect: [{ id: plan.id }]
              }
            }
          });
        }

        return results;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate benefits",
          cause: error
        });
      }
    }),

  calculateDetailedBenefits: protectedProcedure
    .input(z.object({
      currentAge: z.number(),
      retirementAge: z.number(),
      currentSalary: z.number(),
      yearsOfService: z.number(),
      planId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const plan = await ctx.db.pensionPlan.findUnique({
          where: { id: input.planId },
        });
    
        if (!plan) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Plan not found"
          });
        }
    
        let monthlyBenefit = 0;
        let yearlyBenefit = 0;
        let totalContributions = 0;
        let replacementRatio = 0;
        let bridgeBenefit;
        let earlyRetirementPenalty;
    
        const yearsUntilRetirement = input.retirementAge - input.currentAge;
        const contributionRate = plan.type === 'DEFINED_BENEFIT' ? 0.10 : 0.05;
        totalContributions = input.currentSalary * contributionRate * (input.yearsOfService + yearsUntilRetirement);
    
        switch (plan.type) {
          case 'DEFINED_BENEFIT':
            if (plan.accrualRate) {
              yearlyBenefit = input.currentSalary * plan.accrualRate * input.yearsOfService;
              
              if (plan.bridgeBenefit && input.retirementAge < 65) {
                bridgeBenefit = yearlyBenefit * 0.2;
              }
    
              if (plan.earlyRetirementAge && input.retirementAge < plan.retirementAge) {
                const earlyYears = plan.retirementAge - input.retirementAge;
                earlyRetirementPenalty = yearlyBenefit * (0.05 * earlyYears);
                yearlyBenefit -= earlyRetirementPenalty;
              }
            }
            break;
    
          case 'DEFINED_CONTRIBUTION':
            if (plan.employerMatch) {
              const annualContribution = input.currentSalary * (plan.employerMatch * 2);
              const totalAccumulation = annualContribution * Math.pow(1.06, yearsUntilRetirement);
              yearlyBenefit = totalAccumulation * 0.04;
            }
            break;
    
          case 'CPP':
            const maxCPP = 1306.57;
            const adjustmentFactor = input.retirementAge >= 65 ? 1 : 0.7;
            monthlyBenefit = maxCPP * adjustmentFactor;
            yearlyBenefit = monthlyBenefit * 12;
            break;
        }
    
        monthlyBenefit = yearlyBenefit / 12;
        replacementRatio = (yearlyBenefit / input.currentSalary) * 100;

        // Save the detailed calculation
        await ctx.db.savedCalculation.create({
          data: {
            userId: ctx.session.user.id,
            name: `Detailed Calculation for ${plan.name}`,
            currentAge: input.currentAge,
            retirementAge: input.retirementAge,
            currentSalary: input.currentSalary,
            yearsOfService: input.yearsOfService,
            monthlyBenefit,
            yearlyBenefit,
            replacementRatio,
            plans: {
              connect: [{ id: plan.id }]
            }
          }
        });
    
        return {
          monthlyBenefit,
          yearlyBenefit,
          totalContributions,
          replacementRatio,
          bridgeBenefit,
          earlyRetirementPenalty
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate detailed benefits",
          cause: error
        });
      }
    }),

  getSavedCalculations: protectedProcedure
    .query(async ({ ctx }): Promise<SavedCalculation[]> => {
      try {
        return await ctx.db.savedCalculation.findMany({
          where: {
            userId: ctx.session.user.id
          },
          include: {
            plans: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch saved calculations",
          cause: error
        });
      }
    }),

  deleteCalculation: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const calculation = await ctx.db.savedCalculation.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!calculation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Calculation not found or you do not have permission to delete it"
          });
        }

        return await ctx.db.savedCalculation.delete({
          where: {
            id: input.id,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete calculation",
          cause: error
        });
      }
    }),

  calculateProjections: protectedProcedure
    .input(z.object({
      currentAge: z.number(),
      retirementAge: z.number(),
      currentSalary: z.number(),
      yearsOfService: z.number(),
      annualReturn: z.number(),
      salaryGrowth: z.number(),
      planIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }): Promise<TimelineDataPoint[]> => {
      try {
        const plans = await ctx.db.pensionPlan.findMany({
          where: {
            id: {
              in: input.planIds
            }
          }
        });

        const timelineData: TimelineDataPoint[] = [];

        for (let age = input.currentAge; age <= input.retirementAge; age++) {
          const dataPoint: TimelineDataPoint = { age };
          const yearsContributed = age - input.currentAge;
          
          const salaryAtAge = input.currentSalary * Math.pow(1 + input.salaryGrowth / 100, yearsContributed);

          for (const plan of plans) {
            let accumulatedValue = 0;

            switch (plan.type) {
              case 'DEFINED_BENEFIT':
                if (plan.accrualRate) {
                  const yearsOfServiceAtAge = Math.min(yearsContributed + input.yearsOfService, 35);
                  const yearlyBenefit = salaryAtAge * (plan.accrualRate) * yearsOfServiceAtAge;
                  
                  const yearsToRetirement = input.retirementAge - age;
                  if (yearsToRetirement > 0) {
                    accumulatedValue = yearlyBenefit / Math.pow(1 + input.annualReturn / 100, yearsToRetirement);
                  } else {
                    accumulatedValue = yearlyBenefit;
                  }
                }
                break;

              case 'DEFINED_CONTRIBUTION':
                if (plan.employerMatch) {
                  const annualContribution = salaryAtAge * (plan.employerMatch * 2);
                  const rate = input.annualReturn / 100;
                  accumulatedValue = annualContribution * 
                    ((Math.pow(1 + rate, yearsContributed) - 1) / rate) * (1 + rate);
                }
                break;

              case 'CPP':
                const maxCPP = 1306.57 * 12;
                const adjustmentFactor = age >= 65 ? 1 : 0.7;
                const yearlyBenefit = maxCPP * adjustmentFactor;
                
                const yearsToRetirement = input.retirementAge - age;
                if (yearsToRetirement > 0) {
                  accumulatedValue = yearlyBenefit / Math.pow(1 + input.annualReturn / 100, yearsToRetirement);
                } else {
                  accumulatedValue = yearlyBenefit;
                }
                break;

              default:
                accumulatedValue = salaryAtAge * 0.02 * yearsContributed;
            }

            dataPoint[plan.name] = Math.round(accumulatedValue);
          }

          timelineData.push(dataPoint);
        }

        return timelineData;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate projections",
          cause: error
        });
      }
    }),
});