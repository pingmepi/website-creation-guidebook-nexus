
import { toast } from "@/hooks/use-toast";

export interface ErrorLog {
  id: string;
  timestamp: Date;
  error: Error;
  context: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class ErrorLogger {
  private static logs: ErrorLog[] = [];
  private static maxLogs = 100;

  static log(error: Error, context: string, metadata?: Record<string, unknown>): void {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      error,
      context,
      metadata
    };

    // Add to in-memory logs
    this.logs.unshift(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console for development
    console.error(`[ErrorLogger] ${context}:`, error, metadata);

    // Show user-friendly toast for critical errors
    if (this.isCriticalError(context)) {
      this.showUserError(error, context);
    }
  }

  private static isCriticalError(context: string): boolean {
    const criticalContexts = [
      'DesignGeneration',
      'DesignSave',
      'Authentication',
      'CanvasRender'
    ];
    return criticalContexts.some(ctx => context.includes(ctx));
  }

  private static showUserError(error: Error, context: string): void {
    const userFriendlyMessages: Record<string, string> = {
      DesignGeneration: "Failed to generate design. Please try again.",
      DesignSave: "Failed to save design. Please check your connection and try again.",
      Authentication: "Authentication error. Please sign in again.",
      CanvasRender: "Canvas rendering error. Please refresh the page."
    };

    const message = Object.entries(userFriendlyMessages).find(([key]) => 
      context.includes(key)
    )?.[1] || "An unexpected error occurred. Please try again.";

    toast({
      variant: "destructive",
      title: "Error",
      description: message
    });
  }

  static getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }
}
