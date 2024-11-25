import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('Starting seed...');
  
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.pensionPlan.deleteMany();

    console.log('Creating pension plans...');
    const plans = [
      {
        name: 'Canada Pension Plan (CPP)',
        type: PlanType.CPP,
        description: 'The federal pension program covering all workers in Canada except Quebec',
        retirementAge: 65,
        earlyRetirementAge: 60,
        bridgeBenefit: false,
        cppIntegration: false,
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
      },
      {
        name: 'Quebec Pension Plan (QPP)',
        type: PlanType.CPP,
        description: 'The provincial pension program for workers in Quebec',
        retirementAge: 65,
        earlyRetirementAge: 60,
        bridgeBenefit: false,
        cppIntegration: false
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
      }
    ];

    for (const plan of plans) {
      console.log(`Creating plan: ${plan.name}`);
      try {
        await prisma.pensionPlan.create({
          data: plan
        });
      } catch (error) {
        console.error(`Failed to create plan ${plan.name}:`, error);
        throw error;
      }
    }

    const planCount = await prisma.pensionPlan.count();
    console.log(`Seed completed successfully. Created ${planCount} pension plans.`);

  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Cleaning up prisma client...');
    await prisma.$disconnect();
  });