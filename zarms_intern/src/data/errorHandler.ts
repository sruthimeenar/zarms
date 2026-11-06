// User-friendly error messages mapping
const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  // Network/Server errors
  'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
  'NetworkError': 'Unable to connect to the server. Please check your internet connection.',
  'ERR_CONNECTION_REFUSED': 'Server is not responding. Please try again later.',
  'ERR_INTERNET_DISCONNECTED': 'No internet connection. Please check your network.',

  // HTTP errors
  'Request failed: 404': 'The requested resource was not found.',
  'Request failed: 500': 'Server error. Please try again later.',
  'Request failed: 503': 'Service temporarily unavailable. Please try again later.',

  // API errors
  'Invalid response from server': 'Server error. Please try again later.',
  'Server error - check backend logs for PHP errors': 'Server error. Please try again later.',
  'Failed to parse JSON response': 'Server error. Please try again later.',

  // Auth errors
  'No authentication token provided': 'Please login to continue.',
  'Invalid or expired token': 'Your session has expired. Please login again.',
  'Invalid session': 'Your session has expired. Please login again.',
};

// Developer-friendly error details (only shown in development)
interface ErrorDetails {
  originalMessage: string;
  path?: string;
  status?: number;
  timestamp: string;
}

// Global error handler class
class ErrorHandler {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.VITE_APP_ENV === 'development';
  }

  // Get user-friendly error message
  getUserMessage(error: Error | string): string {
    const errorMessage = typeof error === 'string' ? error : error.message;

    // Check if we have a user-friendly mapping
    for (const [key, friendlyMessage] of Object.entries(USER_FRIENDLY_MESSAGES)) {
      if (errorMessage.includes(key)) {
        return friendlyMessage;
      }
    }

    // If it's already user-friendly (doesn't contain technical terms), return as-is
    if (this.isUserFriendly(errorMessage)) {
      return errorMessage;
    }

    // Default user-friendly message
    return 'An error occurred. Please try again later.';
  }

  // Check if error message is user-friendly
  private isUserFriendly(message: string): boolean {
    const technicalTerms = [
      'fetch', 'parse', 'JSON', 'token', 'endpoint', 'API',
      'backend', 'frontend', 'database', 'SQL', 'PHP',
      'undefined', 'null', 'NaN', '400', '401', '403', '404', '500',
      'Request failed', 'Failed to', 'Error:', 'Exception'
    ];

    const lowerMessage = message.toLowerCase();
    return !technicalTerms.some(term => lowerMessage.includes(term.toLowerCase()));
  }

  // Log error details (only in development)
  logError(error: Error | string, context?: { path?: string; status?: number; [key: string]: any }): void {
    if (!this.isDevelopment) {
      return; // Don't log in production
    }

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorDetails: ErrorDetails = {
      originalMessage: errorMessage,
      path: context?.path,
      status: context?.status,
      timestamp: new Date().toISOString(),
    };

    console.group('❌ Error Details');
    console.error('Message:', errorMessage);
    if (context?.path) console.error('Path:', context.path);
    if (context?.status) console.error('Status:', context.status);
    if (context?.stack) console.error('Stack:', context.stack);
    console.groupEnd();
  }

  // Wrap an error with user-friendly message
  wrapError(error: Error | string, context?: { path?: string; status?: number }): Error {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const userMessage = this.getUserMessage(error);

    // Log in development
    this.logError(error, context);

    // Return error with user-friendly message
    const wrappedError = new Error(userMessage);

    // Attach original error details for debugging (only in development)
    if (this.isDevelopment) {
      (wrappedError as any).originalError = errorMessage;
      (wrappedError as any).context = context;
    }

    return wrappedError;
  }

  // Get development info (only in development)
  getDevInfo(error: Error): { originalError?: string; context?: any } | null {
    if (!this.isDevelopment) {
      return null;
    }

    return {
      originalError: (error as any).originalError,
      context: (error as any).context,
    };
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Helper function to handle errors consistently
export function handleApiError(error: any, context?: { path?: string; status?: number }): Error {
  if (error instanceof Error) {
    return errorHandler.wrapError(error, context);
  }

  if (typeof error === 'string') {
    return errorHandler.wrapError(new Error(error), context);
  }

  // Handle unknown error types
  const errorMessage = error?.message || String(error);
  return errorHandler.wrapError(new Error(errorMessage), context);
}

// Type guard to check if error has development info
export function hasDevInfo(error: Error): error is Error & { originalError: string; context: any } {
  return 'originalError' in error;
}
