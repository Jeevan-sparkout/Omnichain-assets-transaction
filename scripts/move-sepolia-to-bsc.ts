import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcEth = process.env.RPC_ETHEREUM || "https://ethereum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcEth);
  const wallet = new ethers.Wallet(privateKey, provider);

  const sepoliaProxy = "0x6B644A9Ed78f135A6c4C75A0788d8D02a58e335D";
  const zrc20BscBnb = "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891"; // Target chain gas token (BSC)
  
  const abi = [
    "function transferCrossChain(address destination, address receiver, uint256 amount) external payable",
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  const contract = new ethers.Contract(sepoliaProxy, abi, wallet);

  console.log("--- Moving JP from Sepolia to BSC Testnet ---");
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(wallet.address);

  console.log(`Current Balance on Sepolia: ${ethers.formatUnits(balance, decimals)} ${symbol}`);

  if (balance === 0n) {
    throw new Error("No tokens to transfer on Sepolia.");
  }

  const amountToTransfer = balance; // Transfer all
  const receiver = wallet.address;

  console.log(`Initiating transfer of ${ethers.formatUnits(amountToTransfer, decimals)} JP from Sepolia to BSC...`);
  
  // Cross-chain gas fee paid in Native ETH
  const tx = await contract.transferCrossChain(zrc20BscBnb, receiver, amountToTransfer, {
    value: ethers.parseEther("0.01") // Send 0.01 ETH to cover destination gas on BSC
  });

  console.log(`Transaction sent! TX Hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("\n🎉 Success! You initiated a transfer from Sepolia directly to BSC.");
  console.log(`Track it on ZetaChain explorer using the TX hash or recipient address.`);
}

main().catch(console.error);
