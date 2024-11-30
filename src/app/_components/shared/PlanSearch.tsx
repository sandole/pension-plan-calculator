import { Search } from "lucide-react";
import { type ChangeEvent } from "react";

interface PlanSearchProps {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function PlanSearch({ searchTerm, onSearchChange }: PlanSearchProps) {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg 
                 bg-white/5 text-white placeholder-gray-400 focus:outline-none 
                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Search pension plans..."
      />
    </div>
  );
}