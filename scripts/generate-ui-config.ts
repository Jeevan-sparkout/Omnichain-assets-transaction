import * as fs from 'fs';
import { ethers } from 'ethers';

const BSC_CONTRACTS = [
    "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A"
];

const ZETA_CONTRACTS = [
    "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51"
];

const POOL_CONFIGS = [
    { poolId: 1, apy: "5.00%", lockPeriod: "1 Minute", lockSeconds: 60 },
    { poolId: 2, apy: "10.00%", lockPeriod: "2 Minutes", lockSeconds: 120 },
    { poolId: 3, apy: "15.00%", lockPeriod: "3 Minutes", lockSeconds: 180 },
    { poolId: 4, apy: "20.00%", lockPeriod: "4 Minutes", lockSeconds: 240 },
    { poolId: 5, apy: "25.00%", lockPeriod: "5 Minutes", lockSeconds: 300 },
    { poolId: 6, apy: "30.00%", lockPeriod: "6 Minutes", lockSeconds: 360 },
    { poolId: 7, apy: "35.00%", lockPeriod: "7 Minutes", lockSeconds: 420 },
    { poolId: 8, apy: "40.00%", lockPeriod: "8 Minutes", lockSeconds: 480 },
    { poolId: 9, apy: "45.00%", lockPeriod: "9 Minutes", lockSeconds: 540 },
    { poolId: 10, apy: "50.00%", lockPeriod: "10 Minutes", lockSeconds: 600 }
];

let poolsCode = `export const POOLS = [\n`;

// Generate BSC Pools
BSC_CONTRACTS.forEach((contract, index) => {
    POOL_CONFIGS.forEach(pc => {
        poolsCode += `  {
    chainId: 97,
    poolId: ${pc.poolId},
    contractIndex: ${index + 1},
    stakingAddress: "${contract}",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "${pc.apy}",
    lockPeriod: "${pc.lockPeriod}",
    lockSeconds: ${pc.lockSeconds}
  },\n`;
    });
});

// Generate Zeta Pools
ZETA_CONTRACTS.forEach((contract, index) => {
    POOL_CONFIGS.forEach(pc => {
        poolsCode += `  {
    chainId: 7001,
    poolId: ${pc.poolId},
    contractIndex: ${index + 1},
    stakingAddress: "${contract}",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "${pc.apy}",
    lockPeriod: "${pc.lockPeriod}",
    lockSeconds: ${pc.lockSeconds}
  },\n`;
    });
});

poolsCode += `];\n`;

const configTs = `import { ethers } from "ethers";

export const NETWORKS = {
  11155111: {
    id: 11155111,
    name: "Sepolia Testnet",
    nativeSymbol: "ETH",
    usdcAddress: "0x278b9F03AA9B7765Dc81c941594A76029b4e5e1E",
    isZetaNative: false,
    zrc20: "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0"
  },
  97: {
    id: 97,
    name: "BSC Testnet",
    nativeSymbol: "BNB",
    usdcAddress: "0xB2D37d48982d27f8093eDB764012Aad5420f8D1C",
    isZetaNative: false,
    zrc20: "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891"
  },
  7001: {
    id: 7001,
    name: "ZetaChain Testnet",
    nativeSymbol: "ZETA",
    usdcAddress: "0xE6401569b71A7892E4Aa3ec7e4651F64d46Ec33e",
    isZetaNative: true,
    zrc20: ethers.ZeroAddress
  }
};

${poolsCode}

export const LOCAL_STAKING_ABI = [
  "function stakeLocal(uint256 poolId, uint256 amount) external payable",
  "function withdrawLocal(uint256 poolId, uint256 amount) external",
  "function stakes(address, uint256) external view returns (uint256 amount, uint256 stakeTime, uint256 lastClaimTime)",
  "function getPendingReward(address user, uint256 poolId) external view returns (uint256)"
];

export const STAKING_ADAPTER_ABI = [
  "function stakeCrossChain(uint256 poolId, uint256 targetChainId, uint256 targetPoolId, uint256 amount) external payable",
  "function withdrawCrossChain(uint256 poolId, uint256 targetChainId, uint256 targetPoolId, uint256 amount) external"
];

export const NATIVE_STAKING_ABI = [
  "function stake(uint256 poolId, uint256 amount) external payable",
  "function withdraw(uint256 poolId) external",
  "function withdrawToTargetChain(uint256 poolId, uint256 targetChainId, address targetToken) external",
  "function stakes(address, uint256) external view returns (uint256 amount, uint256 stakeTime, uint256 lastClaimTime)",
  "function getPendingReward(address user, uint256 poolId) external view returns (uint256)"
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];
`;

fs.writeFileSync('crosschainUI/src/config.ts', configTs);
console.log("Written config.ts successfully!");
