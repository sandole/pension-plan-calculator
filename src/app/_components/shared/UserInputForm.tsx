import { type ChangeEvent, type FormEvent } from 'react';
import { Calculator } from 'lucide-react';

interface UserInputFormProps {
  userInputs: {
    currentAge: string;
    retirementAge: string;
    currentSalary: string;
    yearsOfService: string;
    annualReturn?: string;
    salaryGrowth?: string;
  };
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  isCalculating: boolean;
  selectedPlans: string[];
  showProjectionInputs?: boolean;
}

export function UserInputForm({
  userInputs,
  onInputChange,
  onSubmit,
  isCalculating,
  selectedPlans,
  showProjectionInputs = false,
}: UserInputFormProps) {
  return (
    <div className="bg-white/10 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        {showProjectionInputs ? 'Projection Parameters' : 'Your Information'}
      </h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Current Age
          </label>
          <input
            type="number"
            name="currentAge"
            value={userInputs.currentAge}
            onChange={onInputChange}
            className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
            placeholder="Enter your current age"
            required
            min="18"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Retirement Age
          </label>
          <input
            type="number"
            name="retirementAge"
            value={userInputs.retirementAge}
            onChange={onInputChange}
            className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
            placeholder="Enter retirement age"
            required
            min="55"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Current Annual Salary
          </label>
          <input
            type="number"
            name="currentSalary"
            value={userInputs.currentSalary}
            onChange={onInputChange}
            className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
            placeholder="Enter your current salary"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Years of Service
          </label>
          <input
            type="number"
            name="yearsOfService"
            value={userInputs.yearsOfService}
            onChange={onInputChange}
            className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
            placeholder="Enter years of service"
            required
            min="0"
            max="50"
          />
        </div>
        {showProjectionInputs && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                name="annualReturn"
                value={userInputs.annualReturn}
                onChange={onInputChange}
                className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
                placeholder="Enter expected return rate"
                required
                min="0"
                max="15"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Annual Salary Growth (%)
              </label>
              <input
                type="number"
                name="salaryGrowth"
                value={userInputs.salaryGrowth}
                onChange={onInputChange}
                className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
                placeholder="Enter salary growth rate"
                required
                min="0"
                max="10"
                step="0.1"
              />
            </div>
          </>
        )}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={!selectedPlans.length || isCalculating}
            className={`px-6 py-2 rounded-lg font-semibold transition-all
              ${selectedPlans.length 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
          >
            {isCalculating ? (
              <span className="flex items-center">
                <Calculator className="animate-spin mr-2 h-5 w-5" />
                Calculating...
              </span>
            ) : (
              showProjectionInputs ? 'Generate Projection' : 'Calculate Benefits'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}