import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const txHash = "0xfc226153f2a8cbaf72e12fbf23243b85784529543eb17564b8895e37bc2a713e";
  console.log(`Fetching transaction ${txHash}...`);

  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    console.log("Transaction not found");
    return;
  }

  const receipt = await provider.getTransactionReceipt(txHash);
  console.log("Receipt Status:", receipt?.status);
  console.log("Receipt Gas Used:", receipt?.gasUsed.toString());
  console.log("Tx Gas Limit:", tx.gasLimit.toString());
  console.log("Tx Gas Price:", tx.gasPrice.toString());

  try {
    console.log("Replaying transaction with eth_call...");
    const code = await provider.call({
      to: tx.to,
      from: tx.from,
      data: tx.data,
      value: tx.value,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      nonce: tx.nonce,
      blockTag: tx.blockNumber ? tx.blockNumber - 1 : "latest"
    }, tx.blockNumber ? tx.blockNumber - 1 : "latest");
    console.log("Result (block - 1):", code);

    try {
      const codeLatest = await provider.call({
        to: tx.to,
        from: tx.from,
        data: tx.data,
        value: tx.value,
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice,
        blockTag: "latest"
      }, "latest");
      console.log("Result (latest):", codeLatest);
    } catch (err: any) {
      console.log("Replay at latest failed:", err.message);
      if (err.data) console.log("Revert data at latest:", err.data);
    }
  } catch (e: any) {
    console.log("Replay failed with error:", e.message);
    if (e.data) {
      console.log("Revert data:", e.data);
    }
  }
}

main().catch(console.error);
