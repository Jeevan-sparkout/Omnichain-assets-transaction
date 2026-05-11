import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

dotenvConfig();

const privateKey = process.env.PRIVATE_KEY;
const accounts = privateKey ? [privateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    zetaTestnet: {
      url: process.env.RPC_ZETACHAIN ?? "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      chainId: 7001,
      accounts,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL ?? process.env.RPC_BASE_SEPOLIA ?? "",
      chainId: 84532,
      accounts,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL ?? process.env.RPC_ETHEREUM ?? "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts,
    },
    bscTestnet: {
      url: process.env.BSC_RPC_URL ?? process.env.RPC_BSC ?? "https://bsc-testnet-rpc.publicnode.com",
      chainId: 97,
      accounts,
    },
  },
  etherscan: {
    apiKey: process.env.API ?? "",
    customChains: [
      {
        network: "zetaTestnet",
        chainId: 7001,
        urls: {
          apiURL: "https://explorer.athens.zetachain.com/api",
          browserURL: "https://explorer.athens.zetachain.com"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
};

export default config;
