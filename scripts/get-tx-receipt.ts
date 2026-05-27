import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const txHash = "0xc283a3853cf11c5f6d2492f53b11fbf9bf6d71bbd7c918c6080a918829ebbcf4";
  console.log(`Fetching receipt for transaction ${txHash}...`);

  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    console.log("Receipt not found");
    return;
  }

  console.log("Receipt Status:", receipt.status);
  console.log("Block Number:", receipt.blockNumber);
  console.log("Gas Used:", receipt.gasUsed.toString());
  console.log("Logs count:", receipt.logs.length);

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i];
    console.log(`Log #${i}:`);
    console.log(`  Address: ${log.address}`);
    console.log(`  Topics:`, log.topics);
    console.log(`  Data: ${log.data}`);
  }
}

main().catch(console.error);
