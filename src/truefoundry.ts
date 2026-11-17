import * as vscode from 'vscode';

export class TrueFoundryClient {
    private apiKey: string;
    private endpoint: string;
    private baseUrl: string;

    constructor(apiKey: string, endpoint: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.baseUrl = endpoint.replace(/\/$/, '');
    }

    async createSession(config: any): Promise<any> {
        if (!this.apiKey) {
            throw new Error('TrueFoundry API key not configured');
        }

        const response = await fetch(`${this.baseUrl}/api/v1/sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`TrueFoundry API error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    async executeCode(sessionId: string, code: string): Promise<any> {
        if (!this.apiKey) {
            throw new Error('TrueFoundry API key not configured');
        }

        const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}/execute`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`TrueFoundry execution error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    async getSessionStatus(sessionId: string): Promise<any> {
        if (!this.apiKey) {
            throw new Error('TrueFoundry API key not configured');
        }

        const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`TrueFoundry status error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    async closeSession(sessionId: string): Promise<void> {
        if (!this.apiKey) {
            throw new Error('TrueFoundry API key not configured');
        }

        const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`TrueFoundry close error: ${response.status} - ${error}`);
        }
    }

    dispose(): void {
        // Cleanup if needed
    }
}