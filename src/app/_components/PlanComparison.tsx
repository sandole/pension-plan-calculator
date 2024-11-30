"use client";

import { useState } from 'react';
import { api } from "~/trpc/react";
import type { PensionCalculationResult } from '~/types/pension';
import { Layout } from './shared/Layout';
import { PlanSelector } from './shared/PlanSelector';
import { UserInputForm } from './shared/UserInputForm';
import { Warning } from './shared/Warning';
import { LoadingSpinner } from './shared/LoadingSpinner';

export default function PlanComparison() {
  const [userInputs, setUserInputs] = useState({
    currentAge: '',
    retirementAge: '',
    currentSalary: '',
    yearsOfService: ''
  });

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [calculationResults, setCalculationResults] = useState<Record<string, PensionCalculationResult> | null>(null);

  const plansQuery = api.pension.getPlans.useQuery();
  
  const calculateBenefits = api.pension.calculateBenefits.useMutation({
    onSuccess: (data) => {
      setCalculationResults(data);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlans.length) {
      alert("Please select at least one plan to compare");
      return;
    }

    calculateBenefits.mutate({
      currentAge: parseInt(userInputs.currentAge),
      retirementAge: parseInt(userInputs.retirementAge),
      currentSalary: parseFloat(userInputs.currentSalary),
      yearsOfService: parseInt(userInputs.yearsOfService),
      planIds: selectedPlans
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount);
  };

  if (plansQuery.isLoading) {
    return <LoadingSpinner />;
  }

  const ResultsSection = calculationResults && (
    <div className="bg-white/10 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Calculation Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(calculationResults).map(([planId, result]) => {
          const plan = plansQuery.data?.find(p => p.id === planId);
          if (!plan) return null;

          return (
            <div key={planId} className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">{plan.name}</h3>
              <div className="space-y-4">
                <div className="border-t border-white/10 pt-4">
                  <p className="text-gray-300 mb-2">Monthly Benefit at Retirement</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(result.monthlyBenefit)}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-gray-300 mb-2">Annual Benefit</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(result.yearlyBenefit)}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-gray-300 mb-2">Income Replacement Ratio</p>
                  <p className="text-2xl font-bold text-white">
                    {result.replacementRatio.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const leftColumn = (
    <>
      <UserInputForm
        userInputs={userInputs}
        onInputChange={handleInputChange}
        onSubmit={handleCalculate}
        isCalculating={calculateBenefits.isPending}
        selectedPlans={selectedPlans}
      />
      {ResultsSection}
      <Warning 
        message="These calculations are estimates based on current information and assumptions. 
                Actual benefits may vary. Consult with a financial advisor for personalized advice."
      />
    </>
  );

  const rightColumn = (
    <PlanSelector
      plans={plansQuery.data ?? []}
      selectedPlans={selectedPlans}
      onPlanSelect={setSelectedPlans}
    />
  );

  return (
    <Layout
      leftColumn={leftColumn}
      rightColumn={rightColumn}
    />
  );
}