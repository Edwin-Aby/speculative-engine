/**
 * Strategies Index - Export all strategy executors
 */

export { MinimalStrategy } from './minimal';
export { RobustStrategy } from './robust';
export { PerformanceStrategy } from './performance';
export { BaseStrategyExecutor } from './base';

export const STRATEGIES = {
  minimal: { id: 'minimal', name: 'Minimalist', philosophy: 'minimal' },
  robust: { id: 'robust', name: 'Robust/Production', philosophy: 'robust' },
  performance: { id: 'performance', name: 'Performance Optimized', philosophy: 'performance' },
} as const;

export type StrategyId = keyof typeof STRATEGIES;