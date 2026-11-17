/**
 * Minimal Strategy Executor
 *
 * Philosophy: Minimal changes, least code, fastest implementation.
 * Focus on getting the job done with the least amount of code.
 */

import { BaseStrategyExecutor } from './base';
import { StrategyResult } from '../types';

/**
 * Minimal Strategy - Least code, fastest implementation
 */
export class MinimalStrategy extends BaseStrategyExecutor {
  constructor() {
    super('minimal');
  }

  getPhilosophy(): string {
    return 'minimal';
  }

  /**
   * Build prompt for minimal strategy
   */
  buildPrompt(task: any, strategy: any): string {
    return `
You are a Minimalist Developer. Your philosophy: "Less is more. Do the simplest thing that works."

TASK: ${task.description}

CONSTRAINTS:
${task.constraints?.join('\n') || 'None'}

YOUR APPROACH:
- Write the ABSOLUTE MINIMUM code needed
- No unnecessary abstractions, no over-engineering
- Use standard libraries, avoid custom implementations
- No tests unless absolutely critical
- No configuration files unless absolutely necessary
- Single file solutions preferred
- Direct, straightforward implementation
- "Good enough" is perfect

DELIVERABLE:
- Working implementation with minimal files
- Clear, simple code that a junior dev can understand
- No unnecessary complexity

OUTPUT FORMAT:
Return a JSON object with:
{
  "changes": [{"path": "...", "newContent": "...", "changeType": "create|modify", "description": "..."}],
  "testResults": {"passed": 0, "failed": 0, "skipped": 0, "duration": 0, "details": []},
  "benchmarks": {...},
  "complexity": {...},
  "tokensUsed": 0,
  "cost": 0,
  "success": true
}
`;
  }

  /**
   * Parse result from TrueFoundry response
   */
  parseResult(response: any): any {
    // Enhance with minimal philosophy metadata
    return {
      ...response,
      metadata: {
        philosophy: 'minimal',
        approach: 'Simplest possible implementation',
        tradeoffs: 'No tests, no error handling, minimal validation',
      },
    };
  }
}