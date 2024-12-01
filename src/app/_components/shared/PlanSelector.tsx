import { useState, type ChangeEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type PensionPlan } from "@prisma/client";
import { PlanSearch } from "./PlanSearch";

interface PlanSelectorProps {
  plans: PensionPlan[];
  selectedPlans: string[];
  onPlanSelect: (planIds: string[]) => void;
}

export function PlanSelector({ plans, selectedPlans, onPlanSelect }: PlanSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const plansPerPage = 5;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  // Filter plans based on search term
  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ??
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
    plan.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);
  const paginatedPlans = filteredPlans.slice(
    currentPage * plansPerPage,
    (currentPage + 1) * plansPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="bg-white/10 rounded-lg p-6 sticky top-6">
      <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
      
      <PlanSearch 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <div className="space-y-4 mb-6">
        {paginatedPlans.map((plan) => (
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
                  <span className="ml-2">{(plan.accrualRate * 100).toFixed(1)}%</span>
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`p-2 rounded-lg transition-all ${
            currentPage === 0
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <span className="text-white">
          Page {currentPage + 1} of {Math.max(1, totalPages)}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={`p-2 rounded-lg transition-all ${
            currentPage >= totalPages - 1
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}