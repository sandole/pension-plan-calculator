"use client";

import { useState } from 'react';
import { api } from "~/trpc/react";
import { Layout } from './shared/Layout';
import { UserInputForm } from './shared/UserInputForm';
import { Warning } from './shared/Warning';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { PlanSelector } from './shared/PlanSelector';

interface DetailedCalculationResult {
  monthlyBenefit: number;
  yearlyBenefit: number;
  totalContributions: number;
  replacementRatio: number;
  bridgeBenefit?: number;
  cppIntegration?: number;
  earlyRetirementPenalty?: number;
}

export default function AccurateCalculations() {
  const [userInputs, setUserInputs] = useState({
    currentAge: '',
    retirementAge: '',
    currentSalary: '',
    yearsOfService: ''
  });

  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [calculationResult, setCalculationResult] = useState<DetailedCalculationResult | null>(null);

  const plansQuery = api.pension.getPlans.useQuery();
  
  const calculateDetailedBenefits = api.pension.calculateDetailedBenefits.useMutation({
    onSuccess: (data) => {
      setCalculationResult(data);
      alert("Calculation completed and saved successfully!");
    },
    onError: (error) => {
      console.error("Error during calculation:", error);
      alert("Failed to calculate benefits. Please try again.");
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      alert("Please select a plan for detailed calculation");
      return;
    }

    try {
      await calculateDetailedBenefits.mutateAsync({
        currentAge: parseInt(userInputs.currentAge),
        retirementAge: parseInt(userInputs.retirementAge),
        currentSalary: parseFloat(userInputs.currentSalary),
        yearsOfService: parseInt(userInputs.yearsOfService),
        planId: selectedPlan,
      });
    } catch (error) {
      console.error("Error during calculation:", error);
    }
  };

  if (plansQuery.isLoading) {
    return <LoadingSpinner />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const ResultsSection = calculationResult && (
    <div className="bg-white/10 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Detailed Calculation Results</h2>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 mb-1">Monthly Benefit</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(calculationResult.monthlyBenefit)}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 mb-1">Annual Benefit</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(calculationResult.yearlyBenefit)}
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-gray-300 mb-1">Total Contributions</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(calculationResult.totalContributions)}
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-gray-300 mb-1">Income Replacement Ratio</p>
            <p className="text-2xl font-bold text-white">
              {calculationResult.replacementRatio.toFixed(1)}%
            </p>
          </div>

          {calculationResult.bridgeBenefit && (
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-gray-300 mb-1">Bridge Benefit (until age 65)</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(calculationResult.bridgeBenefit)}
              </p>
            </div>
          )}

          {calculationResult.earlyRetirementPenalty && (
            <div className="bg-white/5 p-4 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-500 mb-1">Early Retirement Reduction</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(calculationResult.earlyRetirementPenalty)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const leftColumn = (
    <>
      <UserInputForm
        userInputs={userInputs}
        onInputChange={handleInputChange}
        onSubmit={handleCalculate}
        isCalculating={calculateDetailedBenefits.isPending}
        selectedPlans={selectedPlan ? [selectedPlan] : []}
      />
      {ResultsSection}
      <Warning
        message="These calculations are estimates based on current information and assumptions. 
                Actual benefits may vary based on specific plan rules and conditions. 
                Please consult with your pension plan administrator for official calculations."
      />
    </>
  );

  const rightColumn = (
    <PlanSelector
      plans={plansQuery.data ?? []}
      selectedPlans={selectedPlan ? [selectedPlan] : []}
      onPlanSelect={(planIds) => setSelectedPlan(planIds[0] ?? '')}
    />
  );

  return (
    <Layout
      leftColumn={leftColumn}
      rightColumn={rightColumn}
    />
  );
}