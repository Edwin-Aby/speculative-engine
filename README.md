# 🔮 Speculative Engine Agent

A VS Code extension agent that runs multiple AI coding strategies in parallel, compares outcomes, and recommends the best approach — all through a conversational chatbox interface.

Built for the **TrueFoundry Forge-a-thon**.

---

## What it does

Instead of getting one AI suggestion and iterating, Speculative Engine runs **three strategies simultaneously** (Minimal, Robust, Performance), scores each on success, execution time, coverage, and test results, and recommends the best one.

Everything happens inside VS Code through a chatbox webview — describe your task, watch the strategies run in parallel, and pick the winner.

---

## ✨ Features

- **Chatbox agent interface** — Conversational webview UI inside VS Code with message bubbles, recommendation cards, and strategy comparison tables
- **Three strategies in parallel** — Minimal, Robust, and Performance execute simultaneously via `Promise.allSettled`
- **Auto-selection** — Scores and recommends the best strategy based on success, execution time, coverage, and test results
- **TrueFoundry SDK integration** — Native AI execution through TrueFoundry
- **Keybindings** — `Ctrl+Alt+K` (run), `Ctrl+Alt+O` (open viewer)
- **Settings** — API key, endpoint, default strategies, max parallel strategies

---

## 📦 Installation

### From VSIX (recommended)

1. Download [`speculative-engine-0.1.0.vsix`](https://github.com/Edwin-Aby/speculative-engine/releases/download/v0.1.0/speculative-engine-0.1.0.vsix) from the [Releases page](https://github.com/Edwin-Aby/speculative-engine/releases).
2. In VS Code: Extensions view → `…` → **Install from VSIX** → select the file.
3. Reload VS Code when prompted.

### From source

```bash
git clone https://github.com/Edwin-Aby/speculative-engine.git
cd speculative-engine
npm install
npm run compile   # or npm run watch
```

Then press `F5` in VS Code to launch the Extension Development Host.

---

## ⌨️ Keybindings

| Key (Windows/Linux) | Key (macOS) | Command |
|---|---|---|
| `Ctrl+Alt+K` | `Cmd+Alt+K` | `speculativeEngine.run` — Open chatbox and describe a task |
| `Ctrl+Alt+O` | `Cmd+Alt+O` | `speculativeEngine.openViewer` — Open the Outcome Viewer |

You can also run commands from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):
- **Speculative Engine: Run**
- **Speculative Engine: Open Outcome Viewer**
- **Speculative Engine: Configure**

---

## ⚙️ Configuration

Configure via VS Code Settings (`File` → `Preferences` → `Settings`, search "Speculative Engine"):

| Setting | Description | Default |
|---|---|---|
| `speculativeEngine.truefoundryApiKey` | TrueFoundry API key for AI execution | `""` |
| `speculativeEngine.truefoundryEndpoint` | TrueFoundry API endpoint | `https://api.truefoundry.com` |
| `speculativeEngine.defaultStrategies` | Strategies to run | `["minimal", "robust", "performance"]` |
| `speculativeEngine.maxParallelStrategies` | Max parallel strategies | `3` |

Get your API key from [TrueFoundry](https://truefoundry.com).

---

## 🎯 Usage

1. Set your TrueFoundry API key in settings (or run **Speculative Engine: Configure**).
2. Press **Ctrl+Alt+K** (or open the Command Palette → "Run Speculative Engine").
3. Describe your task in the chatbox, e.g. *"Add JWT authentication to this Flask API with login/register endpoints"*.
4. Select the strategies to run (or use defaults).
5. The agent runs them in parallel and shows a recommendation with a full strategy comparison.
6. Open the Outcome Viewer with **Ctrl+Alt+O** to see detailed results.

---

## 🏗 Architecture

```
User Request → Chatbox (webview) → Speculative Engine
                                      │
             ┌──────────┬──────────┬──────────┐
             ▼          ▼          ▼
        Minimal    Robust    Performance
        (strategy) (strategy) (strategy)
             │          │          │
             └──────────┴──────────┘
                         │
              TrueFoundry SDK (parallel sessions)
                         │
              Outcome Viewer (comparison + recommendation)
```

Strategies run via `Promise.allSettled`, batched by `maxParallelStrategies`. Results are scored and the best is recommended.

---

## 📁 Project Structure

```
speculative-engine/
├── src/
│   ├── engine.ts          # SpeculativeEngine orchestrator
│   ├── extension.ts       # VS Code extension activation
│   ├── outcomeViewer.ts   # Chatbox webview provider
│   ├── strategies/
│   │   ├── base.ts        # Abstract strategy executor
│   │   ├── minimal.ts     # Minimal strategy
│   │   ├── robust.ts      # Production-ready strategy
│   │   ├── performance.ts # Performance-optimized strategy
│   │   └── index.ts       # Strategy exports
│   ├── types.ts           # Type definitions
│   └── truefoundry.ts     # TrueFoundry SDK client
├── media/
│   ├── viewer.css         # Chatbox styles
│   └── viewer.js          # ChatAgent frontend logic
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript config
└── README.md
```

---

## 📄 License

MIT License — Built for TrueFoundry Forge-a-thon.

---

**Built with ❤️ for TrueFoundry Forge-a-thon**
