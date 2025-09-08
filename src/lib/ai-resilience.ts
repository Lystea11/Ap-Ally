// AI Resilience Manager - Handles model overload and provides fallback strategies
import { ai } from '@/ai/genkit';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface QueueItem {
  id: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

class AIResilienceManager {
  private queue: QueueItem[] = [];
  private processing = false;
  private circuitOpen = false;
  private failureCount = 0;
  private lastFailureTime = 0;
  private requestCount = 0;
  private windowStart = Date.now();

  private readonly retryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2
  };

  private readonly circuitConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 300000 // 5 minutes
  };

  private readonly rateLimits = {
    requestsPerMinute: 60,
    requestsPerWindow: this.circuitConfig.monitoringPeriod / 60000 * 60
  };

  async executeWithResilience<T>(
    operation: () => Promise<T>,
    options: {
      priority?: 'high' | 'medium' | 'low';
      timeout?: number;
      fallbackModel?: string;
    } = {}
  ): Promise<T> {
    const { priority = 'medium', timeout = 120000 } = options;

    // Check circuit breaker
    if (this.isCircuitOpen()) {
      throw new Error('Circuit breaker is open. AI service temporarily unavailable.');
    }

    // Check rate limits
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        id: Math.random().toString(36).substr(2, 9),
        execute: async () => {
          const timeoutPromise = new Promise((_, rejectTimeout) => {
            setTimeout(() => rejectTimeout(new Error('Request timeout')), timeout);
          });

          try {
            const result = await Promise.race([
              this.executeWithRetry(operation, options.fallbackModel),
              timeoutPromise
            ]);
            this.onSuccess();
            return result;
          } catch (error) {
            this.onFailure(error as Error);
            throw error;
          }
        },
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      };

      this.addToQueue(queueItem);
      this.processQueue();
    });
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    fallbackModel?: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (!this.isRetryableError(error as Error)) {
          throw error;
        }

        if (attempt === this.retryConfig.maxRetries) {
          // Try fallback model if available
          if (fallbackModel && this.isModelOverloadError(error as Error)) {
            try {
              console.warn(`Falling back to ${fallbackModel} due to model overload`);
              return await this.executeWithFallbackModel(operation, fallbackModel);
            } catch (fallbackError) {
              console.error('Fallback model also failed:', fallbackError);
            }
          }
          break;
        }

        const delay = this.calculateDelay(attempt);
        console.warn(`AI request failed (attempt ${attempt + 1}), retrying in ${delay}ms:`, error);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private async executeWithFallbackModel<T>(
    operation: () => Promise<T>,
    fallbackModel: string
  ): Promise<T> {
    // This would need to be implemented based on your specific genkit setup
    // For now, we'll just retry with exponential backoff
    await this.sleep(2000);
    return operation();
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'model overloaded',
      'rate limit exceeded',
      'timeout',
      'service unavailable',
      'internal server error',
      '429',
      '500',
      '502',
      '503',
      '504'
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(pattern => errorMessage.includes(pattern));
  }

  private isModelOverloadError(error: Error): boolean {
    const overloadPatterns = [
      'model overloaded',
      'model is overloaded',
      'too many requests',
      'service overloaded'
    ];

    const errorMessage = error.message.toLowerCase();
    return overloadPatterns.some(pattern => errorMessage.includes(pattern));
  }

  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
    return Math.min(delay + jitter, this.retryConfig.maxDelay);
  }

  private addToQueue(item: QueueItem): void {
    this.queue.push(item);
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.timestamp - b.timestamp;
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && !this.isCircuitOpen()) {
      const item = this.queue.shift()!;

      try {
        const result = await item.execute();
        item.resolve(result);
      } catch (error) {
        item.reject(error as Error);
      }

      // Add small delay between requests to avoid overwhelming the service
      await this.sleep(100);
    }

    this.processing = false;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const windowElapsed = now - this.windowStart;

    // Reset window if needed
    if (windowElapsed >= this.circuitConfig.monitoringPeriod) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // Check if we can make this request
    if (this.requestCount >= this.rateLimits.requestsPerWindow) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  private isCircuitOpen(): boolean {
    if (!this.circuitOpen) {
      return false;
    }

    // Check if we should try to close the circuit
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    if (timeSinceLastFailure >= this.circuitConfig.resetTimeout) {
      console.log('Attempting to close circuit breaker');
      this.circuitOpen = false;
      this.failureCount = 0;
    }

    return this.circuitOpen;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.circuitOpen) {
      console.log('Circuit breaker closed after successful request');
      this.circuitOpen = false;
    }
  }

  private onFailure(error: Error): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.circuitConfig.failureThreshold) {
      console.warn(`Circuit breaker opened after ${this.failureCount} failures`);
      this.circuitOpen = true;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for monitoring
  getStatus() {
    return {
      queueLength: this.queue.length,
      circuitOpen: this.circuitOpen,
      failureCount: this.failureCount,
      requestCount: this.requestCount,
      processing: this.processing
    };
  }

  clearQueue(): void {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

// Singleton instance
export const aiResilience = new AIResilienceManager();

// Helper function for easy integration
export async function withAIResilience<T>(
  operation: () => Promise<T>,
  options?: {
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
    fallbackModel?: string;
  }
): Promise<T> {
  return aiResilience.executeWithResilience(operation, options);
}