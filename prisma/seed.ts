import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.pensionPlan.deleteMany();

  // Create sample pension plans
  const plans = [
    {
      name: 'Federal Public Service Pension Plan',
      type: PlanType.DEFINED_BENEFIT,
      description: 'The pension plan for federal public service employees in Canada',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
    },
    {
      name: 'Basic CPP',
      type: PlanType.CPP,
      description: 'Canada Pension Plan - the federal pension program',
      retirementAge: 65,
      earlyRetirementAge: 60,
      bridgeBenefit: false,
      cppIntegration: false
    },
    {
      name: 'Sample DC Plan',
      type: PlanType.DEFINED_CONTRIBUTION,
      description: 'A typical defined contribution pension plan',
      employerMatch: 0.05,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: false,
      cppIntegration: true,
      vestingPeriodYears: 2
    }
  ];

  for (const plan of plans) {
    await prisma.pensionPlan.create({
      data: plan
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });