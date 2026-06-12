import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcEth = process.env.RPC_ETHEREUM || "https://ethereum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcEth);
  const wallet = new ethers.Wallet(privateKey, provider);

  const sepoliaProxy = "0x6B644A9Ed78f135A6c4C75A0788d8D02a58e335D";
  const zrc20Solana = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501"; // Target chain Solana ZRC-20 SOL
  
  const abi = [
    "function transferCrossChain(address destination, address receiver, uint256 amount) external payable",
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  const contract = new ethers.Contract(sepoliaProxy, abi, wallet);

  console.log("=========================================");
  console.log("🚀 Moving JP from Sepolia to Solana Devnet");
  console.log("=========================================");
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(wallet.address);

  console.log(`Current Balance on Sepolia: ${ethers.formatUnits(balance, decimals)} ${symbol}`);

  if (balance === 0n) {
    throw new Error("No tokens to transfer on Sepolia.");
  }

  // Transfer 10 JP tokens
  const amountToTransfer = ethers.parseUnits("10", decimals); 
  const receiver = wallet.address;

  console.log(`Initiating transfer of ${ethers.formatUnits(amountToTransfer, decimals)} JP from Sepolia to Solana ZRC-20...`);
  
  // Cross-chain gas fee paid in Native ETH
  const tx = await contract.transferCrossChain(zrc20Solana, receiver, amountToTransfer, {
    value: ethers.parseEther("0.02"), // Send 0.02 ETH to cover cross-chain fees
    gasLimit: 300000 // Ensure transaction is not reverted by lack of local gas
  });

  console.log(`Transaction sent! TX Hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("\n🎉 Success! You initiated a transfer from Sepolia towards Solana.");
  console.log(`Track it on ZetaChain explorer using the TX hash:`);
  console.log(`👉 https://testnet.zetachain.com/cc/tx/${tx.hash}`);
}

main().catch(console.error);
