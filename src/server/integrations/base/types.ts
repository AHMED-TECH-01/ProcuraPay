/**
 * Common Integration Types & Interfaces
 */

export interface IntegrationResult<T> {
  success: boolean;
  data?: T;
  error?: IntegrationError;
  source: string;
  durationMs: number;
  timestamp: string;
}

export interface IntegrationError {
  code: string;
  message: string;
  statusCode?: number;
  details?: unknown;
  isRetryable: boolean;
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 3000,
  backoffFactor: 2,
};

export async function executeWithRetry<T>(
  operationName: string,
  fn: () => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY
): Promise<T> {
  let attempt = 0;
  let delay = policy.initialDelayMs;

  while (attempt <= policy.maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt > policy.maxRetries) {
        throw err;
      }
      console.warn(
        `[Integration:${operationName}] Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * policy.backoffFactor, policy.maxDelayMs);
    }
  }

  throw new Error(`[Integration:${operationName}] Exceeded max retries.`);
}
