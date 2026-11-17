import { StrategyExecutor, StrategyResult, StrategyConfig, StrategyPhilosophy } from '../types';

export abstract class BaseStrategyExecutor implements StrategyExecutor {
    protected config: StrategyConfig;

    constructor(config: StrategyConfig) {
        this.config = config;
    }

    abstract getPhilosophy(): string;
    abstract getName(): string;
    abstract execute(task: { description: string }): Promise<any>;

    protected createResult(data: Partial<StrategyResult>): StrategyResult {
        return {
            strategyId: this.constructor.name.toLowerCase().replace('strategy', ''),
            strategyName: this.getName(),
            philosophy: this.getPhilosophy(),
            success: true,
            executionTime: 0,
            testResults: { passed: 0, failed: 0, skipped: 0, coverage: 0, duration: 0 },
            benchmarks: { latency: { p50: 0, p95: 0, p99: 0, max: 0, unit: 'ms' }, throughput: { requestsPerSecond: 0, concurrentUsers: 0, unit: 'req/s' }, memory: { heapUsed: 0, heapTotal: 0, rss: 0, unit: 'MB' } },
            complexity: { linesOfCode: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0, maintainabilityIndex: 0, fileCount: 0 },
            ...data
        };
    }
}