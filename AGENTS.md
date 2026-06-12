# Agent Instructions — Omnichain Assets Transaction

This project uses three AI-assisted tools: **Speckit**, **GitNexus**, and **Graphify**. All agents MUST follow the workflows below.

---

## Project Context

- **Project**: ZetaChain Cross-Chain Staking & Messaging System
- **Contracts**: Solidity 0.8.26 on ZetaChain EVM, Ethereum Sepolia, BSC Testnet, Solana Devnet
- **Stack**: Hardhat, TypeScript, ethers.js v6, OpenZeppelin 5.x, @solana/web3.js
- **Index**: 997 symbols, 1119 relationships, 6 execution flows (GitNexus)

---

## Speckit — Specification-Driven Development

Speckit guides feature development through: **Specify → Plan → Tasks → Implement**.

### Workflow

```bash
# Start a new feature
npx speckit specify "Add cross-chain reward distribution"

# Review generated spec → then plan
npx speckit plan "Add cross-chain reward distribution"

# Review plan → then generate tasks
npx speckit tasks "Add cross-chain reward distribution"

# Implement tasks
npx speckit implement "Add cross-chain reward distribution"
```

### Key Files

| File | Purpose |
|------|---------|
| `.specify/memory/constitution.md` | Project principles & constraints |
| `.specify/templates/spec-template.md` | Feature specification template |
| `.specify/templates/plan-template.md` | Implementation plan template |
| `.specify/templates/tasks-template.md` | Task breakdown template |
| `.specify/workflows/speckit/workflow.yml` | Full SDD cycle workflow |
| `.specify/extensions.yml` | Git auto-commit hooks |

### Constitution

Before any implementation, verify compliance with the project constitution in `.specify/memory/constitution.md`. Key principles:
- Cross-chain security first (validate sender, amount, chain ID)
- Test-driven development (mandatory for all contracts)
- Gas optimization required
- Testnet-first deployment

---

## GitNexus — Code Intelligence

GitNexus indexes the codebase for deep code understanding and safe editing.

### Index Commands

```bash
npx gitnexus analyze    # Re-index (run when stale or after adding/removing files)
npx gitnexus status     # Check index freshness (shows if stale)
npx gitnexus clean      # Clear index cache
```

**Staleness Detection**: Run `npx gitnexus status` — if it reports stale or missing, run `npx gitnexus analyze` to re-index.

### Mandatory Rules for All Agents

1. **MUST run impact analysis before editing any symbol:**
   ```
   gitnexus_impact({target: "symbolName", direction: "upstream"})
   ```
   Report blast radius (direct callers, affected processes, risk level) to user.

2. **MUST run change detection before committing:**
   ```
   gitnexus_detect_changes()
   ```

3. **MUST warn user** if impact analysis returns HIGH or CRITICAL risk.

4. **MUST use gitnexus for exploration** instead of grep:
   ```
   gitnexus_query({query: "concept"})
   gitnexus_context({name: "symbolName"})
   ```

### Never Do

- NEVER edit a function/class/method without first running `gitnexus_impact`
- NEVER ignore HIGH or CRITICAL risk warnings
- NEVER rename symbols with find-and-replace — use `gitnexus_rename`
- NEVER commit without running `gitnexus_detect_changes()`

### Skills

| Skill | Use For |
|-------|---------|
| `.claude/skills/gitnexus/gitnexus-exploring/` | Architecture, execution flows |
| `.claude/skills/gitnexus/gitnexus-impact-analysis/` | Blast radius before edits |
| `.claude/skills/gitnexus/gitnexus-debugging/` | Bug tracing, error sources |
| `.claude/skills/gitnexus/gitnexus-refactoring/` | Safe rename/extract/split |
| `.claude/skills/gitnexus/gitnexus-guide/` | Tools, resources, schema |
| `.claude/skills/gitnexus/gitnexus-cli/` | CLI commands reference |

---

## Graphify — Knowledge Graph Visualization

Graphify converts code to an interactive knowledge graph for architecture understanding.

### Commands

```bash
npx graphify .              # Generate/update knowledge graph
open graphify-out/graph.html  # Open interactive visualization
```

### Output Files

| File | Purpose |
|------|---------|
| `graphify-out/graph.json` | Full graph data (nodes, edges) |
| `graphify-out/graph.html` | Interactive HTML visualization |
| `graphify-out/manifest.json` | File manifest with hashes |
| `graphify-out/GRAPH_REPORT.md` | Analysis report |
| `graphify-out/cost.json` | Processing cost data |

### When to Use Graphify

- After adding new contracts or major refactoring
- When onboarding to understand codebase relationships
- Before architectural decisions to visualize dependencies
- To generate documentation of the codebase structure

---

## Integrated Development Workflow

### Adding a New Feature

```bash
# 1. Specify with Speckit
npx speckit specify "Your feature description"

# 2. Analyze impact with GitNexus (before editing)
gitnexus_impact({target: "affectedSymbol"})

# 3. Implement (test-first)

# 4. Update indexes
npx gitnexus analyze    # Re-index code
npx graphify .          # Update knowledge graph

# 5. Verify and commit
gitnexus_detect_changes()
```

### Refactoring

```bash
# 1. Understand with GitNexus
gitnexus_query({query: "module to refactor"})
gitnexus_context({name: "functionName"})

# 2. Assess blast radius
gitnexus_impact({target: "symbolName"})

# 3. Use gitnexus_rename for safe renames

# 4. Update graph after changes
npx graphify .
```

### Debugging

```bash
# 1. Trace with GitNexus
gitnexus_query({query: "error concept"})
gitnexus_context({name: "failingFunction"})

# 2. Fix the issue

# 3. Update indexes if structure changed
npx gitnexus analyze
```

---

## Project Structure Quick Reference

```
contracts/           # Solidity contracts
├── crosschain/      # Cross-chain staking & messaging
├── zevm/           # ZetaChain EVM
├── token/          # Universal tokens
├── interfaces/     # Contract interfaces
└── test/           # Mock contracts

scripts/             # 60+ deployment & utility scripts
test/                # Hardhat tests
crosschainUI/        # React UI

.specify/            # Speckit config
.gitnexus/           # GitNexus index
graphify-out/        # Graphify output
```

---

## Useful Commands

| Task | Command |
|------|---------|
| Compile contracts | `npm run build` |
| Run tests | `npm test` |
| Re-index GitNexus | `npx gitnexus analyze` |
| Update Graphify | `npx graphify .` |
| View knowledge graph | `open graphify-out/graph.html` |
| Start Speckit workflow | `npx speckit specify "..."` |
| Check GitNexus status | `npx gitnexus status` |

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Omnichain-assets-transaction** (1551 symbols, 1693 relationships, 6 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Omnichain-assets-transaction/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Omnichain-assets-transaction/clusters` | All functional areas |
| `gitnexus://repo/Omnichain-assets-transaction/processes` | All execution flows |
| `gitnexus://repo/Omnichain-assets-transaction/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
