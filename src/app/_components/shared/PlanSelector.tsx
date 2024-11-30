import { type PensionPlan } from "@prisma/client";

interface PlanSelectorProps {
  plans: PensionPlan[];
  selectedPlans: string[];
  onPlanSelect: (planIds: string[]) => void;
}

export function PlanSelector({ plans, selectedPlans, onPlanSelect }: PlanSelectorProps) {
  return (
    <div className="bg-white/10 rounded-lg p-6 sticky top-6">
      <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
      <div className="space-y-4">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selectedPlans.includes(plan.id)
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/10 hover:bg-white/20'
            }`}
            onClick={() => {
              onPlanSelect(
                selectedPlans.includes(plan.id)
                  ? selectedPlans.filter(id => id !== plan.id)
                  : [...selectedPlans, plan.id]
              );
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-300 mb-3">{plan.description}</p>
            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex items-center">
                <span className="font-medium">Type:</span>
                <span className="ml-2">{plan.type}</span>
              </div>
              {plan.accrualRate && (
                <div className="flex items-center">
                  <span className="font-medium">Accrual Rate:</span>
                  <span className="ml-2">{plan.accrualRate}%</span>
                </div>
              )}
              {plan.employerMatch && (
                <div className="flex items-center">
                  <span className="font-medium">Employer Match:</span>
                  <span className="ml-2">{plan.employerMatch}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
