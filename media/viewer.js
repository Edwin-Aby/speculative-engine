// Speculative Engine Agent - Chatbox Frontend Logic

class ChatAgent {
    constructor() {
        this.chatContainer = document.getElementById('chatContainer');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.statusEl = document.getElementById('status');
        this.clearBtn = document.getElementById('clearChat');
        this.welcomeMsg = document.getElementById('welcomeMessage');
        this.init();
    }

    init() {
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'userMessage':
                    this.addUserMessage(message.text, message.timestamp);
                    break;
                case 'agentResponse':
                    this.setStatus('● Processing...');
                    this.addAgentResponse(message.data, message.timestamp);
                    break;
                case 'agentMessage':
                    this.addAgentMessage(message.text, message.timestamp);
                    break;
                case 'agentError':
                    this.setStatus('● Error');
                    this.addAgentError(message.error, message.timestamp);
                    break;
                case 'chatCleared':
                    this.clearChat();
                    break;
                case 'updateResults':
                    // Backward compatibility
                    this.addAgentResponse(message.data, message.timestamp);
                    break;
            }
        });

        // Send button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Enter key to send
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Clear chat
        this.clearBtn.addEventListener('click', () => {
            this.clearChat();
            window.vscode.postMessage({ type: 'clearChat' });
        });

        // Focus input on load
        this.chatInput.focus();
    }

    async sendMessage() {
        const text = this.chatInput.value.trim();
        if (!text) return;

        this.chatInput.value = '';
        this.chatInput.focus();
        this.setStatus('● Processing...');

        // Remove welcome message if present
        if (this.welcomeMsg) {
            this.welcomeMsg.remove();
            this.welcomeMsg = null;
        }

        // Add user message locally (will be echoed back from extension too)
        this.addUserMessage(text, new Date().toISOString());

        // Send to extension
        window.vscode.postMessage({ type: 'chatMessage', text });
    }

    addUserMessage(text, timestamp) {
        const div = document.createElement('div');
        div.className = 'message user';
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = `
            <div class="message-content">${this.escapeHtml(text)}</div>
            <div class="message-time">${time}</div>
        `;
        this.chatContainer.appendChild(div);
        this.scrollToBottom();
    }

    addAgentResponse(data, timestamp) {
        const div = document.createElement('div');
        div.className = 'message agent';
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const recommended = data.results?.find(r => r.strategyId === data.recommendedStrategyId);
        const successful = data.results?.filter(r => r.success) || [];
        const failed = data.results?.filter(r => !r.success) || [];

        let html = `<div class="message-time">${time}</div>`;
        html += `<div class="message-content">`;

        if (recommended) {
            html += `<div class="agent-header">🔮 Speculative Engine Agent</div>`;
            html += `<div class="recommendation-card">`;
            html += `<div class="rec-title">🏆 Recommended: ${this.escapeHtml(recommended.strategyName)}</div>`;
            html += `<div class="rec-philosophy">Philosophy: ${this.escapeHtml(recommended.philosophy)}</div>`;
            html += `<div class="rec-metrics">`;
            html += `<span class="metric">${recommended.success ? '✅ Success' : '❌ Failed'}</span>`;
            html += `<span class="metric">${recommended.executionTime}ms</span>`;
            html += `<span class="metric">${recommended.testResults?.coverage || 0}% coverage</span>`;
            html += `<span class="metric">${recommended.testResults?.passed || 0}/${recommended.testResults?.passed + recommended.testResults?.failed || 0} tests</span>`;
            html += `</div>`;
            html += `</div>`;
        }

        if (successful.length > 0) {
            html += `<div class="strategies-section">`;
            html += `<div class="section-title">📊 Strategy Results</div>`;
            html += `<table class="comparison-table">`;
            html += `<thead><tr><th>Strategy</th><th>Philosophy</th><th>Status</th><th>Time</th><th>Coverage</th><th>Score</th></tr></thead>`;
            html += `<tbody>`;
            successful.forEach((s, index) => {
                const score = s.score ? s.score.toFixed(1) : 'N/A';
                const isRecommended = recommended && s.strategyId === recommended.strategyId ? 'recommended' : '';
                html += `<tr class="${isRecommended}">`;
                html += `<td>${index + 1}. ${this.escapeHtml(s.strategyName)}</td>`;
                html += `<td><span class="badge badge-${s.philosophy.toLowerCase()}">${this.escapeHtml(s.philosophy)}</span></td>`;
                html += `<td class="success">✅</td>`;
                html += `<td>${s.executionTime}ms</td>`;
                html += `<td>${s.testResults?.coverage || 0}%</td>`;
                html += `<td>${score}</td>`;
                html += `</tr>`;
            });
            html += `</tbody></table></div>`;
        }

        if (failed.length > 0) {
            html += `<div class="strategies-section failed-section">`;
            html += `<div class="section-title">⚠️ Failed Strategies</div>`;
            failed.forEach(f => {
                html += `<div class="failed-item">${this.escapeHtml(f.strategyName)}: ${(f.errors || ['Unknown error']).join(', ')}</div>`;
            });
            html += `</div>`;
        }

        html += `<div class="agent-footer">Timestamp: ${new Date(timestamp).toLocaleString()}</div>`;
        html += `</div>`;

        div.innerHTML = html;
        this.chatContainer.appendChild(div);
        this.scrollToBottom();
        this.setStatus('● Ready');
    }

    addAgentMessage(text, timestamp) {
        const div = document.createElement('div');
        div.className = 'message agent';
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = `
            <div class="message-time">${time}</div>
            <div class="message-content">${this.escapeHtml(text)}</div>
        `;
        this.chatContainer.appendChild(div);
        this.scrollToBottom();
    }

    addAgentError(error, timestamp) {
        const div = document.createElement('div');
        div.className = 'message agent error';
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = `
            <div class="message-time">${time}</div>
            <div class="message-content error-content">
                <strong>❌ Error:</strong> ${this.escapeHtml(error)}
            </div>
        `;
        this.chatContainer.appendChild(div);
        this.scrollToBottom();
    }

    clearChat() {
        this.chatContainer.innerHTML = '';
        this.welcomeMsg = null;
        // Re-add welcome message
        const div = document.createElement('div');
        div.className = 'message agent';
        div.innerHTML = `
            <div class="message-content">
                <strong>Speculative Engine Agent:</strong> Chat cleared. What would you like to build?
            </div>
        `;
        this.chatContainer.appendChild(div);
    }

    setStatus(text) {
        if (this.statusEl) {
            this.statusEl.textContent = text;
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatAgent = new ChatAgent();
});
