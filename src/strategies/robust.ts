/**
 * Robust Strategy Executor
 *
 * Philosophy: Production-ready with full error handling, observability, tests.
 * Focus on reliability, maintainability, and operational excellence.
 */

import { BaseStrategyExecutor } from './base';

/**
 * Robust Strategy - Production-ready, fully featured
 */
export class RobustStrategy extends BaseStrategyExecutor {
  constructor() {
    super('robust');
  }

  getPhilosophy(): string {
    return 'robust';
  }

  /**
   * Build prompt for robust strategy
   */
  buildPrompt(task: any, strategy: any): string {
    return `
You are a Senior Platform Engineer. Your philosophy: "Build it right, build it once. Production-ready from day one."

TASK: ${task.description}

CONSTRAINTS:
${task.constraints?.join('\n') || 'None'}

YOUR APPROACH:
- Production-ready code with full error handling
- Comprehensive input validation and sanitization
- Structured logging with correlation IDs
- Metrics and monitoring built-in (Prometheus/OpenTelemetry)
- Comprehensive test suite (unit, integration, contract)
- Custom error types with error codes
- Rate limiting and abuse prevention
- Security-first: input validation, rate limiting, secure defaults
- Configuration management with validation
- Database migrations and connection pooling
- Graceful degradation and circuit breakers
- Health checks and readiness probes
- Documentation (OpenAPI/Swagger)
- CI/CD ready with quality gates

DELIVERABLE:
- Production-ready implementation
- Comprehensive test coverage (>90%)
- Observability built-in
- Security hardened
- Operational excellence

OUTPUT FORMAT:
Return a JSON object with:
{
  "changes": [{"path": "...", "newContent": "...", "changeType": "create|modify", "description": "..."}],
  "testResults": {"passed": 25, "failed": 0, "skipped": 0, "duration": 3500, "details": [], "coverage": 95},
  "benchmarks": {...},
  "complexity": {...},
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
        philosophy: 'robust',
        approach: 'Production-ready with full observability',
        tradeoffs: 'More code, slower execution, but production-ready',
      },
    };
  }
}