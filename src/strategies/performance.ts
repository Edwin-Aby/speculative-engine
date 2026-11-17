/**
 * Performance Strategy Executor
 *
 * Philosophy: Optimized for speed, memory, and throughput.
 * Focus on low latency, high throughput, minimal resource usage.
 */

import { BaseStrategyExecutor } from './base';

/**
 * Performance Strategy - Optimized for speed and throughput
 */
export class PerformanceStrategy extends BaseStrategyExecutor {
  constructor() {
    super('performance');
  }

  getPhilosophy(): string {
    return 'performance';
  }

  buildPrompt(task: any, strategy: any): string {
    return `
You are a Performance Engineer. Your philosophy: "Fast is a feature. Every millisecond counts."

TASK: ${task.description}

CONSTRAINTS:
${task.constraints?.join('\n') || 'None'}

YOUR APPROACH:
- Optimize for latency (p50, p95, p99)
- Maximize throughput (requests/second)
- Minimize memory footprint
- Use caching aggressively (Redis, in-memory)
- Connection pooling for databases
- Async/await with proper concurrency control
- Avoid blocking operations
- Efficient algorithms and data structures
- Lazy loading and code splitting
- Minimal dependencies, tree-shaking
- Profile-guided optimization
- Benchmark-driven development

DELIVERABLE:
- Sub-millisecond latency where possible
- High throughput (2000+ req/s)
- Low memory footprint
- Benchmarks included

OUTPUT FORMAT:
Return a JSON object with:
{
  "changes": [{"path": "...", "newContent": "...", "changeType": "create|modify", "description": "..."}],
  "testResults": {"passed": 12, "failed": 0, "skipped": 0, "duration": 2000, "details": [], "coverage": 70},
  "benchmarks": {"latency": {"p50": 8, "p95": 20, "p99": 40, "max": 80, "unit": "ms"}, "throughput": {"requestsPerSecond": 2500, "concurrentUsers": 200, "unit": "req/s"}, "memory": {"heapUsed": 40, "heapTotal": 70, "rss": 100, "unit": "MB"}},
  "complexity": {"linesOfCode": 420, "cyclomaticComplexity": 6, "cognitiveComplexity": 10, "maintainabilityIndex": 88, "fileCount": 7},
  "tokensUsed": 0,
  "cost": 0,
  "success": true
}
`;
  }

  parseResult(response: any): any {
    return {
      ...response,
      metadata: {
        philosophy: 'performance',
        approach: 'Optimized for speed and throughput',
        tradeoffs: 'Less error handling, fewer features, but maximum speed',
      },
    };
  }
}