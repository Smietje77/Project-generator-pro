/**
 * Centralized Error Handling Utility
 * Provides consistent error handling, logging, and user-friendly messages
 */

import { showError } from './notifications';

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  details?: any;
  recoverable: boolean;
}

export class ApplicationError extends Error {
  code: string;
  userMessage: string;
  details?: any;
  recoverable: boolean;

  constructor(code: string, message: string, userMessage: string, recoverable = true, details?: any) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.userMessage = userMessage;
    this.recoverable = recoverable;
    this.details = details;
  }
}

/**
 * Error codes and their user-friendly messages
 */
export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    userMessage: 'Network connection failed. Please check your internet connection and try again.'
  },
  API_TIMEOUT: {
    code: 'API_TIMEOUT',
    userMessage: 'Request timed out. The server is taking too long to respond. Please try again.'
  },

  // Authentication errors
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    userMessage: 'You are not authorized to perform this action. Please refresh the page and try again.'
  },

  // Validation errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    userMessage: 'Some fields are missing or invalid. Please check your input and try again.'
  },
  MISSING_DATA: {
    code: 'MISSING_DATA',
    userMessage: 'Required data is missing. Please complete all required steps.'
  },

  // Generation errors
  GENERATION_FAILED: {
    code: 'GENERATION_FAILED',
    userMessage: 'Failed to generate project. Please try again or contact support if the problem persists.'
  },
  AI_ERROR: {
    code: 'AI_ERROR',
    userMessage: 'AI service error. The AI is temporarily unavailable. Please try again in a moment.'
  },

  // File system errors
  FILE_SYSTEM_ERROR: {
    code: 'FILE_SYSTEM_ERROR',
    userMessage: 'Failed to create or access files. Please check permissions and try again.'
  },
  DISK_FULL: {
    code: 'DISK_FULL',
    userMessage: 'Not enough disk space. Please free up some space and try again.'
  },

  // GitHub errors
  GITHUB_ERROR: {
    code: 'GITHUB_ERROR',
    userMessage: 'Failed to push to GitHub. Please check your credentials and try again.'
  },

  // Generic errors
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected error occurred. Please try again or contact support.'
  }
} as const;

/**
 * Handle errors consistently across the application
 */
export function handleError(error: unknown, context?: string): ApplicationError {
  console.error(`[ErrorHandler] Error in ${context || 'unknown context'}:`, error);

  // If it's already an ApplicationError, return it
  if (error instanceof ApplicationError) {
    return error;
  }

  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApplicationError(
      ErrorCodes.NETWORK_ERROR.code,
      error.message,
      ErrorCodes.NETWORK_ERROR.userMessage,
      true
    );
  }

  // Handle API errors
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('timeout')) {
      return new ApplicationError(
        ErrorCodes.API_TIMEOUT.code,
        error.message,
        ErrorCodes.API_TIMEOUT.userMessage,
        true
      );
    }

    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return new ApplicationError(
        ErrorCodes.UNAUTHORIZED.code,
        error.message,
        ErrorCodes.UNAUTHORIZED.userMessage,
        false
      );
    }

    if (error.message.includes('ENOSPC')) {
      return new ApplicationError(
        ErrorCodes.DISK_FULL.code,
        error.message,
        ErrorCodes.DISK_FULL.userMessage,
        false
      );
    }

    // Generic error
    return new ApplicationError(
      ErrorCodes.UNKNOWN_ERROR.code,
      error.message,
      ErrorCodes.UNKNOWN_ERROR.userMessage,
      true
    );
  }

  // Unknown error type
  return new ApplicationError(
    ErrorCodes.UNKNOWN_ERROR.code,
    String(error),
    ErrorCodes.UNKNOWN_ERROR.userMessage,
    true
  );
}

/**
 * Display error to user with optional retry action
 */
export function displayError(error: ApplicationError, retryCallback?: () => void): void {
  const options: any = {
    duration: error.recoverable ? 0 : 10000
  };

  if (error.recoverable && retryCallback) {
    options.action = {
      label: 'Retry',
      callback: retryCallback
    };
  }

  showError(error.userMessage, options);
}

/**
 * Validate required fields
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(String(field));
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('[ErrorHandler] JSON parse error:', error);
    return fallback;
  }
}

/**
 * Safe async operation with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const appError = handleError(error, context);
    displayError(appError);
    return fallback ?? null;
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[ErrorHandler] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
