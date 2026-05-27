import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);
  const wallet = new ethers.Wallet(privateKey, provider);

  // ZRC-20 Sepolia ETH Address on ZetaChain Athens-3
  const zrc20EthAddress = "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0";
  
  // ABI of ZRC-20
  const abi = [
    "function withdraw(bytes calldata to, uint256 amount) external returns (bool)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function withdrawGasFee() view returns (uint256, uint256)", // (gasLimit, gasFee)
    "function approve(address spender, uint256 amount) external returns (bool)"
  ];

  const zrc20 = new ethers.Contract(zrc20EthAddress, abi, wallet);

  console.log("=========================================");
  console.log("🚀 ZetaChain ZRC-20 ETH to Sepolia Withdraw");
  console.log("=========================================");

  const decimals = await zrc20.decimals();
  const balance = await zrc20.balanceOf(wallet.address);
  console.log(`Current ZRC-20 ETH Balance on ZetaChain: ${ethers.formatUnits(balance, decimals)} ETH`);

  if (balance === 0n) {
    throw new Error("No ZRC-20 ETH to withdraw. Please swap ZETA to ZRC-20 ETH first.");
  }

  // Withdraw to our own EVM address
  const recipientAddress = wallet.address;
  // Convert recipient address to bytes for withdraw
  const toAddressBytes = ethers.zeroPadValue(recipientAddress, 32);
  console.log(`Withdrawing to Sepolia Address: ${recipientAddress}`);

  // Fetch gas fee
  const [gasLimit, gasFee] = await zrc20.withdrawGasFee();
  console.log(`Withdrawal Gas Fee required: ${ethers.formatUnits(gasFee, decimals)} ETH`);

  // Amount to withdraw must cover the gas fee
  if (balance <= gasFee) {
    console.log(`❌ Balance (${ethers.formatUnits(balance, decimals)} ETH) is less than or equal to gas fee (${ethers.formatUnits(gasFee, decimals)} ETH)`);
    console.log("We need to swap more native ZETA to ZRC-20 ETH to cover the gas fee!");
    return;
  }
  const withdrawAmount = balance - gasFee;

  console.log("\nStep 4: Approving ZRC-20 contract for its own gas fee...");
  const approveTx = await zrc20.approve(zrc20EthAddress, gasFee);
  console.log(`Approval transaction sent: ${approveTx.hash}`);
  await approveTx.wait();
  console.log("Gas fee approved successfully!");

  console.log(`\nWithdrawing ${ethers.formatUnits(withdrawAmount, decimals)} ZRC-20 ETH...`);
  console.log(`(Net received on Sepolia: ${ethers.formatUnits(withdrawAmount, decimals)} ETH)`);

  const tx = await zrc20.withdraw(ethers.getBytes(toAddressBytes), withdrawAmount);
  console.log(`Transaction sent! TX Hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("\n🎉 Success! You initiated a withdrawal from ZetaChain to Sepolia.");
  console.log(`Track it on ZetaChain explorer: https://testnet.zetachain.com/cc/tx/${tx.hash}`);
}

main().catch(console.error);
