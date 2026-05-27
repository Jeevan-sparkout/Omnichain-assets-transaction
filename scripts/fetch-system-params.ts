import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  // SystemContract address on Athens-3
  const systemContractAddress = "0xEdf1c3275d13489aCdC6cD6eD246E72458B8795B";
  
  const systemContractAbi = [
    "function wZetaContractAddress() external view returns (address)",
    "function uniswapv2FactoryAddress() external view returns (address)",
    "function uniswapv2Router02Address() external view returns (address)"
  ];

  const systemContract = new ethers.Contract(systemContractAddress, systemContractAbi, provider);

  console.log("=========================================");
  console.log("🔍 Fetching ZetaChain Athens-3 System Parameters");
  console.log("=========================================");

  try {
    const wzeta = await systemContract.wZetaContractAddress();
    console.log(`WZETA Address:      ${wzeta}`);
    
    const factory = await systemContract.uniswapv2FactoryAddress();
    console.log(`Factory Address:    ${factory}`);
    
    const router = await systemContract.uniswapv2Router02Address();
    console.log(`Router Address:     ${router}`);
  } catch (e: any) {
    console.log("Error fetching parameters:", e.message);
  }
}

main().catch(console.error);
