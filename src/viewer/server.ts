/**
 * Outcome Viewer - Web-based Comparison Dashboard
 *
 * A simple HTTP server that serves a web UI for comparing strategy outcomes.
 * Shows side-by-side comparison of strategy results with rankings.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { OutcomeComparison, StrategyResult } from '../types';

interface ViewerOptions {
  port: number;
  host: string;
}

/**
 * Outcome Viewer Server
 */
export class OutcomeViewer {
  private server: http.Server;
  private port: number;
  private host: string;
  private latestComparison: OutcomeComparison | null = null;

  constructor(options: ViewerOptions = { port: 3000, host: 'localhost' }) {
    this.port = options.port;
    this.host = options.host;
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  /**
   * Set the latest comparison to display
   */
  setComparison(comparison: OutcomeComparison): void {
    this.latestComparison = comparison;
  }

  /**
   * Handle incoming HTTP requests
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url || '/', `http://${this.host}:${this.port}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Route handling
    if (url.pathname === '/' || url.pathname === '/index.html') {
      this.serveIndex(req, res);
    } else if (url.pathname === '/api/comparison') {
      this.serveComparison(req, res);
    } else if (url.pathname === '/api/results/:id') {
      this.serveResult(req, res, url.pathname.split('/').pop() || '');
    } else if (url.pathname.startsWith('/static/')) {
      this.serveStatic(req, res, url.pathname);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  /**
   * Serve the main HTML page
   */
  private serveIndex(req: http.IncomingMessage, res: http.ServerResponse): void {
    const html = this.generateHTML();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  /**
   * Serve comparison data as JSON
   */
  private serveComparison(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (!this.latestComparison) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No comparison available' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.latestComparison, null, 2));
  }

  /**
   * Serve individual result
   */
  private serveResult(req: http.IncomingMessage, res: http.ServerResponse, id: string): void {
    if (!this.latestComparison) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No comparison available' }));
      return;
    }

    const result = this.latestComparison.results.find(r => r.strategyId === id);
    if (!result) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Result not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result, null, 2));
  }

  /**
   * Serve static files
   */
  private serveStatic(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): void {
    const filePath = path.join(__dirname, '..', '..', 'public', pathname.replace('/static/', ''));
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath);
      const mimeTypes: Record<string, string> = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
      };

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  }

  /**
   * Generate the main HTML page
   */
  private generateHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Speculative Engine - Outcome Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.6; min-height: 100vh; }
    .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #30363d; }
    h1 { font-size: 1.75rem; font-weight: 600; color: #f0f6fc; }
    .subtitle { color: #8b949e; font-size: 0.95rem; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-recommended { background: #1f6feb; color: white; }
    .badge-minimal { background: #238636; color: white; }
    .badge-robust { background: #d29922; color: black; }
    .badge-performance { background: #a371f7; color: white; }
    .badge-failed { background: #da3633; color: white; }

    .comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .strategy-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; transition: transform 0.2s, box-shadow 0.2s; }
    .strategy-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .strategy-card.recommended { border-color: #1f6feb; box-shadow: 0 0 0 1px #1f6feb; }
    .strategy-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .strategy-name { font-size: 1.1rem; font-weight: 600; color: #f0f6fc; }
    .strategy-philosophy { font-size: 0.8rem; color: #8b949e; text-transform: capitalize; }
    .score { font-size: 2.5rem; font-weight: 700; color: #f0f6fc; line-height: 1; }
    .score-label { font-size: 0.85rem; color: #8b949e; margin-top: 4px; }

    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
    .metric { background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 12px; }
    .metric-label { font-size: 0.75rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .metric-value { font-size: 1.25rem; font-weight: 600; color: #f0f6fc; }

    .comparison-table { background: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #21262d; }
    th { background: #0d1117; font-weight: 600; color: #8b949e; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
    td { color: #c9d1d9; font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(31, 111, 235, 0.1); }
    .rank { font-weight: 700; color: #1f6feb; }
    .rank-1 { color: #238636; }
    .rank-2 { color: #d29922; }
    .rank-3 { color: #a371f7; }
    .positive { color: #3fb950; }
    .negative { color: #f85149; }

    .detail-view { margin-top: 24px; }
    .detail-section { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
    .detail-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; color: #f0f6fc; }
    .code-block { background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 16px; overflow-x: auto; font-family: 'Monaco', 'Menlo', monospace; font-size: 0.85rem; line-height: 1.5; color: #e6edf3; }
    .file-path { font-family: 'Monaco', 'Menlo', monospace; font-size: 0.85rem; color: #8b949e; margin-bottom: 8px; }

    .loading { text-align: center; padding: 60px 20px; color: #8b949e; }
    .spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid #30363d; border-top-color: #1f6feb; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .refresh-btn { background: #1f6feb; color: white; border: none; border-radius: 6px; padding: 10px 20px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
    .refresh-btn:hover { background: #388bfd; }
    .refresh-btn:disabled { background: #30363d; color: #8b949e; cursor: not-allowed; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>🔮 Speculative Engine</h1>
        <p class="subtitle">Outcome Viewer - Compare Strategy Timelines</p>
      </div>
      <button class="refresh-btn" id="refreshBtn" onclick="loadComparison()">🔄 Refresh</button>
    </header>

    <main>
      <div id="content">
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading comparison data...</p>
        </div>
      </div>
    </main>
  </div>

  <script>
    async function loadComparison() {
      const btn = document.getElementById('refreshBtn');
      btn.disabled = true;
      btn.textContent = '⏳ Loading...';

      try {
        const response = await fetch('/api/comparison');
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();
        renderComparison(data);
      } catch (error) {
        document.getElementById('content').innerHTML = \`
          <div class="loading">
            <p style="color: #f85149;">Failed to load comparison: \${error.message}</p>
          </div>\`;
      } finally {
        btn.disabled = false;
        btn.textContent = '🔄 Refresh';
      }
    }

    function renderComparison(data) {
      const content = document.getElementById('content');
      const recommendedId = data.recommendedStrategyId;

      let cardsHtml = '';
      for (const result of data.results) {
        const isRecommended = result.strategyId === recommendedId;
        const rank = data.comparisonMatrix.strategies.find(s => s.strategyId === result.strategyId)?.rank || 0;

        cardsHtml += \`
          <div class="strategy-card \${isRecommended ? 'recommended' : ''}">
            <div class="strategy-header">
              <div>
                <div class="strategy-name">\${result.strategyName}</div>
                <span class="strategy-philosophy">\${result.philosophy} approach</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <span class="badge \${isRecommended ? 'badge-recommended' : 'badge-\${result.philosophy}'}">
                  \${isRecommended ? '★ RECOMMENDED' : 'Rank #' + rank}
                </span>
                \${!result.success ? '<span class="badge badge-failed">FAILED</span>' : ''}
              </div>
            </div>
            <div class="score" style="color: \${isRecommended ? '#238636' : '#f0f6fc'};">
              \${Math.round(
                Object.entries(result.testResults).reduce((sum, [k, v]) => sum + (typeof v === 'number' ? v : 0), 0)
              )} pts
            </div>
            <div class="score-label">Composite Score</div>
            <div class="metrics-grid">
              <div class="metric">
                <div class="metric-label">Tests</div>
                <div class="metric-value">\${result.testResults.passed}/\${result.testResults.passed + result.testResults.failed}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Coverage</div>
                <div class="metric-value">\${result.testResults.coverage || 0}%</div>
              </div>
              <div class="metric">
                <div class="metric-label">Latency (p95)</div>
                <div class="metric-value">\${result.benchmarks.latency?.p95 || 'N/A'}ms</div>
              </div>
              <div class="metric">
                <div class="metric-label">Throughput</div>
                <div class="metric-value">\${result.benchmarks.throughput?.requestsPerSecond || 'N/A'}/s</div>
              </div>
            </div>
            <div class="metrics-grid" style="margin-top: 12px;">
              <div class="metric">
                <div class="metric-label">Lines of Code</div>
                <div class="metric-value">\${result.complexity.linesOfCode || 'N/A'}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Complexity</div>
                <div class="metric-value">\${result.complexity.cyclomaticComplexity || 'N/A'}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Files</div>
                <div class="metric-value">\${result.complexity.fileCount || 'N/A'}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Time</div>
                <div class="metric-value">\${(result.executionTime / 1000).toFixed(1)}s</div>
              </div>
            </div>
            \${!result.success && result.errors ? \`
              <div style="margin-top: 12px; padding: 12px; background: #3d1116; border: 1px solid #da3633; border-radius: 6px; color: #f85149; font-size: 0.85rem;">
                \${result.errors.join('; ')}
              </div>
            \` : ''}
          </div>
        \`;
      }

      // Build comparison table rows
      let tableRows = '';
      for (const strategy of data.comparisonMatrix.strategies) {
        const isRecommended = strategy.strategyId === recommendedId;
        const scores = strategy.scores;

        tableRows += \`
          <tr style="\${isRecommended ? 'background: rgba(35, 134, 54, 0.15);' : ''}">
            <td class="rank \${strategy.rank === 1 ? 'rank-1' : strategy.rank === 2 ? 'rank-2' : 'rank-3'}">#\${strategy.rank}</td>
            <td>\${strategy.strategyName}</td>
            <td>\${strategy.philosophy}</td>
            <td>\${scores.testPassRate.toFixed(1)}%</td>
            <td>\${scores.executionTime.toFixed(0)}ms</td>
            <td>\${scores.complexity.toFixed(0)}</td>
            <td>\${scores.testCoverage.toFixed(1)}%</td>
            <td>\${scores.performance.toFixed(0)}</td>
            <td>\${isRecommended ? '<span class="badge badge-recommended">RECOMMENDED</span>' : ''}</td>
          </tr>
        \`;
      }

      content.innerHTML = \`
        <div class="comparison-grid">
          \${cardsHtml}
        </div>

        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Strategy</th>
                <th>Philosophy</th>
                <th>Test Pass %</th>
                <th>Time</th>
                <th>Complexity</th>
                <th>Coverage</th>
                <th>Perf Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              \${tableRows}
            </tbody>
          </table>
        </div>

        <div class="detail-view">
          <h2 class="detail-title">📁 Detailed Changes</h2>
          \${data.results.map(result => \`
            <div class="detail-section">
              <h3 class="detail-title">\${result.strategyName} (\${result.philosophy})</h3>
              \${result.changes.map(change => \`
                <div class="file-path">\${change.path}</div>
                <div class="code-block">\${escapeHtml(change.newContent.substring(0, 500))}\${change.newContent.length > 500 ? '...' : ''}</div>
              \`).join('')}
            </div>
          \`).join('')}
        </div>
      \`;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Auto-load on page load
    loadComparison();

    // Auto-refresh every 30 seconds
    setInterval(loadComparison, 30000);
  </script>
</body>
</html>`;
  }

  /**
   * Start the server
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, this.host, () => {
        console.log(chalk.green(`🌐 Outcome Viewer running at http://${this.host}:${this.port}`));
        resolve();
      });
      this.server.on('error', reject);
    });
  }

  /**
   * Stop the server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve());
    });
  }
}

/**
 * Create and start an outcome viewer
 */
export async function createViewer(
  port: number = 3000,
  host: string = 'localhost'
): Promise<OutcomeViewer> {
  const viewer = new OutcomeViewer({ port, host });
  await viewer.start();
  return viewer;
}