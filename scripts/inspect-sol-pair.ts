import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const pairAddress = "0x7ffF1Ce917dCA287a08A00F7EB0dE245c4D91E39";
  const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  const solZrc20Address = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";

  const erc20Abi = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const pairAbi = [
    "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() view returns (address)",
    "function token1() view returns (address)"
  ];

  const wzeta = new ethers.Contract(wzetaAddress, erc20Abi, provider);
  const sol = new ethers.Contract(solZrc20Address, erc20Abi, provider);
  const pair = new ethers.Contract(pairAddress, pairAbi, provider);

  console.log("=========================================");
  console.log("🔍 Inspecting WZETA / SOL Pair Contract");
  console.log(`Pair: ${pairAddress}`);
  console.log("=========================================");

  const t0 = await pair.token0();
  const t1 = await pair.token1();

  const reserves = await pair.getReserves();
  const balanceWzeta = await wzeta.balanceOf(pairAddress);
  const balanceSol = await sol.balanceOf(pairAddress);

  console.log(`Token 0: ${t0}`);
  console.log(`Token 1: ${t1}`);

  console.log(`\nWZETA Address: ${wzetaAddress}`);
  console.log(`SOL.SOL Address: ${solZrc20Address}`);

  console.log(`\nReserves:`);
  console.log(`  WZETA Reserve: ${ethers.formatEther(t0 === wzetaAddress ? reserves[0] : reserves[1])}`);
  console.log(`  SOL Reserve:   ${ethers.formatUnits(t0 === solZrc20Address ? reserves[0] : reserves[1], 9)}`);

  console.log(`\nActual Balances in Pair contract:`);
  console.log(`  WZETA Balance: ${ethers.formatEther(balanceWzeta)}`);
  console.log(`  SOL Balance:   ${ethers.formatUnits(balanceSol, 9)}`);
}

main().catch(console.error);
