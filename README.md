# 🔮 Speculative Engine - Forge-a-thon Round 1

**A parallel strategy execution engine that runs multiple AI approaches simultaneously, compares outcomes, and recommends the best solution.**

Built for the **TrueFoundry Forge-a-thon** hackathon.

---

## 🎯 The Problem

Traditional AI coding assistants propose **one solution** → you approve/reject → iterate. This is slow and you never know if a better approach existed.

**Speculative Engine solves this by running multiple strategies IN PARALLEL and showing you the outcomes side-by-side.**

---

## 🏗 Architecture

```
User Request
     │
     ▼
┌────────────────────────────────────────┐
│        TASK DECOMPOSER                  │
│  Analyzes request, plans strategies     │
└────────────────────┬────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│Strategy │     │Strategy │     │Strategy │
│ Minimal │     │ Robust  │     │ Perf    │
│ (3 files)│     │(12 files)│    │(7 files)│
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     ▼               ▼               ▼
┌────────────────────────────────────────┐
│      TRUEFOUNDRY SESSION POOL           │
│  Parallel isolated sessions per strategy│
└────────────────────┬────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────┐
│         OUTCOME VIEWER                  │
│  Side-by-side comparison + rankings     │
│  Code diffs • Benchmarks • Test results │
└────────────────────────────────────────┘
```

---

## 🚀 Three Strategies, Three Philosophies

| Strategy | Philosophy | Files | Tests | Use Case |
|----------|------------|-------|-------|----------|
| **Minimal** | "Less is more" | 3 | 5 (45%) | Prototypes, MVPs, quick fixes |
| **Robust** | "Production-ready" | 12 | 25 (95%) | Production services, regulated environments |
| **Performance** | "Fast is a feature" | 7 | 12 (70%) | High-throughput APIs, latency-critical |

---

## 🏃 Quick Start

### Prerequisites
- Node.js 20+
- TrueFoundry account (free tier) → [Get API Key](https://truefoundry.com)

### Installation

```bash
# Clone and install
cd D:\COMPETITION\speculative-engine
npm install

# Configure environment
cp .env.example .env
# Edit .env with your TrueFoundry API key

# Build
npm run build

# Run demo
npm run demo
```

### View Results
Open **http://localhost:3000** to see the live comparison dashboard.

---

## 🎬 Demo

The demo adds **JWT authentication** to a simple Flask API using 3 different strategies:

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGY COMPARISON                          │
├─────────┬──────────────┬───────────┬────────┬────────┬────────┤
│ Rank    │ Strategy     │ Philosophy│ Tests  │ Time   │ Coverage│
├─────────┼──────────────┼───────────┼────────┼────────┼────────┤
│ ★ 1     │ Robust       │ Production│ 25/25  │ 4.2s   │ 95%     │
│ 2       │ Performance  │ Speed     │ 12/12  │ 2.1s   │ 70%     │
│ 3       │ Minimal      │ Minimal   │ 5/5    │ 0.8s   │ 45%     │
└─────────┴──────────────┴───────────┴────────┴────────┴────────┘
```

The **Robust** strategy is recommended for production use (best test coverage + observability).

---

## 🏗 Project Structure

```
speculative-engine/
├── src/
│   ├── core/
│   │   └── engine.ts          # Main orchestrator
│   ├── strategies/
│   │   ├── base.ts            # Abstract base class
│   │   ├── minimal.ts         # Minimal strategy
│   │   ├── robust.ts          # Production-ready strategy
│   │   ├── performance.ts     # Performance-optimized strategy
│   │   └── index.ts           # Exports
│   ├── types/
│   │   ├── index.ts           # Core type definitions
│   │   └── truefoundry.ts     # TrueFoundry SDK wrapper
│   ├── viewer/
│   │   ├── server.ts          # Web comparison dashboard
│   │   └── index.ts           # Exports
│   ├── demo.ts                # Demo runner
│   └── index.ts               # Main exports
├── demo/
│   ├── app.py                 # Demo Flask API (target)
│   └── requirements.txt       # Python deps
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Configuration

Create `.env` from `.env.example`:

```env
# Required for TrueFoundry integration
TRUEFOUNDRY_API_KEY=your-api-key-here
TRUEFOUNDRY_ENDPOINT=https://api.truefoundry.com

# Optional
SESSION_POOL_SIZE=4
DEFAULT_TIMEOUT=180000
VIEWER_PORT=3000
```

---

## 📊 Outcome Viewer

The web dashboard at `http://localhost:3000` shows:

- **Strategy Cards** - Visual comparison with scores, metrics, badges
- **Comparison Table** - Ranked table with all criteria
- **Code Diffs** - Side-by-side code changes per strategy
- **Benchmarks** - Latency, throughput, memory charts
- **Test Results** - Pass/fail, coverage, duration
- **Auto-refresh** - Updates every 30 seconds

---

## 🎯 Forge-a-thon Compliance

| Requirement | Status |
|-------------|--------|
| Team of 3 | ✅ Each member owns a strategy |
| TrueFoundry Platform | ✅ Native SDK integration |
| Public GitHub Repo | ✅ Ready to push |
| Working Demo | ✅ Flask API + 3 strategies |
| Documentation | ✅ This README + inline docs |
| Innovation | ✅ Parallel speculative execution |

---

## 🔮 How It Differs from ForgePilot

| Aspect | ForgePilot | Speculative Engine |
|--------|------------|-------------------|
| **Paradigm** | Single proposal → approve | **Parallel strategies → outcome comparison** |
| **Interface** | VS Code extension | **CLI + Web dashboard (any IDE)** |
| **Workflow** | Sequential iteration | **Parallel speculative execution** |
| **Decision** | Human reviews code | **Human reviews outcomes/benchmarks** |
| **CI/CD** | None | **Built-in benchmarks & test results** |
| **Team Workflow** | Single user | **Natural 3-person split (1 strategy each)** |

---

## 👥 Team Workflow (3 People)

| Member | Owns | Deliverable |
|--------|------|-------------|
| **You** | Core Engine + Strategy A (Minimal) | Orchestrator, task decomposer, minimal strategy |
| **Teammate 1** | Strategy B (Robust) | Comprehensive strategy with observability |
| **Teammate 2** | Strategy C (Performance) | Optimized strategy with benchmarks |

**Shared:** TrueFoundry session pool, outcome viewer UI, merge logic

---

## 🚀 Future Enhancements (Post-Round 1)

- [ ] **Strategy D: Security-First** - Zero-trust, encryption, audit logs
- [ ] **Strategy E: Maintainable** - Clean architecture, SOLID, docs
- [ ] **Custom Strategy Builder** - DSL for defining new philosophies
- [ ] **GitHub Integration** - Auto-create PRs from chosen timeline
- [ ] **Cost Optimization** - Model selection based on task complexity
- [ ] **Learning Engine** - Improve recommendations from past selections

---

## 📝 License

MIT License - Built for TrueFoundry Forge-a-thon 2024

---

## 🙏 Acknowledgments

- **TrueFoundry** for the platform and SDK
- **ForgePilot** team for inspiration (VS Code extension approach)
- **Forge-a-thon** organizers for the challenge

---

**Built with ❤️ for TrueFoundry Forge-a-thon Round 1**