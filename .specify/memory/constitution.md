# Omnichain Assets Transaction Constitution

## Core Principles

### I. Cross-Chain Security First

Every cross-chain operation MUST validate sender, amount, and chain ID before execution. Reentrancy guards are mandatory on all external-facing functions. No cross-chain call should trust data from the origin chain without verification.

### II. Test-Driven Development (NON-NEGOTIABLE)

TDD is mandatory for all smart contract code:
- Tests written → User approved → Tests fail → Then implement
- Red-Green-Refactor cycle strictly enforced
- Every contract function MUST have corresponding test coverage
- Cross-chain interactions MUST be tested with mock gateways and registries

### III. Gas Optimization

All contracts MUST be optimized for gas efficiency:
- Solidity optimizer enabled with 200 runs minimum
- Use `calldata` over `memory` for external function parameters
- Minimize storage reads/writes in loops
- Use `unchecked` blocks where safe
- Cross-chain message payloads MUST be tightly packed

### IV. Upgradeability Safety

- Use proxy patterns (ERC1967) only when upgradeability is explicitly required
- Storage layout MUST be append-only for upgradeable contracts
- New storage variables MUST use initializers, not constructors
- NEVER remove or reorder existing storage variables

### V. Modular Architecture

- Contracts MUST be split by responsibility (staking, messaging, routing, tokens)
- Interfaces MUST be defined for all cross-contract interactions
- Libraries MUST be used for reusable logic (math, encoding, validation)
- Each contract MUST have a single, well-defined purpose

### VI. Testnet-First Deployment

- All contracts MUST be deployed and verified on testnets before mainnet
- Testnet deployments MUST include end-to-end integration tests
- Real assets MUST NOT be used until full testnet validation
- Deployment scripts MUST be idempotent and resumable

## Technology Stack Requirements

- **Solidity Version**: 0.8.26 (cancun EVM)
- **Framework**: Hardhat with TypeScript
- **Testing**: Hardhat + ethers.js v6
- **Cross-Chain**: ZetaChain Gateway (TSS addresses, ZRC-20 tokens)
- **Token Standard**: OpenZeppelin 5.x (ERC20, ERC1967, AccessControl)
- **Solana Integration**: @solana/web3.js 1.x, @solana/spl-token

## Security Requirements

- All external calls MUST check return values
- Token transfers MUST use SafeERC20 or equivalent
- Ownership transfers MUST use two-step process (propose + accept)
- Emergency pause functionality REQUIRED for all staking contracts
- All cross-chain messages MUST include chain ID and sender verification

## Development Workflow

1. **Specify** feature with Speckit (`npx speckit specify`)
2. **Plan** implementation with Speckit (`npx speckit plan`)
3. **Generate tasks** with Speckit (`npx speckit tasks`)
4. **Analyze impact** with GitNexus before editing any symbol
5. **Implement** with test-first approach
6. **Review** with code-reviewer before merge
7. **Update** GitNexus index and Graphify graph after changes

## Quality Gates

- All tests MUST pass before merge
- Gas usage MUST be documented for all public functions
- All contracts MUST be verified on block explorer
- Impact analysis MUST be clean (no HIGH/CRITICAL unaddressed)
- Documentation MUST be updated for any interface changes

## Governance

This constitution supersedes all other practices. Amendments require:
1. Documented rationale
2. User approval
3. Migration plan for existing code

All PRs and reviews MUST verify compliance with this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-06-09 | **Last Amended**: 2026-06-09
