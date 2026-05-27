import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const block = await provider.getBlock("latest");
  if (!block) return;
  const localTime = Math.floor(Date.now() / 1000);
  console.log("Block Number:", block.number);
  console.log("Block Timestamp:", block.timestamp);
  console.log("Local System Time:", localTime);
  console.log("Difference (Local - Block):", localTime - Number(block.timestamp), "seconds");
}

main().catch(console.error);
