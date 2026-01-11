/**
 * Retry Utilities
 * 
 * Implements exponential backoff retry logic for failed requests.
 */

import { SCRAPER_CONFIG } from '../scraper.config';

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
export function getExponentialBackoffDelay(attempt: number): number {
    const { retryBaseDelayMs, retryMultiplier, maxRetryDelayMs } = SCRAPER_CONFIG;

    const delay = retryBaseDelayMs * Math.pow(retryMultiplier, attempt);
    return Math.min(delay, maxRetryDelayMs);
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        onRetry?: (error: Error, attempt: number) => void;
        shouldRetry?: (error: Error) => boolean;
    } = {},
): Promise<T> {
    const {
        maxRetries = SCRAPER_CONFIG.maxRetries,
        onRetry,
        shouldRetry = () => true,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Check if we should retry this error
            if (!shouldRetry(lastError)) {
                throw lastError;
            }

            // If this was the last attempt, throw the error
            if (attempt === maxRetries) {
                throw lastError;
            }

            // Calculate backoff delay
            const delay = getExponentialBackoffDelay(attempt);

            // Call retry callback if provided
            if (onRetry) {
                onRetry(lastError, attempt + 1);
            }

            // Wait before retrying
            await sleep(delay);
        }
    }

    throw lastError!;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
    const retryableMessages = [
        'timeout',
        'network',
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'socket hang up',
        'Navigation timeout',
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableMessages.some(msg => errorMessage.includes(msg.toLowerCase()));
}
