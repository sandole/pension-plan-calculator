import { AlertCircle } from 'lucide-react';

interface WarningProps {
  message: string;
}

export function Warning({ message }: WarningProps) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
        <p className="text-yellow-500">{message}</p>
      </div>
    </div>
  );
}