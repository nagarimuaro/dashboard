/**
 * Timeout utility functions for preventing hanging requests
 */

/**
 * Wraps a promise with a timeout
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} timeoutMessage - Custom timeout message
 * @returns {Promise} - Promise that rejects if timeout is reached
 */
export function withTimeout(promise, ms = 5000, timeoutMessage = 'Operation timed out') {
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, ms);
    
    // Clean up timeout if promise resolves first
    promise.finally(() => clearTimeout(timeoutId));
  });
  
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Creates a delay promise
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} - Promise that resolves after delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with the result or rejects after all retries
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: delay increases with each attempt
      const delayMs = baseDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }
}

/**
 * Safe async operation with timeout and fallback
 * @param {Function} operation - Async operation to perform
 * @param {Function} fallback - Fallback function if operation fails
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} - Promise that always resolves (with fallback if needed)
 */
export async function safeAsync(operation, fallback, timeout = 3000) {
  try {
    return await withTimeout(operation(), timeout);
  } catch (error) {
    console.warn('Operation failed, using fallback:', error.message);
    return await fallback();
  }
}

export default {
  withTimeout,
  delay,
  retryWithBackoff,
  safeAsync
};