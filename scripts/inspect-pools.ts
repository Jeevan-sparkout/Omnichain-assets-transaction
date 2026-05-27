import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const routerAddress = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  
  // SOL ZRC-20 address candidates
  const sol1 = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";
  const sol2 = "0x4bC32034caCcc9B7e02536945eDbC286bACbA073";

  const routerAbi = [
    "function factory() external view returns (address)",
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
  ];

  const factoryAbi = [
    "function getPair(address tokenA, address tokenB) external view returns (address)"
  ];

  const pairAbi = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
  ];

  const router = new ethers.Contract(routerAddress, routerAbi, provider);

  console.log("=========================================");
  console.log("🔍 Inspecting zEVM Uniswap V2 Pools");
  console.log("=========================================");

  const factoryAddress = await router.factory();
  console.log(`Factory Address: ${factoryAddress}`);

  const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);

  const testPairs = [
    { name: "WZETA / SOL ZRC-20 (ADF7)", tokenA: wzetaAddress, tokenB: sol1 },
    { name: "WZETA / SOL ZRC-20 (4bC3)", tokenA: wzetaAddress, tokenB: sol2 }
  ];

  for (const pair of testPairs) {
    console.log(`\nChecking pair: ${pair.name}...`);
    try {
      const pairAddress = await factory.getPair(pair.tokenA, pair.tokenB);
      console.log(`Pair contract: ${pairAddress}`);
      if (pairAddress !== ethers.ZeroAddress) {
        const pairContract = new ethers.Contract(pairAddress, pairAbi, provider);
        const reserves = await pairContract.getReserves();
        console.log(`Reserves: Reserve0 = ${reserves[0]}, Reserve1 = ${reserves[1]}`);
        
        // Let's query amountOut for 1 WZETA
        try {
          const amounts = await router.getAmountsOut(ethers.parseEther("1.0"), [pair.tokenA, pair.tokenB]);
          console.log(`AmountsOut for 1.0 WZETA: ${amounts[1]}`);
        } catch (err: any) {
          console.log(`getAmountsOut error: ${err.message}`);
        }
      }
    } catch (e: any) {
      console.log(`Error checking pair: ${e.message}`);
    }
  }
}

main().catch(console.error);
