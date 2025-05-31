
import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DesignErrorBoundaryProps {
  children: ReactNode;
}

const DesignErrorFallback = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="bg-red-50 rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          Design Tool Error
        </h2>
        <p className="text-red-600 mb-4">
          There was an issue with the design interface. This might be due to a canvas rendering problem or data loading issue.
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DesignErrorBoundary = ({ children }: DesignErrorBoundaryProps) => {
  return (
    <ErrorBoundary context="Design" fallback={<DesignErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
};
