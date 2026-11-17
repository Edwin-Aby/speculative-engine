import * as vscode from 'vscode';
import { SpeculativeEngine } from './engine';
import { OutcomeViewerProvider } from './outcomeViewer';

let engine: SpeculativeEngine | null = null;
let viewerProvider: OutcomeViewerProvider | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('Speculative Engine extension is now active');

    // Initialize the engine
    const config = vscode.workspace.getConfiguration('speculativeEngine');
    engine = new SpeculativeEngine({
        truefoundryApiKey: config.get<string>('truefoundryApiKey') || '',
        truefoundryEndpoint: config.get<string>('truefoundryEndpoint') || 'https://api.truefoundry.com',
        maxParallelStrategies: config.get<number>('maxParallelStrategies') || 3,
        defaultStrategies: config.get<string[]>('defaultStrategies') || ['minimal', 'robust', 'performance']
    });

    // Register the outcome viewer
    viewerProvider = new OutcomeViewerProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('speculativeEngine.outcomeViewer', viewerProvider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('speculativeEngine.run', async () => {
            await runSpeculativeEngine();
        }),
        vscode.commands.registerCommand('speculativeEngine.openViewer', () => {
            vscode.commands.executeCommand('speculativeEngine.outcomeViewer.focus');
        }),
        vscode.commands.registerCommand('speculativeEngine.configure', async () => {
            await configureEngine();
        })
    );

    // Show welcome message
    vscode.window.showInformationMessage('Speculative Engine is ready! Use "Run Speculative Engine" to start.');
}

async function runSpeculativeEngine() {
    if (!engine) {
        vscode.window.showErrorMessage('Speculative Engine not initialized');
        return;
    }

    const task = await vscode.window.showInputBox({
        prompt: 'Describe the task for the speculative engine',
        placeHolder: 'e.g., Add JWT authentication to this Flask API with login/register endpoints',
        ignoreFocusOut: true
    });

    if (!task) {
        return;
    }

    const strategies = await vscode.window.showQuickPick(
        ['minimal', 'robust', 'performance'],
        {
            canPickMany: true,
            placeHolder: 'Select strategies to run',
            title: 'Select Strategies'
        }
    );

    if (!strategies || strategies.length === 0) {
        vscode.window.showWarningMessage('No strategies selected');
        return;
    }

    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Running Speculative Engine...',
            cancellable: true
        }, async (progress, token) => {
            progress.report({ increment: 0, message: 'Starting strategies...' });

            const taskDescription = `Task: ${task}\nStrategies: ${strategies.join(', ')}`;

            const comparison = await engine!.execute({
                description: taskDescription,
                strategies,
                priority: 'high'
            });

            // Show results in the outcome viewer
            if (viewerProvider) {
                viewerProvider.updateResults(comparison);
                vscode.commands.executeCommand('speculativeEngine.outcomeViewer.focus');
            }

            // Show summary
            const recommended = comparison.results.find(r => r.strategyId === comparison.recommendedStrategyId);
            if (recommended) {
                vscode.window.showInformationMessage(
                    `Recommended: ${recommended.strategyName} (${recommended.philosophy})`,
                    'Open Viewer'
                ).then(selection => {
                    if (selection === 'Open Viewer') {
                        vscode.commands.executeCommand('speculativeEngine.outcomeViewer.focus');
                    }
                });
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Speculative Engine failed: ${error}`);
    }
}

async function configureEngine() {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'TrueFoundry API Key',
        password: true,
        ignoreFocusOut: true
    });

    if (apiKey) {
        const config = vscode.workspace.getConfiguration('speculativeEngine');
        await config.update('truefoundryApiKey', apiKey, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('TrueFoundry API Key updated');
    }
}

export function deactivate() {
    if (engine) {
        engine.dispose();
    }
}