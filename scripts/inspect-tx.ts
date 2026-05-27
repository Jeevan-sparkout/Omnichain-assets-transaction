import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const txHash = "0x61f88c2ef19b28468df53f27de847bebbf4b8c520f3a4ecf6bd3046e212d8dd3";
  console.log(`Fetching transaction ${txHash}...`);

  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    console.log("Transaction not found");
    return;
  }

  const receipt = await provider.getTransactionReceipt(txHash);
  console.log("Receipt Status:", receipt?.status);
  console.log("To:", tx.to);
  console.log("From:", tx.from);
  console.log("Value:", tx.value.toString());
  
  if (tx.data) {
    console.log("Data length:", tx.data.length);
    // Decode data
    const iface = new ethers.Interface([
      "function approve(address spender, uint256 amount)"
    ]);
    try {
      const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });
      console.log("Decoded function:", decoded?.name);
      console.log("Decoded arguments:", decoded?.args.map(arg => arg.toString()));
    } catch (e: any) {
      console.log("Failed to decode:", e.message);
    }
  }
}

main().catch(console.error);
