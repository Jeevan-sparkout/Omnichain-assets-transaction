import { ethers } from "ethers";

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

export const POOLS = [
  {
    chainId: 97,
    poolId: 1,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 97,
    poolId: 2,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 97,
    poolId: 3,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 97,
    poolId: 4,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 97,
    poolId: 5,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 97,
    poolId: 6,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 97,
    poolId: 7,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 97,
    poolId: 8,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 97,
    poolId: 9,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 97,
    poolId: 10,
    contractIndex: 1,
    stakingAddress: "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 97,
    poolId: 1,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 97,
    poolId: 2,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 97,
    poolId: 3,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 97,
    poolId: 4,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 97,
    poolId: 5,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 97,
    poolId: 6,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 97,
    poolId: 7,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 97,
    poolId: 8,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 97,
    poolId: 9,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 97,
    poolId: 10,
    contractIndex: 2,
    stakingAddress: "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 97,
    poolId: 1,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 97,
    poolId: 2,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 97,
    poolId: 3,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 97,
    poolId: 4,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 97,
    poolId: 5,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 97,
    poolId: 6,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 97,
    poolId: 7,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 97,
    poolId: 8,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 97,
    poolId: 9,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 97,
    poolId: 10,
    contractIndex: 3,
    stakingAddress: "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 97,
    poolId: 1,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 97,
    poolId: 2,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 97,
    poolId: 3,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 97,
    poolId: 4,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 97,
    poolId: 5,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 97,
    poolId: 6,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 97,
    poolId: 7,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 97,
    poolId: 8,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 97,
    poolId: 9,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 97,
    poolId: 10,
    contractIndex: 4,
    stakingAddress: "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 97,
    poolId: 1,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 97,
    poolId: 2,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 97,
    poolId: 3,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 97,
    poolId: 4,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 97,
    poolId: 5,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 97,
    poolId: 6,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 97,
    poolId: 7,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 97,
    poolId: 8,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 97,
    poolId: 9,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 97,
    poolId: 10,
    contractIndex: 5,
    stakingAddress: "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A",
    adapterAddress: "0x0000000000000000000000000000000000000000", // TBD
    tokenName: "Native BNB",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 7001,
    poolId: 1,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 7001,
    poolId: 2,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 7001,
    poolId: 3,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 7001,
    poolId: 4,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 7001,
    poolId: 5,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 7001,
    poolId: 6,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 7001,
    poolId: 7,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 7001,
    poolId: 8,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 7001,
    poolId: 9,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 7001,
    poolId: 10,
    contractIndex: 1,
    stakingAddress: "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 7001,
    poolId: 1,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 7001,
    poolId: 2,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 7001,
    poolId: 3,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 7001,
    poolId: 4,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 7001,
    poolId: 5,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 7001,
    poolId: 6,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 7001,
    poolId: 7,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 7001,
    poolId: 8,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 7001,
    poolId: 9,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 7001,
    poolId: 10,
    contractIndex: 2,
    stakingAddress: "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 7001,
    poolId: 1,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 7001,
    poolId: 2,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 7001,
    poolId: 3,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 7001,
    poolId: 4,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 7001,
    poolId: 5,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 7001,
    poolId: 6,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 7001,
    poolId: 7,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 7001,
    poolId: 8,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 7001,
    poolId: 9,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 7001,
    poolId: 10,
    contractIndex: 3,
    stakingAddress: "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 7001,
    poolId: 1,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 7001,
    poolId: 2,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 7001,
    poolId: 3,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 7001,
    poolId: 4,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 7001,
    poolId: 5,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 7001,
    poolId: 6,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 7001,
    poolId: 7,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 7001,
    poolId: 8,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 7001,
    poolId: 9,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 7001,
    poolId: 10,
    contractIndex: 4,
    stakingAddress: "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
  {
    chainId: 7001,
    poolId: 1,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "5.00%",
    lockPeriod: "1 Minute",
    lockSeconds: 60
  },
  {
    chainId: 7001,
    poolId: 2,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "10.00%",
    lockPeriod: "2 Minutes",
    lockSeconds: 120
  },
  {
    chainId: 7001,
    poolId: 3,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "15.00%",
    lockPeriod: "3 Minutes",
    lockSeconds: 180
  },
  {
    chainId: 7001,
    poolId: 4,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "20.00%",
    lockPeriod: "4 Minutes",
    lockSeconds: 240
  },
  {
    chainId: 7001,
    poolId: 5,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "25.00%",
    lockPeriod: "5 Minutes",
    lockSeconds: 300
  },
  {
    chainId: 7001,
    poolId: 6,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "30.00%",
    lockPeriod: "6 Minutes",
    lockSeconds: 360
  },
  {
    chainId: 7001,
    poolId: 7,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "35.00%",
    lockPeriod: "7 Minutes",
    lockSeconds: 420
  },
  {
    chainId: 7001,
    poolId: 8,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "40.00%",
    lockPeriod: "8 Minutes",
    lockSeconds: 480
  },
  {
    chainId: 7001,
    poolId: 9,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "45.00%",
    lockPeriod: "9 Minutes",
    lockSeconds: 540
  },
  {
    chainId: 7001,
    poolId: 10,
    contractIndex: 5,
    stakingAddress: "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51",
    adapterAddress: "0x0000000000000000000000000000000000000000", // Not needed natively
    tokenName: "Native ZETA",
    tokenAddress: ethers.ZeroAddress,
    apy: "50.00%",
    lockPeriod: "10 Minutes",
    lockSeconds: 600
  },
];


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
