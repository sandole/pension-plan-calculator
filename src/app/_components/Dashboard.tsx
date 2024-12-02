"use client"

import { useState } from 'react';
import { api } from "~/trpc/react";
import type { SavedCalculation } from "~/types/pension";
import { Calculator, Filter, SortAsc, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const [sortField, setSortField] = useState<keyof SavedCalculation>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterText, setFilterText] = useState('');

  const savedCalculations = api.pension.getSavedCalculations.useQuery();
  const deleteCalculation = api.pension.deleteCalculation.useMutation({
    onSuccess: () => {
      void savedCalculations.refetch();
    },
  });

  const filteredCalculations = savedCalculations.data?.filter((calc: SavedCalculation) =>
    calc.name.toLowerCase().includes(filterText.toLowerCase()) ||
    calc.description?.toLowerCase().includes(filterText.toLowerCase())
  );

  const sortedCalculations = filteredCalculations?.sort((a: SavedCalculation, b: SavedCalculation) => {
    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';
    return sortOrder === 'asc'
      ? (aValue < bValue ? -1 : 1)
      : (aValue > bValue ? -1 : 1);
  });

  const sortOptions: Array<{ field: keyof SavedCalculation; label: string }> = [
    { field: 'createdAt', label: 'Date Created' },
    { field: 'name', label: 'Name' },
    { field: 'monthlyBenefit', label: 'Monthly Benefit' },
    { field: 'yearlyBenefit', label: 'Yearly Benefit' },
    { field: 'replacementRatio', label: 'Replacement Ratio' }
  ];

  <div className="flex gap-4">
    <div className="relative">
      <input
        type="text"
        placeholder="Search calculations..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="bg-white/10 rounded-lg px-4 py-2 pl-10 w-64"
      />
      <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
    <select
      value={sortField}
      onChange={(e) => setSortField(e.target.value as keyof SavedCalculation)}
      className="bg-white/10 rounded-lg px-4 py-2 text-white"
    >
      {sortOptions.map(option => (
        <option key={option.field} value={option.field} className="bg-gray-800">
          Sort by {option.label}
        </option>
      ))}
    </select>
    <button
      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
      className="bg-white/10 p-2 rounded-lg hover:bg-white/20"
    >
      <SortAsc className={`h-5 w-5 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
    </button>
  </div>

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Saved Calculations</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search calculations..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-white/10 rounded-lg px-4 py-2 pl-10 w-64"
              />
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => {
                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              }}
              className="bg-white/10 p-2 rounded-lg hover:bg-white/20"
            >
              <SortAsc className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {savedCalculations.isLoading ? (
            <div className="text-center py-8">
              <Calculator className="animate-spin h-8 w-8 mx-auto mb-4" />
              <p>Loading your calculations...</p>
            </div>
          ) : sortedCalculations?.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-lg">
              <p className="text-gray-400">No saved calculations found</p>
            </div>
          ) : (
            sortedCalculations?.map((calc) => (
              <div
                key={calc.id}
                className="bg-white/10 rounded-lg p-6 hover:bg-white/15 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{calc.name}</h3>
                    {calc.description && (
                      <p className="text-gray-400 mt-1">{calc.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteCalculation.mutate({ id: calc.id })}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Monthly Benefit</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(calc.monthlyBenefit)}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Yearly Benefit</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(calc.yearlyBenefit)}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Replacement Ratio</p>
                    <p className="text-lg font-semibold">
                      {calc.replacementRatio.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  Created: {formatDate(calc.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}