# ZetaChain UI & Contract Configuration Review

This document outlines the current configurations saved in the project that are suitable for **testing/development**, and details what the **actual (production)** configuration should be before deploying or releasing.

---

## 1. Frontend Configuration (`crosschainUI/src/config.ts`)

### Current Saved Config (Suitable for Testing)
The application currently points to Testnets and uses Mock tokens:

*   **Sepolia Testnet (Chain ID: 11155111)**
    *   `stakingAddress`: `0x9A46B4092fdBdfe6C66b2332813EAC53D1772421` (Testnet Contract)
    *   `usdcAddress`: `0xfe692abffa23D2ffAb6C0591692347510D98dF3f` (Mock USDC)
*   **BSC Testnet (Chain ID: 97)**
    *   `stakingAddress`: `0x0CA440CFFE824A95dd7414E17d3792817D3ACEdf` (Testnet Contract)
    *   `usdcAddress`: `0x21256efE77e24a9F5B1e0c28759A3e26F3fb990D` (Mock USDC)
*   **ZetaChain Testnet (Chain ID: 7001)**
    *   `stakingAddress`: `0xB00Aa51D0b175e5295c608C7550C57dca82C7CCB` (ZetaNativeStaking Testnet)
    *   `usdcAddress`: `0xF39D31eF9d971Ccaf7473493EFe4846A3aEE745A` (Mock USDC)
*   **Pools:** Defined to use `Mock USDC` with mock APY values (`5.00%`, `8.00%`).

### Actual Config (For Production/Mainnet)
For production, the file must be updated to reference Mainnet networks and real assets:

*   **Ethereum Mainnet (Chain ID: 1)**
    *   `name`: "Ethereum"
    *   `usdcAddress`: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (Real Mainnet USDC)
    *   `stakingAddress`: *Must be replaced with the Mainnet deployed contract address.*
*   **BNB Smart Chain Mainnet (Chain ID: 56)**
    *   `name`: "BNB Smart Chain"
    *   `usdcAddress`: `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` (Real BSC USDC)
    *   `stakingAddress`: *Must be replaced with the Mainnet deployed contract address.*
*   **ZetaChain Mainnet (Chain ID: 7000)**
    *   `name`: "ZetaChain Mainnet"
    *   `usdcAddress`: *ZRC20 Mainnet equivalent of USDC or Native USDC on ZetaChain.*
    *   `stakingAddress`: *Must be replaced with the Mainnet deployed contract address.*
*   **Pools:** Rename "Mock USDC" to "USDC". Real APY data should ideally be fetched dynamically rather than hardcoded.

---

## 2. Hardhat Configuration (`hardhat.config.ts`)

### Current Saved Config (Suitable for Testing)
*   Configures testnets: `zetaTestnet` (7001), `baseSepolia` (84532), `sepolia` (11155111), and `bscTestnet` (97).
*   Uses public RPC URLs (e.g., `https://ethereum-sepolia-rpc.publicnode.com`).
*   Accounts are driven by a single `PRIVATE_KEY` stored in `.env`.

### Actual Config (For Production/Mainnet)
*   Must define mainnet networks: `mainnet` (1), `bsc` (56), `zetaMainnet` (7000).
*   RPC URLs should use premium/private providers (like Infura, Alchemy, or specialized providers) to ensure reliability and avoid rate-limiting during mainnet deployments.
*   Accounts should be managed using a secure method (e.g., hardware wallet integration, KMS, or strictly secured private/deployment keys not stored as plain text locally).

---

## 3. Environment Variables (`.env`)

### Current Saved Config (Suitable for Testing)
*   Contains a hardcoded `WALLET_PRIVATE_KEY` (`936cd7...`) and `PRIVATE_KEY` (`8035cb...`) which is a high security risk if leaked.
*   Contains Testnet RPCs (`https://0xrpc.io/sep`, `https://zetachain-athens.g.allthatnode.com/archive/evm`).
*   Uses Testnet Gateway and ZRC20 token addresses (e.g., `ZRC20_SEPOLIA_ETH`).

### Actual Config (For Production/Mainnet)
*   **CRITICAL SECURITY FIX:** Remove all real/development private keys from the repository or tracked files entirely. Use a secure keystore for production deployment keys.
*   Replace all `_RPC_URL` variables with production Mainnet endpoints.
*   Replace Testnet Gateway addresses (e.g., `GATEWAY_ETHEREUM=0x0c487a766110c85d301d96e33579c5b317fa4995`) with their respective Mainnet ZetaChain Gateway contract addresses.
*   Update `ZRC20` references to point to Mainnet ZRC20 token contracts.
