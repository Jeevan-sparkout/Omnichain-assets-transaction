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
  
  const abi = [
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  console.log("=========================================");
  console.log("🔍 Checking Sepolia Wallet Balances");
  console.log(`Address: ${wallet.address}`);
  console.log("=========================================");

  try {
    const ethBalance = await provider.getBalance(wallet.address);
    console.log(`- Native ETH: ${ethers.formatEther(ethBalance)} ETH`);

    const contract = new ethers.Contract(sepoliaProxy, abi, provider);
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const jpBalance = await contract.balanceOf(wallet.address);
    console.log(`- Sepolia JP Token: ${ethers.formatUnits(jpBalance, decimals)} ${symbol}`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

main().catch(console.error);
