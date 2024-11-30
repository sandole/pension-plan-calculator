import { type ReactNode } from 'react';

interface LayoutProps {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}

export function Layout({ leftColumn, rightColumn }: LayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {leftColumn}
        </div>
        <div className="lg:col-span-1">
          {rightColumn}
        </div>
      </div>
    </div>
  );
}