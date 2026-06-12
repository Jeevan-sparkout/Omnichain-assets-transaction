# Omnichain Assets Transaction — Project Structure Guide

This project uses **Speckit**, **GitNexus**, and **Graphify** to manage specifications, code intelligence, and knowledge graph visualization for a ZetaChain cross-chain staking and messaging system.

---

## Overview

| Tool | Purpose | Config Location |
|------|---------|----------------|
| **Speckit** | Specification-driven development (specs → plans → tasks → implement) | `.specify/` |
| **GitNexus** | Code intelligence (impact analysis, call graph, execution flows) | `.gitnexus/`, `.claude/skills/gitnexus/` |
| **Graphify** | Code-to-knowledge-graph visualization and analysis | `graphify-out/` |

---

## Directory Layout

```
.
├── contracts/                    # Solidity smart contracts
│   ├── crosschain/               # Cross-chain staking & messaging contracts
│   │   ├── StakingRouterZEVM.sol
│   │   ├── StakingMessages.sol
│   │   └── CrossChainStaking.sol
│   ├── zevm/                     # ZetaChain EVM contracts
│   │   └── ZetaNativeStaking.sol
│   ├── token/                    # Universal token contracts
│   │   ├── ZetaChainUniversalTokenV2.sol
│   │   ├── EVMUniversalToken.sol
│   │   └── ZetaChainUniversalToken.sol
│   ├── interfaces/               # Contract interfaces
│   ├── test/                     # Mock contracts for testing
│   └── vendor/                   # Third-party vendored contracts
├── test/                         # Hardhat test files
├── scripts/                      # Deployment & utility scripts
├── crosschainUI/                 # Cross-chain React UI
├── commands/                     # CLI command definitions
│
├── .specify/                     # ← Speckit configuration
│   ├── integration.json          # Integration settings (opencode)
│   ├── init-options.json         # Speckit init options
│   ├── extensions.yml            # Git extension hooks
│   ├── memory/                   # Project constitution
│   │   └── constitution.md
│   ├── templates/                # Spec/plan/task templates
│   │   ├── spec-template.md
│   │   ├── plan-template.md
│   │   ├── tasks-template.md
│   │   ├── checklist-template.md
│   │   └── constitution-template.md
│   ├── workflows/                # Speckit workflow definitions
│   │   └── speckit/workflow.yml
│   ├── scripts/bash/             # Helper scripts
│   └── extensions/git/           # Git integration extension
│
├── .gitnexus/                    # ← GitNexus index data
│   ├── meta.json                 # Index metadata
│   └── parse-cache/              # Parsed AST cache
│
├── .claude/skills/gitnexus/      # ← GitNexus skill files
│   ├── gitnexus-exploring/SKILL.md
│   ├── gitnexus-impact-analysis/SKILL.md
│   ├── gitnexus-debugging/SKILL.md
│   ├── gitnexus-refactoring/SKILL.md
│   ├── gitnexus-guide/SKILL.md
│   └── gitnexus-cli/SKILL.md
│
├── graphify-out/                 # ← Graphify knowledge graph output
│   ├── graph.json                # Knowledge graph data (1101 nodes, 1010 edges)
│   ├── graph.html                # Interactive HTML visualization (739KB)
│   ├── manifest.json             # File manifest with hashes
│   ├── GRAPH_REPORT.md           # Graph analysis report (142 communities)
│   ├── cost.json                 # Graphify cost data
│   ├── .graphify_python          # Python backend path
│   └── cache/                    # Graphify cache
│
├── AGENTS.md                     # Agent instructions (Speckit + GitNexus)
├── CLAUDE.md                     # Claude-specific instructions
├── package.json
├── hardhat.config.ts
└── tsconfig.json
```

---

## How Each Tool Works

### 1. Speckit — Specification-Driven Development

Speckit guides development through a structured workflow: **Specify → Plan → Tasks → Implement**.

**Workflow:**
```bash
# 1. Describe what you want to build
npx speckit specify "Add a new cross-chain reward distribution system"

# 2. Review the generated specification
# (Output: specs/[feature]/spec.md)

# 3. Generate implementation plan
npx speckit plan "Add a new cross-chain reward distribution system"

# 4. Review the plan
# (Output: specs/[feature]/plan.md)

# 5. Generate tasks from plan
npx speckit tasks "Add a new cross-chain reward distribution system"

# 6. Implement the tasks
npx speckit implement "Add a new cross-chain reward distribution system"
```

**Key Files:**
- `.specify/memory/constitution.md` — Project principles and constraints
- `.specify/templates/` — Templates for specs, plans, tasks, checklists
- `.specify/workflows/speckit/workflow.yml` — Full SDD cycle workflow
- `.specify/extensions.yml` — Git hooks for auto-commit during workflow

**Git Hooks (auto-commit):**
Speckit automatically commits changes at each workflow stage via git hooks configured in `extensions.yml`.

---

### 2. GitNexus — Code Intelligence

GitNexus indexes the codebase and provides deep code understanding tools.

**Key Commands:**
```bash
# Re-index the codebase (run when stale)
npx gitnexus analyze

# Check index status
npx gitnexus status
```

**Mandatory Workflow (AI Agents):**
1. **Before editing any symbol:** Run `gitnexus_impact({target: "symbolName"})` to check blast radius
2. **Before committing:** Run `gitnexus_detect_changes()` to verify scope
3. **Warning:** If impact analysis returns HIGH or CRITICAL risk, warn the user before proceeding

**Skills (in `.claude/skills/gitnexus/`):**

| Skill | Use For |
|-------|---------|
| `gitnexus-exploring` | Understanding architecture, tracing flows |
| `gitnexus-impact-analysis` | Blast radius before edits |
| `gitnexus-debugging` | Tracing bugs, finding error sources |
| `gitnexus-refactoring` | Safe rename/extract/split/move |
| `gitnexus-guide` | Tools, resources, schema reference |
| `gitnexus-cli` | Index, status, clean, wiki commands |

**Index Data:**
- `.gitnexus/meta.json` — Project metadata (997 symbols, 1119 relationships, 6 execution flows)
- `.gitnexus/parse-cache/` — Cached AST parse results

---

### 3. Graphify — Knowledge Graph Visualization

Graphify converts your codebase into an interactive knowledge graph for visualization and analysis.

**Usage:**
```bash
# Generate/update the knowledge graph
npx graphify .

# View the interactive graph
open graphify-out/graph.html
```

**Output Files:**
- `graphify-out/graph.json` — Full graph data (nodes, edges, relationships)
- `graphify-out/graph.html` — Interactive HTML visualization (open in browser)
- `graphify-out/manifest.json` — File manifest with AST and semantic hashes
- `graphify-out/GRAPH_REPORT.md` — Generated analysis report
- `graphify-out/cost.json` — Processing cost data

**What It Captures:**
- All source files (contracts, scripts, tests, configs)
- AST-parsed structures (functions, classes, variables)
- Relationships between symbols
- Execution flows across the codebase

---

## Integrated Workflow

### Daily Development

```bash
# 1. Start with Speckit to define the feature
npx speckit specify "Your feature description"

# 2. Use GitNexus to understand existing code before editing
# (AI agents use gitnexus_impact before any edit)

# 3. Implement the feature (with GitNexus guardrails)

# 4. Run Graphify to visualize the updated codebase
npx graphify .

# 5. Commit and push
```

### Before Major Refactoring

```bash
# 1. Index with GitNexus
npx gitnexus analyze

# 2. Use gitnexus_impact to assess blast radius
# 3. Use gitnexus_refactoring for safe changes
# 4. Re-run Graphify to update visualization
npx graphify .
```

### Adding New Contracts

```bash
# 1. Specify the contract with Speckit
npx speckit specify "Add reward distribution contract"

# 2. Plan and implement

# 3. Update GitNexus index
npx gitnexus analyze

# 4. Update Graphify graph
npx graphify .
```

---

## Project Architecture

### Contracts (ZetaChain Cross-Chain)

- **CrossChainStaking.sol** — Core cross-chain staking logic
- **StakingRouterZEVM.sol** — Routes staking operations on ZetaChain EVM
- **StakingMessages.sol** — Message encoding/decoding for cross-chain communication
- **ZetaNativeStaking.sol** — Native ZETA staking on ZetaChain
- **ZetaMessenger.sol** — Cross-chain messaging via ZetaChain Gateway
- **ChainReceiver.sol** — Receives cross-chain calls on connected chains
- **Token contracts** — Universal token implementations for cross-chain assets

### Scripts (60+ utility scripts)

- **Deployment:** `deploy-*.ts` — Contract deployment scripts
- **Testing:** `test-*.ts` — On-chain test scripts
- **Inspection:** `inspect-*.ts` — Transaction and balance inspection
- **Movement:** `move-*.ts` — Cross-chain asset movement
- **Debug:** `debug-*.ts` — Debugging utilities

### UI (crosschainUI)

React + Vite application for cross-chain staking interface.

---

## Quick Reference

| Task | Command |
|------|---------|
| Compile contracts | `npm run build` |
| Run tests | `npm test` |
| Re-index GitNexus | `npx gitnexus analyze` |
| Update Graphify | `npx graphify .` |
| View graph | `open graphify-out/graph.html` |
| Start Speckit workflow | `npx speckit specify "..."` |
| Check GitNexus status | `npx gitnexus status` |

---

**Package**: zetachain-hardhat-multichain-starter | **Version**: 1.0.0 | **Last Updated**: 2026-06-09
