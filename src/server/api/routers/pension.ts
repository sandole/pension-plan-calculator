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