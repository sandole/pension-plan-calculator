import { Calculator } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin">
        <Calculator className="h-8 w-8 text-purple-600" />
      </div>
    </div>
  );
}