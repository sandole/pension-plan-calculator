"use client";

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Calculator, AlertCircle } from 'lucide-react';
import { api } from "~/trpc/react";

export default function NetWorthGraph() {
  const [userInputs, setUserInputs] = useState({
    currentAge: '',
    retirementAge: '',
    currentSalary: '',
    yearsOfService: '',
    annualReturn: '6',
    salaryGrowth: '2'
  });

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [projectionResults, setProjectionResults] = useState<any[] | null>(null);

  const plansQuery = api.pension.getPlans.useQuery();
  
  const calculateProjections = api.pension.calculateProjections.useMutation({
    onSuccess: (data) => {
      setProjectionResults(data);
    },
  });

  const areInputsValid = () => {
    return userInputs.currentAge !== '' &&
           userInputs.retirementAge !== '' &&
           userInputs.currentSalary !== '' &&
           userInputs.yearsOfService !== '' &&
           userInputs.annualReturn !== '' &&
           userInputs.salaryGrowth !== '';
  };

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
      alert("Please select at least one plan to project");
      return;
    }

    calculateProjections.mutate({
      currentAge: parseInt(userInputs.currentAge),
      retirementAge: parseInt(userInputs.retirementAge),
      currentSalary: parseFloat(userInputs.currentSalary),
      yearsOfService: parseInt(userInputs.yearsOfService),
      annualReturn: parseFloat(userInputs.annualReturn),
      salaryGrowth: parseFloat(userInputs.salaryGrowth),
      planIds: selectedPlans
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Input Form and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information Form */}
          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Projection Parameters</h2>
            <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
                  placeholder="Enter years of service"
                  required
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Expected Annual Return (%)
                </label>
                <input
                  type="number"
                  name="annualReturn"
                  value={userInputs.annualReturn}
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-2 text-white"
                  placeholder="Enter salary growth rate"
                  required
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedPlans.length || !areInputsValid() || calculateProjections.isPending}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all
                    ${selectedPlans.length && areInputsValid()
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
                >
                  {calculateProjections.isPending ? (
                    <span className="flex items-center">
                      <Calculator className="animate-spin mr-2 h-5 w-5" />
                      Calculating...
                    </span>
                  ) : (
                    'Generate Projection'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Projection Graph */}
          {projectionResults && (
            <div className="bg-white/10 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Net Worth Projection</h2>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionResults}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="age"
                      stroke="#9ca3af"
                      label={{ value: 'Age', position: 'bottom', fill: '#9ca3af' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tickFormatter={formatCurrency}
                      label={{
                        value: 'Projected Value',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#9ca3af'
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Age: ${label}`}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151'
                      }}
                      itemStyle={{ color: '#9ca3af' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#9ca3af' }}
                    />
                    {plansQuery.data?.map((plan, index) => (
                      selectedPlans.includes(plan.id) && (
                        <Line
                          key={plan.id}
                          type="monotone"
                          dataKey={plan.name}
                          stroke={[
                            '#9333ea', // Purple
                            '#2563eb', // Blue
                            '#dc2626', // Red
                            '#16a34a'  // Green
                          ][index % 4]}
                          strokeWidth={2}
                          dot={false}
                        />
                      )
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-yellow-500">
                These projections are estimates based on current information and assumptions. 
                Actual results may vary significantly based on market performance, inflation, and other factors. 
                Consult with a financial advisor for personalized advice.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Plans Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 rounded-lg p-6 sticky top-6">
            <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
            <div className="space-y-4">
              {plansQuery.data?.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
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
        </div>
      </div>
    </div>
  );
}