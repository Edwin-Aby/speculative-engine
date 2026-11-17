import * as vscode from 'vscode';
import { ComparisonResult } from './types';
import { SpeculativeEngine } from './engine';

export class OutcomeViewerProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'speculativeEngine.outcomeViewer';
    private _view?: vscode.WebviewView;
    private readonly extensionUri: vscode.Uri;
    private engine: SpeculativeEngine | null = null;

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
    }

    setEngine(engine: SpeculativeEngine) {
        this.engine = engine;
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'chatMessage':
                    await this.handleChatMessage(message.text);
                    break;
                case 'clearChat':
                    this._view?.webview.postMessage({ type: 'chatCleared' });
                    break;
            }
        });
    }

    private async handleChatMessage(text: string) {
        // Echo user message back to webview for display
        this._view?.webview.postMessage({
            type: 'userMessage',
            text,
            timestamp: new Date().toISOString()
        });

        // Run engine if available
        if (this.engine) {
            try {
                const comparison = await this.engine.execute({
                    description: text,
                    strategies: ['minimal', 'robust', 'performance'],
                    priority: 'high'
                });

                this._view?.webview.postMessage({
                    type: 'agentResponse',
                    data: comparison,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this._view?.webview.postMessage({
                    type: 'agentError',
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            this._view?.webview.postMessage({
                type: 'agentError',
                error: 'Speculative Engine not initialized',
                timestamp: new Date().toISOString()
            });
        }
    }

    updateResults(comparison: any) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateResults',
                data: comparison
            });
        }
    }

    sendAgentMessage(text: string) {
        this._view?.webview.postMessage({
            type: 'agentMessage',
            text,
            timestamp: new Date().toISOString()
        });
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'viewer.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'viewer.css'));

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${styleUri}">
    <title>Speculative Engine Agent</title>
</head>
<body>
    <div class="chat-header">
        <div class="header-content">
            <h1>🔮 Speculative Engine Agent</h1>
            <div class="status" id="status">● Ready</div>
        </div>
        <button class="btn-clear" id="clearChat" title="Clear Chat">🗑️</button>
    </div>

    <div class="chat-container" id="chatContainer">
        <div class="message agent" id="welcomeMessage">
            <div class="message-content">
                <strong>Speculative Engine Agent:</strong> Hello! I'm your AI coding assistant. Describe a task and I'll run multiple strategies in parallel (Minimal, Robust, Performance) and recommend the best approach. What would you like to build?
            </div>
            <div class="message-time" id="welcomeTime"></div>
        </div>
    </div>

    <div class="chat-input-area">
        <div class="input-wrapper">
            <input type="text" id="chatInput" placeholder="Describe your coding task... (e.g., Add JWT authentication to this Flask API)" />
            <button id="sendBtn">Send</button>
        </div>
        <div class="chat-hints">
            <span>💡 Try: "Add JWT auth", "Build a REST API", "Refactor this function", "Create a React component"</span>
        </div>
    </div>

    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}
