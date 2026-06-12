import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const txHash = "0x639908195421bbe01af263ae9f7300b30cc1a1b7ebdb73c9cfd28575896ba2eb";
  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    console.error("Transaction not found");
    return;
  }

  console.log("Analyzing Tx:", txHash);
  console.log("To:", tx.to);
  console.log("From:", tx.from);
  console.log("Block:", tx.blockNumber);

  try {
    const code = await provider.call({
      to: tx.to,
      from: tx.from,
      data: tx.data,
      value: tx.value,
      gasPrice: tx.gasPrice,
      gasLimit: tx.gasLimit,
    }, tx.blockNumber ? tx.blockNumber - 1 : "latest");
    console.log("Call result:", code);
  } catch (e: any) {
    console.log("Simulation failed with error:");
    console.log(e);
    if (e.data) {
      console.log("Revert data:", e.data);
      try {
        const decoded = ethers.abiCoder.decode(["string"], e.data);
        console.log("Decoded string revert reason:", decoded);
      } catch {}
    }
  }
}

main().catch(console.error);
