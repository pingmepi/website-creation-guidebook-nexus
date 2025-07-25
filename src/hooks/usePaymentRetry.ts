
import { useState, useCallback } from "react";
import { toast } from "@/components/ui/toast";

interface UsePaymentRetryProps {
  maxRetries?: number;
  retryDelay?: number;
}

export const usePaymentRetry = ({ maxRetries = 3, retryDelay = 2000 }: UsePaymentRetryProps = {}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    shouldRetry: (error: unknown) => boolean = () => true
  ): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          toast.info(`Retrying payment... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }

        const result = await operation();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        lastError = error;
        setRetryCount(attempt + 1);

        if (attempt === maxRetries || !shouldRetry(error)) {
          setIsRetrying(false);
          throw error;
        }
      }
    }

    setIsRetrying(false);
    throw lastError;
  }, [maxRetries, retryDelay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
    reset
  };
};
