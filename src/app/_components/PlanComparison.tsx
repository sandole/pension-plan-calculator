"use client";

import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { Calculator, AlertCircle } from 'lucide-react';

export default function PlanComparison() {
  const [userInputs, setUserInputs] = useState({
    currentAge: '',
    retirementAge: '',
    currentSalary: '',
    yearsOfService: ''
  });

  // Get all pension plans
  const plansQuery = api.pension.getPlans.useQuery();
  
  // Create comparison mutation
  const createComparison = api.pension.createComparison.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createComparison.mutate({
      name: "New Comparison",
      currentAge: parseInt(userInputs.currentAge),
      retirementAge: parseInt(userInputs.retirementAge),
      currentSalary: parseFloat(userInputs.currentSalary),
      yearsOfService: parseInt(userInputs.yearsOfService),
      planIds: selectedPlans
    });
  };

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  if (plansQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Calculator className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* User Information Form */}
      <div className="mb-12 bg-white/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Your Information</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Current Age
            </label>
            <input
              type="number"
              name="currentAge"
              value={userInputs.currentAge}
              onChange={handleInputChange}
              className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
              placeholder="Enter your current age"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Planned Retirement Age
            </label>
            <input
              type="number"
              name="retirementAge"
              value={userInputs.retirementAge}
              onChange={handleInputChange}
              className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
              placeholder="Enter planned retirement age"
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
              onChange={handleInputChange}
              className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
              placeholder="Enter your current salary"
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
              onChange={handleInputChange}
              className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
              placeholder="Enter years of service"
            />
          </div>
        </form>
      </div>

      {/* Plans Selection */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plansQuery.data?.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-lg cursor-pointer transition-all ${
                selectedPlans.includes(plan.id)
                  ? 'bg-purple-600 border-2 border-purple-400'
                  : 'bg-white/10 border border-white/10 hover:bg-white/20'
              }`}
              onClick={() => {
                setSelectedPlans(prev =>
                  prev.includes(plan.id)
                    ? prev.filter(id => id !== plan.id)
                    : [...prev, plan.id]
                );
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-300 mb-4">{plan.description}</p>
              <div className="space-y-2 text-sm text-gray-300">
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

      {/* Comparison Results */}
      {selectedPlans.length > 0 && createComparison.data && (
        <div className="bg-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Comparison Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedPlans.map(planId => {
              const plan = plansQuery.data?.find(p => p.id === planId);
              if (!plan) return null;

              return (
                <div key={plan.id} className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">{plan.name}</h3>
                  <div className="space-y-4">
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-300 mb-2">Monthly Benefit at Retirement</p>
                      <p className="text-2xl font-bold text-white">$3,500</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-300 mb-2">Total Value</p>
                      <p className="text-2xl font-bold text-white">$875,000</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-300 mb-2">Income Replacement Ratio</p>
                      <p className="text-2xl font-bold text-white">65%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Warning Message */}
      <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-yellow-500">
            These calculations are estimates based on current information and assumptions. 
            Actual benefits may vary. Consult with a financial advisor for personalized advice.
          </p>
        </div>
      </div>
    </div>
  );
}