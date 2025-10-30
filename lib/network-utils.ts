/**
 * Network utilities for handling API requests with comprehensive error handling
 */

export interface NetworkError extends Error {
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isAuthError?: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

/**
 * Enhanced fetch with timeout, retry logic, and comprehensive error handling
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
  let lastError: NetworkError | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Check for HTTP error status
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as NetworkError;
        error.status = response.status;
        error.isNetworkError = true;
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw error;
        }
        
        // Don't retry on server errors (5xx) if it's the last attempt
        if (response.status >= 500 && attempt === retryConfig.maxRetries) {
          throw error;
        }
        
        lastError = error;
        if (attempt < retryConfig.maxRetries) {
          await delay(calculateDelay(attempt, retryConfig));
          continue;
        }
        
        throw error;
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Handle different error types
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout') as NetworkError;
        timeoutError.isTimeoutError = true;
        timeoutError.isNetworkError = true;
        lastError = timeoutError;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network connection failed') as NetworkError;
        networkError.isNetworkError = true;
        lastError = networkError;
      } else if (error.status === 401 || error.status === 403) {
        const authError = new Error('Authentication failed') as NetworkError;
        authError.isAuthError = true;
        authError.isNetworkError = true;
        lastError = authError;
      }
      
      // Don't retry on the last attempt
      if (attempt === retryConfig.maxRetries) {
        break;
      }
      
      // Don't retry on certain error types
      if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404) {
        break;
      }
      
      // Wait before retrying
      await delay(calculateDelay(attempt, retryConfig));
    }
  }
  
  throw lastError || new Error('Unknown network error');
}

/**
 * Calculate delay for retry attempts with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Delay utility function
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is a network-related error
 */
export function isNetworkError(error: any): boolean {
  return error?.isNetworkError || 
         error?.name === 'TypeError' && error?.message?.includes('fetch') ||
         error?.name === 'AbortError' ||
         error?.code === 'ENOTFOUND' ||
         error?.code === 'ECONNREFUSED' ||
         error?.code === 'ETIMEDOUT';
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (error?.isTimeoutError) {
    return 'Request timed out. Please check your internet connection and try again.';
  }
  
  if (error?.isAuthError) {
    return 'Authentication failed. Please check your API keys and try again.';
  }
  
  if (error?.isNetworkError || isNetworkError(error)) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (error?.status === 429) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  }
  
  if (error?.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  if (error?.status === 503) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  
  return error?.message || 'An unexpected error occurred.';
}

/**
 * Log network errors with context
 */
export function logNetworkError(error: any, context: string, url?: string): void {
  console.error(`[Network Error] ${context}:`, {
    message: error?.message,
    status: error?.status,
    code: error?.code,
    url,
    timestamp: new Date().toISOString(),
  });
}
