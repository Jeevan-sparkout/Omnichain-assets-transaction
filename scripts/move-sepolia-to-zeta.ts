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
  
  const abi = [
    "function transferCrossChain(address destination, address receiver, uint256 amount) external payable",
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  const contract = new ethers.Contract(sepoliaProxy, abi, wallet);

  console.log("--- Moving JP from Sepolia to ZetaChain ---");
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(wallet.address);

  console.log(`Current Balance on Sepolia: ${ethers.formatUnits(balance, decimals)} ${symbol}`);

  if (balance === 0n) {
    throw new Error("No tokens to transfer on Sepolia.");
  }

  const amountToTransfer = balance; // Transfer all back
  const destination = ethers.ZeroAddress; // address(0) means ZetaChain
  const receiver = wallet.address;

  console.log(`Initiating transfer of ${ethers.formatUnits(amountToTransfer, decimals)} JP back to ZetaChain...`);
  
  // To ZetaChain, no additional msg.value is required for gas usually, 
  // but let's check the contract logic again. 
  // UniversalTokenCore.sol:149: if (destination == address(0) && msg.value > 0) revert TransferToZetaChainRequiresNoGas();
  
  const tx = await contract.transferCrossChain(destination, receiver, amountToTransfer, {
    value: 0
  });

  console.log(`Transaction sent! TX Hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("\n🎉 Success! You initiated a transfer from Sepolia back to ZetaChain.");
  console.log(`Track it on ZetaChain explorer using the TX hash or recipient address.`);
}

main().catch(console.error);
