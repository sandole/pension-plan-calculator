import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const pensionRouter = createTRPCRouter({
  // Get all pension plans
  getPlans: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.pensionPlan.findMany();
  }),

  // Get specific plan details
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
    .mutation(async ({ ctx, input }) => {
      // Simple initial calculation
      const results: Record<string, any> = {};
      
      // Get selected plans
      const plans = await ctx.db.pensionPlan.findMany({
        where: {
          id: {
            in: input.planIds
          }
        }
      });

      // Calculate benefits for each plan
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
              // Simple projection assuming 5% annual return
              const annualContribution = input.currentSalary * (plan.employerMatch * 2); // Employee + Employer
              const years = input.retirementAge - input.currentAge;
              const totalAccumulation = annualContribution * Math.pow(1.05, years);
              yearlyBenefit = totalAccumulation * 0.04; // 4% withdrawal rule
              monthlyBenefit = yearlyBenefit / 12;
              replacementRatio = (yearlyBenefit / input.currentSalary) * 100;
            }
            break;

          case 'CPP':
            // Simplified CPP calculation
            const maxCPP = 1306.57; // 2024 maximum monthly CPP
            const adjustmentFactor = input.retirementAge >= 65 ? 1 : 0.7; // 30% reduction for early retirement at 60
            monthlyBenefit = maxCPP * adjustmentFactor;
            yearlyBenefit = monthlyBenefit * 12;
            replacementRatio = (yearlyBenefit / input.currentSalary) * 100;
            break;

          default:
            // Basic calculation for other types
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

  // Create a plan comparison
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

  // Get comparison results
  getComparisonResults: protectedProcedure
    .input(z.object({ comparisonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const comparison = await ctx.db.planComparison.findUnique({
        where: { id: input.comparisonId },
        include: { plans: true },
      });

      // Here you would implement the actual comparison logic
      // This is just a placeholder structure
      const results = comparison?.plans.map(plan => ({
        planId: plan.id,
        planName: plan.name,
        monthlyBenefit: 0, // calculateMonthlyBenefit(plan, comparison),
        totalValue: 0, // calculateTotalValue(plan, comparison),
        // Add more metrics as needed
      }));

      return results;
    }),
});

// // TODO: Helper functions for calculations
// function calculateMonthlyBenefit(plan: any, comparison: any) {
//   // Implement actual calculation logic based on plan type
//   return 0; // Placeholder
// }

// // TODO: Helper functions for calculations
// function calculateTotalValue(plan: any, comparison: any) {
//   // Implement actual calculation logic based on plan type
//   return 0; // Placeholder
// }