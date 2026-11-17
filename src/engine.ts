import * as vscode from 'vscode';
import { TrueFoundryClient } from './truefoundry';
import { StrategyExecutor, StrategyResult, ComparisonResult, StrategyConfig } from './types';

export interface EngineConfig {
    truefoundryApiKey: string;
    truefoundryEndpoint: string;
    maxParallelStrategies: number;
    defaultStrategies: string[];
}

export interface TaskConfig {
    description: string;
    strategies: string[];
    priority: 'low' | 'medium' | 'high';
}

export class SpeculativeEngine {
    private client: TrueFoundryClient;
    private config: EngineConfig;
    private executors: Map<string, StrategyExecutor> = new Map();

    constructor(config: EngineConfig) {
        this.config = config;
        this.client = new TrueFoundryClient(config.truefoundryApiKey, config.truefoundryEndpoint);
    }

    registerExecutor(name: string, executor: StrategyExecutor): void {
        this.executors.set(name, executor);
    }

    async execute(task: TaskConfig): Promise<ComparisonResult> {
        const strategies = task.strategies.length > 0 ? task.strategies : this.config.defaultStrategies;
        const executorsToRun = strategies
            .map(name => this.executors.get(name))
            .filter((e): e is StrategyExecutor => e !== undefined);

        if (executorsToRun.length === 0) {
            throw new Error('No valid strategies selected');
        }

        // Execute strategies in parallel (up to maxParallelStrategies)
        const allResults: StrategyResult[] = [];
        const batches = this.chunkArray(executorsToRun, this.config.maxParallelStrategies);

        for (const batch of batches) {
            const promises = batch.map(executor => this.executeStrategy(executor, task));
            const settled = await Promise.allSettled(promises);

            for (const result of settled) {
                if (result.status === 'fulfilled') {
                    allResults.push(result.value);
                }
            }
        }

        return this.buildComparison(allResults);
    }

    private async executeStrategy(executor: StrategyExecutor, task: { description: string }): Promise<StrategyResult> {
        const startTime = Date.now();
        try {
            const result = await executor.execute({ description: '' });
            return {
                strategyId: executor.constructor.name,
                strategyName: executor.constructor.name,
                philosophy: 'unknown',
                success: true,
                executionTime: Date.now() - startTime,
                ...result
            };
        } catch (error) {
            return {
                strategyId: executor.constructor.name,
                strategyName: executor.constructor.name,
                philosophy: 'unknown',
                success: false,
                executionTime: Date.now() - startTime,
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    private buildComparison(results: StrategyResult[]): any {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        // Simple scoring: prioritize successful, then faster, then higher coverage
        const scored = successful.map(r => ({
            ...r,
            score: (r.testResults?.coverage || 0) * 0.5 +
                   (1000 / (r.executionTime || 1)) * 0.3 +
                   (r.testResults?.passed || 0) * 0.2
        }));

        scored.sort((a, b) => b.score - a.score);

        return {
            task: 'Speculative execution',
            results,
            recommendedStrategyId: scored[0]?.strategyId,
            comparisonMatrix: {
                criteria: ['success', 'executionTime', 'coverage', 'testsPassed'],
                strategies: results.map(r => ({
                    name: r.strategyName,
                    philosophy: r.philosophy,
                    success: r.success,
                    executionTime: r.executionTime,
                    coverage: r.testResults?.coverage || 0,
                    testsPassed: r.testResults?.passed || 0,
                    score: scored.find(s => s.strategyId === r.strategyId)?.score || 0
                }))
            },
            timestamp: new Date().toISOString()
        };
    }

    dispose(): void {
        this.client.dispose();
    }
}