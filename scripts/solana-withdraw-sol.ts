import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";
import bs58 from "bs58";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);
  const wallet = new ethers.Wallet(privateKey, provider);

  // ZRC-20 SOL Address on ZetaChain Athens-3
  const zrc20SolAddress = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";
  
  // ABI of ZRC-20
  const abi = [
    "function withdraw(bytes calldata to, uint256 amount) external returns (bool)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function withdrawGasFee() view returns (uint256, uint256)" // (gasLimit, gasFee)
  ];

  const zrc20 = new ethers.Contract(zrc20SolAddress, abi, wallet);

  console.log("=========================================");
  console.log("🚀 ZetaChain ZRC-20 SOL to Solana Withdraw");
  console.log("=========================================");

  const decimals = await zrc20.decimals();
  const balance = await zrc20.balanceOf(wallet.address);
  console.log(`Current ZRC-20 SOL Balance on ZetaChain: ${ethers.formatUnits(balance, decimals)} SOL`);

  // Get Solana public key to withdraw to
  const solanaPublicKey = process.env.SOLANA_PUBLIC_KEY;
  if (!solanaPublicKey) {
    throw new Error("SOLANA_PUBLIC_KEY is not set in .env");
  }

  // Convert base58 Solana public key to 32 bytes
  const toAddressBytes = bs58.decode(solanaPublicKey);
  console.log(`Withdrawing to Solana Address: ${solanaPublicKey}`);

  // Fetch gas fee
  const [gasLimit, gasFee] = await zrc20.withdrawGasFee();
  console.log(`Withdrawal Gas Fee required: ${ethers.formatUnits(gasFee, decimals)} SOL`);

  // Set withdraw amount to gas fee + some buffer to trigger actual on-chain withdraw call
  const withdrawAmount = gasFee + ethers.parseUnits("0.0001", decimals);

  console.log(`\nInitiating actual on-chain ZRC-20 withdraw of ${ethers.formatUnits(withdrawAmount, decimals)} SOL...`);

  console.log("Sending actual on-chain withdraw transaction (with manual gas limit to bypass estimateGas)...");
  const tx = await zrc20.withdraw(toAddressBytes, withdrawAmount, { gasLimit: 150000 });
  console.log(`Transaction sent! TX Hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  await tx.wait();

  console.log("\n🎉 Success! You initiated a withdrawal from ZetaChain to Solana.");
  console.log(`Track it on ZetaChain explorer: https://testnet.zetachain.com/cc/tx/${tx.hash}`);
}

main().catch(console.error);
