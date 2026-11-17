/**
 * Speculative Engine - Core Orchestrator
 *
 * This is the main engine that coordinates parallel strategy execution.
 * It decomposes tasks, spawns parallel TrueFoundry sessions, and aggregates results.
 */

import {
  UserTask,
  Strategy,
  StrategyResult,
  OutcomeComparison,
  EngineConfig,
  DecomposedTask,
  StrategyRecommendation,
} from '../types';
import { TrueFoundryClient, SessionPool, createTrueFoundryClient, createSessionPool } from '../types/truefoundry';
import { StrategyExecutor, BaseStrategyExecutor } from '../strategies/base';
import { MinimalStrategy } from '../strategies/minimal';
import { RobustStrategy } from '../strategies/robust';
import { PerformanceStrategy } from '../strategies/performance';

import chalk from 'chalk';
import ora from 'ora';
import { v4 as uuidv4 } from 'uuid';

/**
 * Main Speculative Engine Class
 */
export class SpeculativeEngine {
  private config: EngineConfig;
  private client: TrueFoundryClient;
  private sessionPool: any;
  private strategies: Map<string, StrategyExecutor> = new Map();
  private strategyRegistry: Map<string, Strategy> = new Map();

  constructor(config: EngineConfig) {
    this.config = config;
    this.client = createTrueFoundryClient(config);
    this.sessionPool = createSessionPool(config.sessionPoolSize, this.client);

    // Register built-in strategies
    this.registerBuiltInStrategies();
  }

  /**
   * Register built-in strategy executors
   */
  private registerBuiltInStrategies(): void {
    const minimal = new MinimalStrategy();
    const robust = new RobustStrategy();
    const performance = new PerformanceStrategy();

    this.strategies.set('minimal', minimal);
    this.strategies.set('robust', robust);
    this.strategies.set('performance', performance);

    // Register strategy definitions
    this.strategyRegistry.set('minimal', {
      id: 'minimal',
      name: 'Minimalist',
      description: 'Minimal changes, least code, fastest implementation',
      philosophy: 'minimal',
      config: { maxTokens: 4000, temperature: 0.2, timeout: 120000 },
    });

    this.strategyRegistry.set('robust', {
      id: 'robust',
      name: 'Robust/Production',
      description: 'Production-ready with full error handling, observability, tests',
      philosophy: 'robust',
      config: { maxTokens: 8000, temperature: 0.3, timeout: 300000 },
    });

    this.strategyRegistry.set('performance', {
      id: 'performance',
      name: 'Performance Optimized',
      description: 'Optimized for speed, memory, and throughput',
      philosophy: 'performance',
      config: { maxTokens: 6000, temperature: 0.2, timeout: 240000 },
    });
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies(): Strategy[] {
    return Array.from(this.strategyRegistry.values());
  }

  /**
   * Register a custom strategy
   */
  registerStrategy(strategy: Strategy, executor: StrategyExecutor): void {
    this.strategyRegistry.set(strategy.id, strategy);
    this.strategies.set(strategy.id, executor);
  }

  /**
   * Main entry point: execute a task with multiple strategies in parallel
   */
  async execute(taskDescription: string, options: {
    strategies?: string[];
    targetRepository?: string;
    constraints?: string[];
    priority?: 'low' | 'medium' | 'high';
  } = {}): Promise<OutcomeComparison> {
    const spinner = ora('Initializing speculative engine...').start();

    try {
      // 1. Create user task
      const task = this.createTask(taskDescription, options);

      spinner.text = 'Decomposing task and planning strategies...';
      const decomposed = await this.decomposeTask(task);

      // 2. Select strategies to run
      const strategiesToRun = this.selectStrategies(options.strategies);
      spinner.text = `Running ${strategiesToRun.length} strategies in parallel...`;

      // 3. Execute strategies in parallel
      const results = await this.executeStrategiesParallel(task, strategiesToRun, decomposed);

      spinner.text = 'Aggregating results and building comparison...';
      // 4. Build outcome comparison
      const comparison = this.buildComparison(task, results);

      // 5. Determine recommended strategy
      const recommended = this.recommendStrategy(comparison);
      comparison.recommendedStrategyId = recommended;

      spinner.succeed(chalk.green('Speculative execution complete!'));

      return comparison;
    } catch (error) {
      spinner.fail(chalk.red('Speculative execution failed'));
      throw error;
    }
  }

  /**
   * Create a UserTask from description and options
   */
  private createTask(description: string, options: any): any {
    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description,
      context: {},
      constraints: options.constraints || [],
      targetRepository: options.targetRepository,
      priority: options.priority || 'medium',
      createdAt: new Date(),
    };
  }

  /**
   * Decompose task into subtasks and recommend strategies
   * In a real implementation, this would use an LLM to analyze the task
   */
  private async decomposeTask(task: any): Promise<any> {
    // For now, return a simple decomposition
    // In production, this would use an LLM to analyze the task
    return {
      originalTask: task,
      subtasks: [
        {
          id: 'subtask-1',
          description: task.description,
          dependencies: [],
          estimatedComplexity: 'medium',
          suggestedStrategies: ['minimal', 'robust', 'performance'],
        },
      ],
      strategyRecommendations: [
        {
          subtaskId: 'subtask-1',
          recommendedStrategies: ['minimal', 'robust', 'performance'],
          reasoning: 'Standard CRUD/auth task benefits from comparing minimal, robust, and performant approaches',
        },
      ],
    };
  }

  /**
   * Select which strategies to run
   */
  private selectStrategies(strategyIds?: string[]): Strategy[] {
    if (!strategyIds || strategyIds.length === 0) {
      // Default: run all built-in strategies
      return this.getAvailableStrategies();
    }

    return strategyIds
      .map(id => this.strategyRegistry.get(id))
      .filter((s): s is Strategy => s !== undefined);
  }

  /**
   * Execute multiple strategies in parallel
   */
  private async executeStrategiesParallel(
    task: any,
    strategies: Strategy[],
    decomposed: any
  ): Promise<StrategyResult[]> {
    const spinner = ora('Spawning parallel TrueFoundry sessions...').start();

    try {
      // Create execution promises for each strategy
      const executionPromises = strategies.map(async (strategy) => {
        const executor = this.strategies.get(strategy.id);
        if (!executor) {
          throw new Error(`No executor found for strategy: ${strategy.id}`);
        }

        const strategySpinner = ora(`${strategy.name} strategy executing...`).start();

        try {
          const result = await executor.execute(task, strategy);
          strategySpinner.succeed(chalk.green(`${strategy.name} completed`));
          return result;
        } catch (error) {
          strategySpinner.fail(chalk.red(`${strategy.name} failed`));
          // Return a failed result instead of throwing
          return {
            strategyId: strategy.id,
            strategyName: strategy.name,
            philosophy: strategy.philosophy,
            success: false,
            changes: [],
            testResults: { passed: 0, failed: 0, skipped: 0, duration: 0, details: [] },
            benchmarks: {},
            complexity: { linesOfCode: 0, cyclomaticComplexity: 0, cognitiveComplexity: 0, maintainabilityIndex: 0, fileCount: 0 },
            executionTime: 0,
            tokensUsed: 0,
            cost: 0,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      });

      // Execute all strategies in parallel
      const results = await Promise.all(executionPromises);
      spinner.succeed(chalk.green('All strategies completed'));

      return results;
    } catch (error) {
      spinner.fail(chalk.red('Parallel execution failed'));
      throw error;
    }
  }

  /**
   * Build outcome comparison from results
   */
  private buildComparison(task: any, results: StrategyResult[]): OutcomeComparison {
    // Define comparison criteria
    const criteria = [
      { id: 'testPassRate', name: 'Test Pass Rate', weight: 0.30, higherIsBetter: true, description: 'Percentage of tests passing' },
      { id: 'executionTime', name: 'Execution Time', weight: 0.15, higherIsBetter: false, description: 'Total execution time in ms' },
      { id: 'complexity', name: 'Code Complexity', weight: 0.20, higherIsBetter: false, description: 'Cyclomatic complexity' },
      { id: 'testCoverage', name: 'Test Coverage', weight: 0.15, higherIsBetter: true, description: 'Code coverage percentage' },
      { id: 'performance', name: 'Performance Score', weight: 0.20, higherIsBetter: true, description: 'Benchmark performance score' },
    ];

    // Calculate scores for each strategy
    const strategies = results.map(result => {
      const testPassRate = result.testResults.passed + result.testResults.failed > 0
        ? result.testResults.passed / (result.testResults.passed + result.testResults.failed) * 100
        : 0;

      const performanceScore = result.benchmarks.latency
        ? (1000 / (result.benchmarks.latency.p95 || 1)) * 100
        : 50;

      return {
        strategyId: result.strategyId,
        strategyName: result.strategyName,
        philosophy: result.philosophy,
        scores: {
          testPassRate,
          executionTime: result.executionTime,
          complexity: result.complexity.cyclomaticComplexity || 0,
          testCoverage: result.testResults.coverage || 0,
          performance: Math.min(100, performanceScore),
        },
      };
    });

    // Rank strategies
    const ranked = this.rankStrategies(strategies, [
      { id: 'testPassRate', weight: 0.30, higherIsBetter: true },
      { id: 'executionTime', weight: 0.15, higherIsBetter: false },
      { id: 'complexity', weight: 0.20, higherIsBetter: false },
      { id: 'testCoverage', weight: 0.15, higherIsBetter: true },
      { id: 'performance', weight: 0.20, higherIsBetter: true },
    ]);

    return {
      taskId: 'task-1',
      taskDescription: 'Task description',
      results,
      recommendedStrategyId: ranked[0]?.strategyId || '',
      comparisonMatrix: {
        criteria: [
          { id: 'testPassRate', name: 'Test Pass Rate', weight: 0.30, higherIsBetter: true, description: 'Percentage of tests passing' },
          { id: 'executionTime', name: 'Execution Time', weight: 0.15, higherIsBetter: false, description: 'Total execution time in ms' },
          { id: 'complexity', name: 'Code Complexity', weight: 0.20, higherIsBetter: false, description: 'Cyclomatic complexity' },
          { id: 'testCoverage', name: 'Test Coverage', weight: 0.15, higherIsBetter: true, description: 'Code coverage percentage' },
          { id: 'performance', name: 'Performance Score', weight: 0.20, higherIsBetter: true, description: 'Benchmark performance score' },
        ],
        strategies: ranked,
      },
      createdAt: new Date(),
    };
  }

  /**
   * Rank strategies based on weighted criteria
   */
  private rankStrategies(
    strategies: any[],
    criteria: Array<{ id: string; weight: number; higherIsBetter: boolean }>
  ): any[] {
    return strategies
      .map(strategy => {
        let score = 0;
        for (const criterion of criteria) {
          const value = strategy.scores[criterion.id] || 0;
          const normalized = criterion.higherIsBetter ? value : 100 - value;
          score += normalized * criterion.weight;
        }
        return { ...strategy, totalScore: score };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }

  /**
   * Recommend the best strategy based on comparison
   */
  private recommendStrategy(comparison: OutcomeComparison): string {
    return comparison.comparisonMatrix.strategies[0]?.strategyId || '';
  }

  /**
   * Get engine status
   */
  getStatus(): { strategies: number; poolStatus: any } {
    return {
      strategies: this.strategies.size,
      poolStatus: this.sessionPool?.getStatus?.() || { active: 0, queued: 0, maxConcurrent: this.config.sessionPoolSize },
    };
  }
}

/**
 * Create a new SpeculativeEngine instance
 */
export function createEngine(config: {
  truefoundryApiKey: string;
  truefoundryEndpoint: string;
  sessionPoolSize?: number;
  defaultTimeout?: number;
  maxParallelStrategies?: number;
}): SpeculativeEngine {
  const engineConfig = {
    truefoundryApiKey: config.truefoundryApiKey,
    truefoundryEndpoint: config.truefoundryEndpoint,
    sessionPoolSize: config.sessionPoolSize || 4,
    defaultTimeout: config.defaultTimeout || 180000,
    maxParallelStrategies: config.maxParallelStrategies || 4,
    enableCaching: true,
    cacheDir: './.cache',
  };

  return new SpeculativeEngine(engineConfig);
}