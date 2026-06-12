# Multi-Asset Cross-Chain Staking (ZetaChain V2)

## Project Overview
This project implements a multi-chain staking infrastructure leveraging ZetaChain V2. It consists of edge-chain staking contracts, a central ZetaChain hub router for cross-chain message coordination, and a native ZetaChain staking contract. Additionally, it features a React-based frontend UI.

## Architecture

1. **Edge Chain Staking (`contracts/crosschain/CrossChainStaking.sol`)**
   - Deployed on non-ZetaChain EVM networks (e.g., Sepolia, BSC Testnet).
   - Allows users to stake natively (local staking) or initiate cross-chain stakes via ZetaChain.
   - Interfaces directly with `IGatewayEVM` to send messages to the ZetaChain hub.

2. **Zeta Hub Router (`contracts/crosschain/StakingRouterZEVM.sol`)**
   - Deployed centrally on the ZetaChain zEVM.
   - Acts as a message coordinator, receiving cross-chain staking and withdrawal intents.
   - Automatically handles token swaps (via Uniswap V2) if the incoming token doesn't match the target chain's native token or accepted pool token.
   - Forwards funds and messages to the target chain using `gateway.withdrawAndCall`.

3. **Zeta Native Staking (`contracts/zevm/ZetaNativeStaking.sol`)**
   - Deployed on the ZetaChain zEVM.
   - Standalone staking contract that holds stakes directly on the zEVM.
   - Accepts native ZETA and standard ZRC-20 tokens directly (no gateway messaging required for stakes originating from within zEVM).

4. **Frontend Interface (`crosschainUI/`)**
   - Built with React (Vite, TypeScript, Tailwind-like utility CSS).
   - Features a strict dark-mode design as specified in `design.md`.
   - Contains a static UI that is prepared for `ethers.js` integration.

---

## Deployed Contract Registry (Testnets)

### 1. Sepolia Testnet (`chainId: 11155111`)
- **CrossChainStaking**: `0x9A46B4092fdBdfe6C66b2332813EAC53D1772421`
- **Batch 1 (Contract 1)**: Pending funds
- **Batch 1 (Contract 2)**: Pending funds
- **Batch 1 (Contract 3)**: Pending funds
- **Batch 1 (Contract 4)**: Pending funds
- **Batch 1 (Contract 5)**: Pending funds

### 2. BSC Testnet (`chainId: 97`)
- **CrossChainStaking**: `0x0CA440CFFE824A95dd7414E17d3792817D3ACEdf`
- **Batch 1 (Contract 1)**: `0xEB9CF75B2f032d4cC4A122F814cB73f95618e314`
- **Batch 1 (Contract 2)**: `0x7CB465aC74B2Feae06cE78e6dC2395a165445353`
- **Batch 1 (Contract 3)**: `0x3F46E4CD9375B92112EC12c7C5580B522250A77A`
- **Batch 1 (Contract 4)**: `0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F`
- **Batch 1 (Contract 5)**: `0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A`

### 3. ZetaChain Athens 3 Testnet (`chainId: 7001`)
- **StakingRouterZEVM (Cross-Chain Hub)**: `0xcb9b66068f587B0E2f46cc9F06c686Bf4907b73F`
- **ZetaNativeStaking (Local zEVM Staking)**: `0xB00Aa51D0b175e5295c608C7550C57dca82C7CCB`
- **Batch 1 (Contract 1)**: `0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C`
- **Batch 1 (Contract 2)**: `0x89a801ff88A30DFF80b2Fee01DEeC43791827C54`
- **Batch 1 (Contract 3)**: `0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701`
- **Batch 1 (Contract 4)**: `0x79C7aE287Cca853B31B17205cA690f0A7e6831B4`
- **Batch 1 (Contract 5)**: `0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51`

---

## Important Directories & Files

- `contracts/crosschain/` - Contains the cross-chain staking architecture (`CrossChainStaking.sol` and `StakingRouterZEVM.sol`).
- `contracts/zevm/` - Contains native ZetaChain contracts (`ZetaNativeStaking.sol`).
- `scripts/` - Hardhat deployment and configuration scripts.
  - `deploy-staking-edge.ts` - Edge chain deployments.
  - `deploy-staking-zevm.ts` - zEVM hub router deployment.
  - `deploy-native-zevm.ts` - zEVM native staking deployment.
- `crosschainUI/` - The React frontend application.
  - `design.md` - The UI/UX specification.

---

## Agent Guidelines
- **Gateway Status**: As of the last update, the ZetaChain Cross-Chain Gateway was paused at the protocol level. All testing of live cross-chain functions (depositAndCall / withdrawAndCall) will remain suspended until the network is unpaused.
- **Frontend Focus**: If directed to work on the UI, navigate to `crosschainUI/` and ensure that all new components respect the existing dark theme defined in `crosschainUI/src/index.css`.
