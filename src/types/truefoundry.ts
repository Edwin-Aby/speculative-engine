/**
 * TrueFoundry SDK Integration Module
 *
 * This module wraps the TrueFoundry SDK to provide a clean interface
 * for managing sessions, executing tasks, and retrieving results.
 */

import { TrueFoundrySession, EngineConfig, StrategyResult, UserTask, Strategy } from '../types';

/**
 * TrueFoundry client wrapper
 */
export class TrueFoundryClient {
  private apiKey: string;
  private endpoint: string;
  private baseUrl: string;

  constructor(config: EngineConfig) {
    this.apiKey = config.truefoundryApiKey;
    this.endpoint = config.truefoundryEndpoint;
    this.baseUrl = config.truefoundryEndpoint.replace(/\/+$/, '');
  }

  /**
   * Create a new TrueFoundry session for a strategy
   */
  async createSession(task: UserTask, strategy: Strategy): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: {
          id: task.id,
          description: task.description,
          context: task.context,
        },
        strategy: {
          id: strategy.id,
          name: strategy.name,
          philosophy: strategy.philosophy,
          config: strategy.config,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create session: ${error}`);
    }

    const data = await response.json();
    return data.sessionId;
  }

  /**
   * Start a session execution
   */
  async startSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start session: ${error}`);
    }
  }

  /**
   * Get session status and results
   */
  async getSession(sessionId: string): Promise<TrueFoundrySession> {
    const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get session: ${error}`);
    }

    return response.json();
  }

  /**
   * Poll session until completion
   */
  async waitForCompletion(sessionId: string, timeoutMs: number = 300000): Promise<StrategyResult> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < timeoutMs) {
      const session = await this.getSession(sessionId);

      if (session.status === 'completed') {
        if (!session.result) {
          throw new Error('Session completed but no result returned');
        }
        return session.result;
      }

      if (session.status === 'failed') {
        throw new Error(`Session failed: ${session.logs.join('\n')}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Session timed out after ${timeoutMs}ms`);
  }

  /**
   * Cancel a running session
   */
  async cancelSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to cancel session: ${error}`);
    }
  }

  /**
   * Get session logs
   */
  async getLogs(sessionId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}/logs`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get logs: ${error}`);
    }

    return response.json();
  }
}

/**
 * Session Pool for managing concurrent TrueFoundry sessions
 */
export class SessionPool {
  private maxConcurrent: number;
  private activeSessions: Map<string, { sessionId: string; startTime: number }> = new Map();
  private queue: Array<{ task: any; strategy: any; resolve: Function; reject: Function }> = [];
  private client: TrueFoundryClient;
  private maxWaitTime: number = 300000; // 5 minutes

  constructor(maxConcurrent: number, client: TrueFoundryClient) {
    this.maxConcurrent = maxConcurrent;
    this.client = client;
  }

  /**
   * Execute a strategy in the pool (queues if at capacity)
   */
  async execute(task: any, strategy: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // If at capacity, queue the task
      if (this.activeSessions.size >= this.maxConcurrent) {
        this.queue.push({ task, strategy, resolve, reject });
        return;
      }

      // Execute immediately
      await this.executeNow(task, strategy, resolve, reject);
    });
  }

  /**
   * Execute a strategy immediately
   */
  private async executeNow(
    task: any,
    strategy: any,
    resolve: Function,
    reject: Function
  ): Promise<void> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    this.activeSessions.set(sessionId, { sessionId, startTime });

    try {
      // Create and start session
      const tfSessionId = await this.client.createSession(task, strategy);
      await this.client.startSession(tfSessionId);

      // Wait for completion
      const result = await this.client.waitForCompletion(tfSessionId);

      // Clean up
      this.activeSessions.delete(sessionId);
      this.processQueue();

      resolve(result);
    } catch (error) {
      this.activeSessions.delete(sessionId);
      this.processQueue();
      reject(error);
    }
  }

  /**
   * Process the next item in the queue
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;
    if (this.activeSessions.size >= this.maxConcurrent) return;

    const next = this.queue.shift();
    if (next) {
      this.executeNow(next.task, next.strategy, next.resolve, next.reject);
    }
  }

  /**
   * Get current pool status
   */
  getStatus(): { active: number; queued: number; maxConcurrent: number } {
    return {
      active: this.activeSessions.size,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Cancel all sessions
   */
  async cancelAll(): Promise<void> {
    // Cancel active sessions
    for (const [sessionId] of this.activeSessions) {
      try {
        // Note: We'd need to track TrueFoundry session IDs to cancel them
        // This is a simplified version
      } catch (error) {
        console.error(`Failed to cancel session: ${error}`);
      }
    }

    // Reject queued tasks
    for (const item of this.queue) {
      item.reject(new Error('Pool cancelled'));
    }
    this.queue = [];
  }
}

/**
 * Create a TrueFoundry client from engine config
 */
export function createTrueFoundryClient(config: {
  truefoundryApiKey: string;
  truefoundryEndpoint: string;
}): TrueFoundryClient {
  return new TrueFoundryClient(config as any);
}

/**
 * Create a session pool
 */
export function createSessionPool(
  maxConcurrent: number,
  client: TrueFoundryClient
): any {
  return {
    maxConcurrent,
    client,
    activeSessions: new Map(),
    queue: [],
    async execute(task: any, strategy: any) {
      // Simplified pool execution - in production, use the full SessionPool class
      return client.waitForCompletion(
        await client.createSession(task, strategy)
      );
    },
  };
}