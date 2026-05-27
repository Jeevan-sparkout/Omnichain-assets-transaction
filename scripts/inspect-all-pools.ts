import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const routerAddress = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  
  // All ZRC-20 address candidates
  const sol1 = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";
  const sol2 = "0x4bC32034caCcc9B7e02536945eDbC286bACbA073";
  const eth = "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0";
  const bnb = "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891";
  const usdcSol = "0xD10932EB3616a937bd4a2652c87E9FeBbAce53e5";
  const usdcSep = "0xcC683A782f4B30c138787CB5576a86AF66fdc31d";

  const routerAbi = [
    "function factory() external view returns (address)"
  ];

  const factoryAbi = [
    "function getPair(address tokenA, address tokenB) external view returns (address)"
  ];

  const pairAbi = [
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
  ];

  const erc20Abi = [
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)"
  ];

  const router = new ethers.Contract(routerAddress, routerAbi, provider);
  const factoryAddress = await router.factory();
  const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);

  const targets = [
    { name: "SOL (ADF7)", address: sol1 },
    { name: "SOL (4bC3)", address: sol2 },
    { name: "Sepolia ETH", address: eth },
    { name: "BSC BNB", address: bnb },
    { name: "USDC Solana", address: usdcSol },
    { name: "USDC Sepolia", address: usdcSep }
  ];

  console.log("=========================================");
  console.log("🔍 Comprehensive zEVM Pool Audit");
  console.log(`Factory: ${factoryAddress}`);
  console.log("=========================================");

  for (const target of targets) {
    console.log(`\nAudit for WZETA / ${target.name}...`);
    try {
      const pairAddress = await factory.getPair(wzetaAddress, target.address);
      if (pairAddress === ethers.ZeroAddress) {
        console.log("❌ No pool exists.");
        continue;
      }

      console.log(`✅ Pool Contract: ${pairAddress}`);
      const pairContract = new ethers.Contract(pairAddress, pairAbi, provider);
      const t0Address = await pairContract.token0();
      const t1Address = await pairContract.token1();
      
      const t0Contract = new ethers.Contract(t0Address, erc20Abi, provider);
      const t1Contract = new ethers.Contract(t1Address, erc20Abi, provider);

      const sym0 = await t0Contract.symbol();
      const dec0 = await t0Contract.decimals();
      const sym1 = await t1Contract.symbol();
      const dec1 = await t1Contract.decimals();

      const reserves = await pairContract.getReserves();
      
      console.log(`  Token 0: ${sym0} (${t0Address})`);
      console.log(`    Reserve 0: ${ethers.formatUnits(reserves[0], dec0)} ${sym0}`);
      console.log(`  Token 1: ${sym1} (${t1Address})`);
      console.log(`    Reserve 1: ${ethers.formatUnits(reserves[1], dec1)} ${sym1}`);
    } catch (e: any) {
      console.log(`❌ Error: ${e.message}`);
    }
  }
}

main().catch(console.error);
