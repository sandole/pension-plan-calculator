"use client";

import { useState } from 'react';
import { api } from "~/trpc/react";
import { Layout } from './shared/Layout';
import { UserInputForm } from './shared/UserInputForm';
import { Warning } from './shared/Warning';
import { LoadingSpinner } from './shared/LoadingSpinner';

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
    
    if (!selectedPlan) {
      alert("Please select a plan for detailed calculation");
      return;
    }

    calculateDetailedBenefits.mutate({
      currentAge: parseInt(userInputs.currentAge),
      retirementAge: parseInt(userInputs.retirementAge),
      currentSalary: parseFloat(userInputs.currentSalary),
      yearsOfService: parseInt(userInputs.yearsOfService),
      planId: selectedPlan
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (plansQuery.isLoading) {
    return <LoadingSpinner />;
  }

  const PlanSelector = (
    <div className="bg-white/10 rounded-lg p-6 sticky top-6">
      <h2 className="text-2xl font-bold text-white mb-6">Select a Plan</h2>
      <div className="space-y-4">
        {plansQuery.data?.map((plan) => (
          <div
            key={plan.id}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-white/10 border border-white/10 hover:bg-white/20'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="text-sm text-gray-300 mb-2">{plan.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
              {plan.accrualRate && (
                <div>
                  <span className="font-medium">Accrual Rate:</span>
                  <span className="ml-2">{(plan.accrualRate * 100).toFixed(1)}%</span>
                </div>
              )}
              <div>
                <span className="font-medium">Type:</span>
                <span className="ml-2">{plan.type}</span>
              </div>
              <div>
                <span className="font-medium">Retirement Age:</span>
                <span className="ml-2">{plan.retirementAge}</span>
              </div>
              {plan.earlyRetirementAge && (
                <div>
                  <span className="font-medium">Early Retirement:</span>
                  <span className="ml-2">{plan.earlyRetirementAge}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

  return (
    <Layout
      leftColumn={leftColumn}
      rightColumn={PlanSelector}
    />
  );
}