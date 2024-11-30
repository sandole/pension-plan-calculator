"use client";

import { useState } from 'react';
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
import { api } from "~/trpc/react";
import { Layout } from './shared/Layout';
import { PlanSelector } from './shared/PlanSelector';
import { UserInputForm } from './shared/UserInputForm';
import { Warning } from './shared/Warning';
import { LoadingSpinner } from './shared/LoadingSpinner';

interface TimelineDataPoint {
  age: number;
  [planName: string]: number;
}

export default function PlanGraph() {
  const [userInputs, setUserInputs] = useState({
    currentAge: '',
    retirementAge: '',
    currentSalary: '',
    yearsOfService: '',
    annualReturn: '6',
    salaryGrowth: '2'
  });

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [projectionResults, setProjectionResults] = useState<TimelineDataPoint[] | null>(null);

  const plansQuery = api.pension.getPlans.useQuery();
  
  const calculateProjections = api.pension.calculateProjections.useMutation({
    onSuccess: (data) => {
      setProjectionResults(data);
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
    return <LoadingSpinner />;
  }

  const ProjectionGraph = projectionResults && (
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
  );

  const leftColumn = (
    <>
      <UserInputForm
        userInputs={userInputs}
        onInputChange={handleInputChange}
        onSubmit={handleCalculate}
        isCalculating={calculateProjections.isPending}
        selectedPlans={selectedPlans}
        showProjectionInputs={true}
      />
      {ProjectionGraph}
      <Warning 
        message="These projections are estimates based on current information and assumptions. 
                Actual results may vary significantly based on market performance, inflation, and other factors. 
                Consult with a financial advisor for personalized advice."
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