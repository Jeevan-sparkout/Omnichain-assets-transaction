import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const rpcEth = process.env.RPC_ETHEREUM || "https://ethereum-sepolia-rpc.publicnode.com";
  const rpcBsc = process.env.RPC_BSC || "https://bsc-testnet-rpc.publicnode.com";

  console.log("=========================================");
  console.log("🔍 Checking Native Chain Balances");
  console.log("=========================================");

  try {
    const providerZeta = new ethers.JsonRpcProvider(rpcZeta);
    const walletZeta = new ethers.Wallet(privateKey, providerZeta);
    const balanceZeta = await providerZeta.getBalance(walletZeta.address);
    console.log(`- ZetaChain Athens-3: ${ethers.formatEther(balanceZeta)} ZETA`);
  } catch (e: any) {
    console.log(`- ZetaChain Error: ${e.message.split('\n')[0]}`);
  }

  try {
    const providerEth = new ethers.JsonRpcProvider(rpcEth);
    const walletEth = new ethers.Wallet(privateKey, providerEth);
    const balanceEth = await providerEth.getBalance(walletEth.address);
    console.log(`- Ethereum Sepolia:   ${ethers.formatEther(balanceEth)} ETH`);
  } catch (e: any) {
    console.log(`- Ethereum Sepolia Error: ${e.message.split('\n')[0]}`);
  }

  try {
    const providerBsc = new ethers.JsonRpcProvider(rpcBsc);
    const walletBsc = new ethers.Wallet(privateKey, providerBsc);
    const balanceBsc = await providerBsc.getBalance(walletBsc.address);
    console.log(`- BSC Testnet:        ${ethers.formatEther(balanceBsc)} BNB`);
  } catch (e: any) {
    console.log(`- BSC Testnet Error: ${e.message.split('\n')[0]}`);
  }
}

main().catch(console.error);
