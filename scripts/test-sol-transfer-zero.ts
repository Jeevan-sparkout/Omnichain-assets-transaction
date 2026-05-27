import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);
  const wallet = new ethers.Wallet(privateKey, provider);

  const tokens = [
    { name: "SOL ZRC-20", address: "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501" },
    { name: "ETH ZRC-20", address: "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0" }
  ];

  const abi = [
    "function transfer(address recipient, uint256 amount) external returns (bool)",
    "function balanceOf(address) external view returns (uint256)"
  ];

  for (const token of tokens) {
    console.log(`\n=========================================`);
    console.log(`🔍 Testing ${token.name} (${token.address})`);
    console.log(`=========================================`);

    const contract = new ethers.Contract(token.address, abi, wallet);

    try {
      console.log("Simulating transfer(wallet, 0) with eth_call...");
      const txData = await contract.transfer.populateTransaction(wallet.address, 0);
      const result = await provider.call({
        from: wallet.address,
        to: token.address,
        data: txData.data
      });
      console.log("Simulation Result:", result);

      console.log("\nSending real on-chain transaction transfer(wallet, 0)...");
      const tx = await contract.transfer(wallet.address, 0);
      console.log("Tx sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Tx receipt status:", receipt.status);
    } catch (e: any) {
      console.log("\n❌ Transfer failed!");
      console.log("Error Message:", e.message.split("\n")[0]);
    }
  }
  }

main().catch(console.error);
