#!/usr/bin/env node
/**
 * Demo Script - Run Speculative Engine on Demo Flask API
 *
 * This script demonstrates the Speculative Engine by running it on a demo Flask API.
 * It runs 3 strategies in parallel (Minimal, Robust, Performance) and shows the comparison.
 */

import { createEngine } from './core/engine';
import { createViewer } from './viewer';
import chalk from 'chalk';
import ora from 'ora';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

// In CommonJS, __dirname is available globally as a built-in variable
// We can use it directly without declaration

// Demo configuration
const DEMO_TASK = `
Add authentication to this Flask API with the following requirements:
1. JWT-based authentication with access and refresh tokens
2. Login endpoint (/login) that accepts username/password and returns tokens
2. Protected routes middleware that validates JWT tokens
3. User registration endpoint (/register)
4. Token refresh endpoint (/refresh)
5. Logout endpoint (/logout) that revokes tokens
6. Protected routes: /posts (POST), /users (GET)

The API currently has:
- GET / - API info
- GET /posts - List posts (public)
- GET /posts/<id> - Get post (public)
- POST /posts - Create post (needs auth)
- GET /users - List users (needs auth)
- POST /login - Login endpoint (stub)

The engine should add authentication to the existing Flask app in demo/app.py
`;

const DEMO_CONSTRAINTS = [
  'Use Python/Flask for the implementation',
  'Use JWT for tokens (access: 15min, refresh: 7 days)',
  'Use bcrypt for password hashing',
  'Store refresh tokens in Redis (or in-memory for demo)',
  'Follow REST conventions',
  'Return proper HTTP status codes',
  'Include proper error messages',
];

async function main() {
  console.log(chalk.cyan.bold('\n🔮 Speculative Engine - Forge-a-thon Round 1 Demo\n'));

  // Check for TrueFoundry API key
  const apiKey = process.env.TRUEFOUNDRY_API_KEY;
  if (!apiKey) {
    console.log(chalk.yellow('\n⚠️  TRUEFOUNDRY_API_KEY not set.'));
    console.log(chalk.gray('   Running in SIMULATION MODE (no actual TrueFoundry calls)'));
    console.log(chalk.gray('   Set TRUEFOUNDRY_API_KEY to run against real TrueFoundry\n'));
  }

  const endpoint = process.env.TRUEFOUNDRY_ENDPOINT || 'https://api.truefoundry.com';
  console.log(chalk.gray(`TrueFoundry Endpoint: ${endpoint}\n`));

  // Create engine
  const engine = createEngine({
    truefoundryApiKey: process.env.TRUEFOUNDRY_API_KEY || 'demo-key',
    truefoundryEndpoint: 'https://api.truefoundry.com',
    sessionPoolSize: 4,
    defaultTimeout: 180000,
    maxParallelStrategies: 4,
  });

  // Start the outcome viewer
  console.log(chalk.cyan('\n🌐 Starting Outcome Viewer...'));
  const viewer = await createViewer(3000, 'localhost');
  console.log(chalk.green('✅ Outcome Viewer running at http://localhost:3000\n'));

  // Run the speculative engine
  console.log(chalk.cyan('\n🚀 Running Speculative Engine on Demo Task...\n'));
  console.log(chalk.gray('Task: Add authentication to Flask API'));
  console.log(chalk.gray('Strategies: Minimal, Robust, Performance\n'));

  const comparison = await engine.execute(DEMO_TASK, {
    strategies: ['minimal', 'robust', 'performance'],
    constraints: DEMO_CONSTRAINTS,
    priority: 'high',
  });

  // Set comparison in viewer
  viewer.setComparison(comparison as any);

  // Display results
  console.log(chalk.cyan.bold('\n📊 RESULTS SUMMARY\n'));

  console.log(chalk.gray('┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.gray('│                    STRATEGY COMPARISON                      │'));
  console.log(chalk.gray('└─────────────────────────────────────────────────────────────┘\n'));

  for (const result of comparison.results) {
    const isRecommended = result.strategyId === comparison.recommendedStrategyId;
    const rank = comparison.comparisonMatrix.strategies.find((s: any) => s.strategyId === result.strategyId)?.rank || 0;

    const badge = isRecommended
      ? chalk.green.bold(' ★ RECOMMENDED')
      : chalk.gray(` Rank #${rank}`);

    console.log(`${chalk.bold(result.strategyName)} ${badge}`);
    console.log(`  Philosophy: ${chalk.cyan(result.philosophy)}`);
    console.log(`  Success: ${result.success ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(`  Tests: ${chalk.green(result.testResults.passed)}/${result.testResults.passed + result.testResults.failed} passed`);
    console.log(`  Coverage: ${chalk.yellow(result.testResults.coverage || 0)}%`);
    console.log(`  Latency (p95): ${chalk.magenta(result.benchmarks.latency?.p95 || 'N/A')}ms`);
    console.log(`  Throughput: ${chalk.blue(result.benchmarks.throughput?.requestsPerSecond || 'N/A')} req/s`);
    console.log(`  Lines of Code: ${chalk.gray(result.complexity.linesOfCode || 'N/A')}`);
    console.log(`  Complexity: ${chalk.gray(result.complexity.cyclomaticComplexity || 'N/A')}`);
    console.log(`  Files: ${chalk.gray(result.complexity.fileCount || 'N/A')}`);
    console.log(`  Time: ${chalk.gray((result.executionTime / 1000).toFixed(1))}s`);

    if (!result.success && result.errors) {
      console.log(`  ${chalk.red('Errors:')} ${result.errors.join('; ')}`);
    }
    console.log();
  }

  // Show recommendation
  const recommended = comparison.results.find((r: any) => r.strategyId === comparison.recommendedStrategyId);
  console.log(chalk.green.bold('\n🏆 RECOMMENDED STRATEGY: ' + (recommended?.strategyName || 'Unknown')));
  console.log(chalk.gray(`   Philosophy: ${recommended?.philosophy}`));
  console.log(chalk.gray(`   Reason: Best balance of test coverage, performance, and complexity\n`));

  // Show viewer URL
  console.log(chalk.cyan.bold('\n🌐 VIEW DETAILED COMPARISON:'));
  console.log(chalk.blue('   http://localhost:3000'));
  console.log(chalk.gray('   (Shows side-by-side comparison, code diffs, and detailed metrics)\n'));

  // Keep running for demo
  console.log(chalk.cyan('\n⏳ Demo running. Press Ctrl+C to exit.\n'));
  console.log(chalk.gray('   The viewer will auto-refresh every 30 seconds.'));

  // Keep process alive
  await new Promise(() => {});
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n👋 Shutting down...'));
  process.exit(0);
});

main().catch((error: Error) => {
  console.error(chalk.red('\n❌ Demo failed:'), error);
  process.exit(1);
});