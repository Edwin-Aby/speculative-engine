// Speculative Engine Outcome Viewer - Frontend Logic

class OutcomeViewer {
    constructor() {
        this.comparisonData = null;
        this.init();
    }

    init() {
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'updateResults':
                    this.updateResults(message.data);
                    break;
            }
        });
    }

    updateResults(data) {
        this.comparisonData = data;
        this.renderRecommendation(data);
        this.renderComparisonTable(data);
        this.updateTimestamp(data.timestamp);
    }

    updateTimestamp(timestamp) {
        const el = document.getElementById('timestamp');
        if (el) {
            const date = new Date(timestamp);
            el.textContent = `Updated: ${date.toLocaleString()}`;
        }
    }

    renderRecommendation(data) {
        const container = document.getElementById('recommendation');
        const card = document.getElementById('recommendationCard');

        if (!container || !card) return;

        const recommended = data.results?.find(r => r.strategyId === data.recommendedStrategyId);
        if (!recommended) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        card.innerHTML = `
            <div class="strategy-name">${this.escapeHtml(recommended.strategyName)}</div>
            <div class="philosophy">${this.escapeHtml(recommended.philosophy)}</div>
            <div class="metrics">
                <span class="metric badge badge-${recommended.philosophy.toLowerCase()}">${this.escapeHtml(recommended.philosophy)}</span>
                <span class="metric">${recommended.success ? '✅ Success' : '❌ Failed'}</span>
                <span class="metric">${recommended.executionTime}ms</span>
                <span class="metric">${recommended.testResults?.coverage || 0}% coverage</span>
                <span class="metric">${recommended.testResults?.passed || 0}/${recommended.testResults?.passed + recommended.testResults?.failed || 0} tests</span>
            </div>
        `;
    }

    renderComparisonTable(data) {
        const tbody = document.getElementById('comparisonBody');
        if (!tbody) return;

        const strategies = data.comparisonMatrix?.strategies || [];
        tbody.innerHTML = strategies.map((strategy, index) => `
            <tr>
                <td class="rank rank-${index + 1}">#${index + 1}</td>
                <td>${this.escapeHtml(strategy.name)}</td>
                <td><span class="badge badge-${strategy.philosophy.toLowerCase()}">${this.escapeHtml(strategy.philosophy)}</span></td>
                <td class="${strategy.success ? 'success' : 'failed'}">${strategy.success ? '✅' : '❌'}</td>
                <td>${strategy.executionTime}ms</td>
                <td>${strategy.coverage}%</td>
                <td>${strategy.testsPassed}/${strategy.testsPassed + strategy.testsFailed || 0}</td>
                <td>${strategy.score.toFixed(1)}</td>
            </tr>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.viewer = new OutcomeViewer();
});