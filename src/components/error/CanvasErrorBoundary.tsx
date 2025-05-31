
import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

const CanvasErrorFallback = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <AlertCircle className="h-8 w-8 text-orange-500 mb-2" />
      <h3 className="font-medium text-gray-800 mb-1">Canvas Error</h3>
      <p className="text-sm text-gray-600 mb-3 text-center">
        The design canvas failed to load properly.
      </p>
      <Button 
        onClick={onRetry || (() => window.location.reload())} 
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
};

export const CanvasErrorBoundary = ({ children, onRetry }: CanvasErrorBoundaryProps) => {
  return (
    <ErrorBoundary context="Canvas" fallback={<CanvasErrorFallback onRetry={onRetry} />}>
      {children}
    </ErrorBoundary>
  );
};
