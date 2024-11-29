import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import type { PensionCalculationResult } from "~/types/pension";

export interface TimelineDataPoint {
  age: number;
  [planName: string]: number;
}

export const pensionRouter = createTRPCRouter({
  getPlans: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.pensionPlan.findMany();
  }),

  getPlan: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.pensionPlan.findUnique({
        where: { id: input.id },
      });
    }),

  calculateBenefits: protectedProcedure
    .input(z.object({
      currentAge: z.number(),
      retirementAge: z.number(),
      currentSalary: z.number(),
      yearsOfService: z.number(),
      planIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }): Promise<Record<string, PensionCalculationResult>> => {
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
      }

      return results;
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
    }),

  createComparison: protectedProcedure
    .input(z.object({
      name: z.string(),
      currentAge: z.number(),
      retirementAge: z.number(),
      currentSalary: z.number(),
      yearsOfService: z.number(),
      planIds: z.array(z.string()),
      salaryGrowth: z.number().optional(),
      inflationRate: z.number().optional(),
      investmentReturn: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.planComparison.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          currentAge: input.currentAge,
          retirementAge: input.retirementAge,
          currentSalary: input.currentSalary,
          yearsOfService: input.yearsOfService,
          salaryGrowth: input.salaryGrowth ?? 0.02,
          inflationRate: input.inflationRate ?? 0.02,
          investmentReturn: input.investmentReturn ?? 0.06,
          plans: {
            connect: input.planIds.map(id => ({ id })),
          },
        },
      });
    }),

  getComparisonResults: protectedProcedure
    .input(z.object({ comparisonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const comparison = await ctx.db.planComparison.findUnique({
        where: { id: input.comparisonId },
        include: { plans: true },
      });

      const results = comparison?.plans.map(plan => ({
        planId: plan.id,
        planName: plan.name,
        monthlyBenefit: 0,
        totalValue: 0,
      }));

      return results;
    }),
});