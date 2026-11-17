import * as vscode from 'vscode';
import { ComparisonResult } from './types';

export class OutcomeViewerProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'speculativeEngine.outcomeViewer';
    private _view?: vscode.WebviewView;
    private readonly extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
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
    }

    updateResults(comparison: any) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateResults',
                data: comparison
            });
        }
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
    <title>Speculative Engine Results</title>
</head>
<body>
    <div class="header">
        <h1>🔮 Speculative Engine Results</h1>
        <div class="timestamp" id="timestamp"></div>
    </div>

    <div class="recommendation" id="recommendation" style="display: none;">
        <h2>🏆 Recommended Strategy</h2>
        <div class="recommendation-card" id="recommendationCard"></div>
    </div>

    <div class="comparison">
        <h2>📊 Strategy Comparison</h2>
        <table id="comparisonTable">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Strategy</th>
                    <th>Philosophy</th>
                    <th>Success</th>
                    <th>Time (ms)</th>
                    <th>Coverage</th>
                    <th>Tests</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody id="comparisonBody"></tbody>
        </table>
    </div>

    <div class="details" id="details" style="display: none;">
        <h2>🔍 Details</h2>
        <div id="detailsContent"></div>
    </div>

    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}