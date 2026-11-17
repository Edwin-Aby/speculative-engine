export interface StrategyResult {
    strategyId: string;
    strategyName: string;
    philosophy: string;
    success: boolean;
    executionTime: number;
    testResults?: {
        passed: number;
        failed: number;
        skipped: number;
        coverage: number;
        duration: number;
        details?: any[];
    };
    benchmarks?: {
        latency?: { p50: number; p95: number; p99: number; max: number; unit: string };
        throughput?: { requestsPerSecond: number; concurrentUsers: number; unit: string };
        memory?: { heapUsed: number; heapTotal: number; rss: number; unit: string };
    };
    complexity?: {
        linesOfCode: number;
        cyclomaticComplexity: number;
        cognitiveComplexity: number;
        maintainabilityIndex: number;
        fileCount: number;
    };
    errors?: string[];
    metadata?: Record<string, any>;
}

export interface ComparisonResult {
    task: string;
    results: StrategyResult[];
    recommendedStrategyId: string;
    comparisonMatrix: {
        criteria: string[];
        strategies: Array<{
            name: string;
            philosophy: string;
            success: boolean;
            executionTime: number;
            coverage: number;
            testsPassed: number;
            score: number;
        }>;
    };
    timestamp: string;
}

export interface StrategyConfig {
    id: string;
    name: string;
    philosophy: string;
    config: Record<string, any>;
}

export interface EngineConfig {
    truefoundryApiKey: string;
    truefoundryEndpoint: string;
    maxParallelStrategies: number;
    defaultStrategies: string[];
}

export type StrategyPhilosophy = 'minimal' | 'robust' | 'performance' | 'custom';

export interface StrategyExecutor {
    execute(task: { description: string }): Promise<any>;
    getPhilosophy(): string;
    getName(): string;
}

export interface TrueFoundrySession {
    id: string;
    status: string;
    startTime: Date;
    endTime?: Date;
}

export interface TrueFoundryConfig {
    apiKey: string;
    endpoint: string;
}

export type StrategyPhilosophyType = 'minimal' | 'robust' | 'performance' | 'custom';