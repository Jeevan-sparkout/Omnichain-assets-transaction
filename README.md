# ZetaChain Hardhat Multichain Starter

A comprehensive, production-ready Hardhat scaffold for developing, testing, and deploying Universal Apps and Universal Tokens across ZetaChain and connected EVM networks.

This repository demonstrates how to build interoperable, cross-chain smart contracts leveraging ZetaChain's cross-chain messaging and Omnichain Smart Contracts framework. It includes implementations for **UUPS Upgradeable** Universal Tokens, allowing tokens to be transferred across ZetaChain, Ethereum Sepolia, and BSC Testnet seamlessly.

## 🌟 Key Features

* **Universal Tokens:** Implementation of interoperable ERC-20 tokens that exist on ZetaChain and connected EVM chains, maintaining cross-chain balance synchronicity.
* **UUPS Upgradability:** Token contracts and messengers are deployed as UUPS (Universal Upgradeable Proxy Standard) proxies, allowing for logic updates without losing state.
* **Cross-Chain Messaging (CCMP):**
  * Inbound `onCall` handling on ZetaChain to receive messages and tokens from external chains.
  * Outbound cross-chain calls initiated through `GatewayZEVM`.
* **Multi-Chain Deployment Pipeline:** Scripts to seamlessly deploy contracts across ZetaChain Athens Testnet, BSC Testnet, and Ethereum Sepolia in a single command.
* **Omnichain Smart Contracts:** Interact with connected chains directly from a central contract deployed on ZetaChain.

## 📁 Project Structure

```text
├── contracts/
│   ├── ZetaMessenger.sol              # Core omnichain messaging contract on ZetaChain
│   ├── ChainReceiver.sol              # Receiver contract deployed on connected EVM chains
│   ├── interfaces/                    # Gateway and ZRC-20 interface definitions
│   └── token/
│       ├── ZetaChainUniversalToken.sol # UUPS Universal Token implementation for ZetaChain
│       └── EVMUniversalToken.sol      # UUPS Universal Token implementation for connected EVMs
├── scripts/
│   ├── deploy-testnet.ts              # One-click deployment to Zeta, Sepolia, and BSC Testnet
│   ├── deploy-zeta-messenger.ts       # Script to deploy the ZetaMessenger contract
│   ├── send-call.ts                   # Demo script to trigger a cross-chain call
│   ├── move-*.ts                      # Utility scripts for cross-chain token transfers
│   └── check-*.ts                     # Utility scripts for verifying cross-chain transaction state
├── test/
│   └── ZetaMessenger.test.ts          # Contract unit tests
└── hardhat.config.ts                  # Hardhat configuration with multi-chain network definitions
```

## 🛠️ Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   PRIVATE_KEY=0xYourPrivateKeyHere
   INITIAL_OWNER=0xYourWalletAddress
   
   # RPC URLs
   ZETA_RPC_URL=https://zetachain-athens-evm.blockpi.network/v1/rpc/public
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   BSC_RPC_URL=https://bsc-testnet-rpc.publicnode.com

   # Token Configuration
   TOKEN_NAME=JP
   TOKEN_SYMBOL=JP
   GAS_LIMIT=1000000

   # Gateway Addresses (Testnet)
   GATEWAY_BSC=0x0c487a766110c85d301d96e33579c5b317fa4995
   GATEWAY_ETHEREUM=0x0c487a766110c85d301d96e33579c5b317fa4995
   ```

*Note: Verify the latest Testnet Gateway addresses on the [ZetaChain Documentation](https://www.zetachain.com/docs/).*

## 🚀 Build & Deploy

### Compile Contracts
```bash
npm run build
```

### Multi-Chain Deployment
Deploy the Universal Token stack (behind UUPS Proxies) to ZetaChain, BSC Testnet, and Sepolia in one pass:
```bash
npm run deploy:testnet
```
*This script will output the proxy addresses and the implementation addresses for all three networks.*

### Individual Deployments
If you need to deploy components individually:
```bash
# Deploy the ZetaChain messenger contract
npm run deploy:zeta

# Deploy the destination-chain receiver contract
npm run deploy:receiver

# Deploy specific Universal Token implementations
npm run deploy:zeta-token
npm run deploy:evm-token
```

## 🔄 Cross-Chain Operations

### Triggering a Cross-Chain Call
To send a cross-chain message from ZetaChain to a connected network:
```bash
npm run demo:call
```
**Call Flow Overview:**
1. Quotes the destination gas fee using the destination-chain's ZRC-20 token.
2. Pulls the required gas fee from the caller's wallet.
3. Approves the ZetaChain Gateway.
4. Executes `callGatewayZEVM(...)` to route the message.

### Token Transfers
The repository includes several utility scripts to move tokens across chains. Ensure your `.env` is configured with the deployed token addresses:
```bash
npm run move:bsc-to-zeta     # Move tokens from BSC Testnet to ZetaChain
npm run move:sepolia-to-bsc  # Move tokens from Sepolia to BSC Testnet
```

### Monitoring Cross-Chain Transactions (CCTX)
You can track the status of your cross-chain transactions using the included checker scripts:
```bash
npm run check:cctx
npm run check:sepolia-zeta
```

## 📝 Development Notes

* **Gateway ABI**: The gateway ABI and `MessageContext` layout in this scaffold match the current documented ZetaChain pattern. If upgrading to a newer ZetaChain protocol release, ensure the interfaces are aligned.
* **Upgradability**: Universal Token contracts are designed to be upgradeable. They are deployed behind `ERC1967Proxy` instances. Always interact with the proxy address, not the raw implementation.
* **Chain Receiver**: `ChainReceiver.sol` is a minimal implementation to demonstrate receiving payload data. Replace its logic with your application-specific requirements.
* **Gas Limits**: Cross-chain operations require an adequate `GAS_LIMIT` specified in your `.env` file to ensure they don't revert on the destination chain.

## 🔗 Resources

- [ZetaChain Official Documentation](https://www.zetachain.com/docs/)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [ZetaChain Explorer (Athens Testnet)](https://explorer.athens.zetachain.com/)
