/**
 * Core type definitions for the Speculative Multi-Timeline Engine
 *
 * This module defines the fundamental types used across the engine.
 * Each strategy executor implements the StrategyExecutor interface.
 */

/**
 * Represents a user request/task to be solved by the speculative engine
 */
export interface UserTask {
  id: string;
  description: string;
  context?: Record<string, any>;
  constraints?: string[];
  targetRepository?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

/**
 * Represents a single strategy approach to solving a task
 */
export interface Strategy {
  id: string;
  name: string;
  description: string;
  philosophy: StrategyPhilosophy;
  config: StrategyConfig;
}

/**
 * Philosophy categories for strategies
 */
export type StrategyPhilosophy =
  | 'minimal'      // Minimal changes, least code
  | 'robust'       // Production-ready with full error handling
  | 'performance'  // Optimized for speed/memory
  | 'secure'       // Security-first approach
  | 'maintainable' // Clean architecture, easy to extend
  | 'custom';      // User-defined philosophy

/**
 * Configuration for a strategy executor
 */
export interface StrategyConfig {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  timeout?: number;
  maxRetries?: number;
  customParams?: Record<string, any>;
}

/**
 * Result of executing a strategy
 */
export interface StrategyResult {
  strategyId: string;
  strategyName: string;
  philosophy: StrategyPhilosophy;
  success: boolean;
  changes: FileChange[];
  testResults: TestResult;
  benchmarks: BenchmarkResult;
  complexity: ComplexityMetrics;
  executionTime: number;
  tokensUsed: number;
  cost: number;
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

/**
 * Represents a file change made by a strategy
 */
export interface FileChange {
  path: string;
  originalContent?: string;
  newContent: string;
  changeType: 'create' | 'modify' | 'delete' | 'rename';
  description: string;
  diff: string;
}

/**
 * Test execution results
 */
export interface TestResult {
  passed: number;
  failed: number;
  skipped: number;
  coverage?: number;
  duration: number;
  details: TestDetail[];
}

/**
 * Individual test detail
 */
export interface TestDetail {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

/**
 * Performance benchmarks
 */
export interface BenchmarkResult {
  latency?: LatencyMetrics;
  throughput?: ThroughputMetrics;
  memory?: MemoryMetrics;
  custom?: Record<string, number>;
}

/**
 * Latency measurements
 */
export interface LatencyMetrics {
  p50: number;
  p95: number;
  p99: number;
  max: number;
  unit: 'ms' | 'us';
}

/**
 * Throughput measurements
 */
export interface ThroughputMetrics {
  requestsPerSecond: number;
  concurrentUsers: number;
  unit: 'req/s';
}

/**
 * Memory usage metrics
 */
export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  unit: 'MB';
}

/**
 * Code complexity metrics
 */
export interface ComplexityMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  fileCount: number;
}

/**
 * Outcome comparison for the viewer
 */
export interface OutcomeComparison {
  taskId: string;
  taskDescription: string;
  results: StrategyResult[];
  recommendedStrategyId: string;
  comparisonMatrix: ComparisonMatrix;
  createdAt: Date;
}

/**
 * Side-by-side comparison matrix
 */
export interface ComparisonMatrix {
  criteria: ComparisonCriteria[];
  strategies: StrategyComparison[];
}

/**
 * Comparison criteria definition
 */
export interface ComparisonCriteria {
  id: string;
  name: string;
  weight: number;
  higherIsBetter: boolean;
  description: string;
}

/**
 * Strategy comparison row
 */
export interface StrategyComparison {
  strategyId: string;
  strategyName: string;
  philosophy: StrategyPhilosophy;
  scores: Record<string, number>;
  rank: number;
}

/**
 * TrueFoundry session interface
 */
export interface TrueFoundrySession {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  logs: string[];
  result?: StrategyResult;
}

/**
 * Session pool for managing parallel TrueFoundry sessions
 */
export interface SessionPool {
  maxConcurrent: number;
  activeSessions: Map<string, TrueFoundrySession>;
  queue: string[];
}

/**
 * Configuration for the speculative engine
 */
export interface EngineConfig {
  maxParallelStrategies: number;
  defaultTimeout: number;
  truefoundryApiKey: string;
  truefoundryEndpoint: string;
  sessionPoolSize: number;
  enableCaching: boolean;
  cacheDir: string;
}

/**
 * Task decomposition result
 */
export interface DecomposedTask {
  originalTask: UserTask;
  subtasks: Subtask[];
  strategyRecommendations: StrategyRecommendation[];
}

/**
 * Individual subtask
 */
export interface Subtask {
  id: string;
  description: string;
  dependencies: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  suggestedStrategies: string[];
}

/**
 * Strategy recommendation for a subtask
 */
export interface StrategyRecommendation {
  subtaskId: string;
  recommendedStrategies: string[];
  reasoning: string;
}