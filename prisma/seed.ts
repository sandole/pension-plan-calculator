import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.pensionPlan.deleteMany();

  // Create major Canadian pension plans
  const plans = [
    {
      name: 'Canada Pension Plan (CPP)',
      type: PlanType.CPP,
      description: 'The federal pension program covering all workers in Canada except Quebec',
      retirementAge: 65,
      earlyRetirementAge: 60,
      bridgeBenefit: false,
      cppIntegration: false,
      // AUM: $541.5 billion (2023)
    },
    {
      name: 'Ontario Teachers\' Pension Plan',
      type: PlanType.DEFINED_BENEFIT,
      description: 'One of Canada\'s largest pension plans, serving Ontario\'s teachers',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $242.5 billion (2023)
    },
    {
      name: 'Healthcare of Ontario Pension Plan (HOOPP)',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving healthcare workers in Ontario',
      accrualRate: 0.0175,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $103.7 billion (2023)
    },
    {
      name: 'Ontario Municipal Employees Retirement System (OMERS)',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving municipal employees in Ontario',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $121 billion (2023)
    },
    {
      name: 'Public Service Pension Plan (PSPP)',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving federal public service employees',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $169.6 billion (2023)
    },
    {
      name: 'BC Municipal Pension Plan',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving municipal employees in British Columbia',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $66.5 billion (2023)
    },
    {
      name: 'Quebec Pension Plan (QPP)',
      type: PlanType.CPP,
      description: 'The provincial pension program for workers in Quebec',
      retirementAge: 65,
      earlyRetirementAge: 60,
      bridgeBenefit: false,
      cppIntegration: false
      // AUM: $80.9 billion (2023)
    },
    {
      name: 'Alberta Teachers\' Retirement Fund',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving teachers in Alberta',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $21.5 billion (2023)
    },
    {
      name: 'OPSEU Pension Trust (OPTrust)',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving Ontario public service employees and OPSEU members',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $25.7 billion (2023)
    },
    {
      name: 'Healthcare Employees\' Pension Plan - Manitoba',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving healthcare workers in Manitoba',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $9.5 billion (2023)
    },
    {
      name: 'Nova Scotia Health Employees\' Pension Plan',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving healthcare workers in Nova Scotia',
      accrualRate: 0.02,
      retirementAge: 65,
      earlyRetirementAge: 55,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $11.2 billion (2023)
    },
    {
      name: 'Canadian Forces Pension Plan',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving members of the Canadian Armed Forces',
      accrualRate: 0.02,
      retirementAge: 60,
      earlyRetirementAge: 50,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $26.3 billion (2023)
    },
    {
      name: 'Royal Canadian Mounted Police Pension Plan',
      type: PlanType.DEFINED_BENEFIT,
      description: 'Serving members of the RCMP',
      accrualRate: 0.02,
      retirementAge: 60,
      earlyRetirementAge: 50,
      bridgeBenefit: true,
      cppIntegration: true,
      vestingPeriodYears: 2
      // AUM: $13.8 billion (2023)
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