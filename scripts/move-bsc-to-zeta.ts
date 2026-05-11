import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcBsc = process.env.RPC_BSC || "https://bsc-testnet-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcBsc);
  const wallet = new ethers.Wallet(privateKey, provider);

  const bscProxy = "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe";
  
  const abi = [
    "function transferCrossChain(address destination, address receiver, uint256 amount) external payable",
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  const contract = new ethers.Contract(bscProxy, abi, wallet);

  console.log("--- Moving JP from BSC Testnet to ZetaChain ---");
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(wallet.address);

  console.log(`Current Balance on BSC: ${ethers.formatUnits(balance, decimals)} ${symbol}`);

  if (balance === 0n) {
    throw new Error("No tokens to transfer on BSC.");
  }

  const amountToTransfer = balance; // Transfer everything back
  const destination = ethers.ZeroAddress; // address(0) means ZetaChain
  const receiver = wallet.address;

  console.log(`Initiating transfer of ${ethers.formatUnits(amountToTransfer, decimals)} JP back to ZetaChain...`);
  
  // To ZetaChain, no additional msg.value is required for gas
  const tx = await contract.transferCrossChain(destination, receiver, amountToTransfer, {
    value: 0
  });

  console.log(`Transaction sent! TX Hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("\n🎉 Success! You initiated a transfer from BSC back to ZetaChain.");
  console.log(`Track it on ZetaChain explorer using the TX hash or recipient address.`);
}

main().catch(console.error);
