import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction 
} from "@solana/web3.js";
import { getAssociatedTokenAddress, createBurnInstruction } from "@solana/spl-token";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

async function main() {
  const solanaKey = process.env.SOLANA_PRIVATE_KEY;
  const solanaMint = process.env.SOLANA_JP_MINT || "2UkNQXn4USd4GXx2h9qHLa8eCTozNShswzfhvjGxdTKG";
  
  const evmKey = process.env.PRIVATE_KEY;
  const evmReceiver = process.env.RECIPIENT || "0x44E6d4e316261D306B020516e4B2849464a10864";
  const sepoliaProxy = process.env.SEPOLIA_PROXY_ADDRESS || "0x6B644A9Ed78f135A6c4C75A0788d8D02a58e335D";
  const sepoliaRpc = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

  if (!solanaKey) throw new Error("SOLANA_PRIVATE_KEY is not set in .env");
  if (!evmKey) throw new Error("PRIVATE_KEY is not set in .env");

  // --- Initialize Solana ---
  const solanaPayer = Keypair.fromSecretKey(bs58.decode(solanaKey));
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const tokenMint = new PublicKey(solanaMint);
  const fromAta = await getAssociatedTokenAddress(tokenMint, solanaPayer.publicKey);

  console.log("==================================================");
  console.log("🌉 Solana Devnet to Ethereum Sepolia Mock Bridge");
  console.log("==================================================");
  console.log(" Solana Address:      ", solanaPayer.publicKey.toBase58());
  console.log(" Solana SPL Mint:     ", tokenMint.toBase58());
  console.log(" Ethereum Sepolia Recv:", evmReceiver);
  console.log(" Sepolia Token Proxy: ", sepoliaProxy);
  console.log("==================================================");

  // 1. Check Solana Balance
  console.log("\n🔍 Checking Solana Devnet JP Token balance...");
  let solBalance = 0n;
  try {
    const tokenBalance = await connection.getTokenAccountBalance(fromAta);
    solBalance = BigInt(tokenBalance.value.amount);
    console.log(`   - Current Solana Balance: ${tokenBalance.value.uiAmount} JP`);
  } catch (e) {
    console.log("   ❌ Error reading Solana balance. Make sure you have JP tokens minted.");
    throw e;
  }

  const burnAmount = 1000n * 10n**9n; // 1000 JP (9 decimals)
  if (solBalance < burnAmount) {
    throw new Error(`Insufficient JP tokens on Solana. Required: 1000 JP, Found: ${Number(solBalance) / 1e9} JP`);
  }

  // 2. Burn 1000 JP on Solana
  console.log(`\n🔥 Step 1: Burning 1,000 JP on Solana Devnet...`);
  const burnInstruction = createBurnInstruction(
    fromAta,
    tokenMint,
    solanaPayer.publicKey,
    burnAmount
  );
  
  const tx = new Transaction().add(burnInstruction);
  const signature = await sendAndConfirmTransaction(connection, tx, [solanaPayer], {
    commitment: "confirmed",
  });
  console.log("   🎉 Solana Burn Confirmed!");
  console.log("   - Transaction Signature:", signature);
  console.log(`   - View on Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  // 3. Connect to Sepolia and Mint 1000 JP
  console.log(`\n🚀 Step 2: Minting 1,000 JP on Ethereum Sepolia...`);
  const provider = new ethers.JsonRpcProvider(sepoliaRpc);
  const wallet = new ethers.Wallet(evmKey, provider);

  const abi = [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)"
  ];
  const contract = new ethers.Contract(sepoliaProxy, abi, wallet);

  const mintAmount = ethers.parseUnits("1000", 18); // 1000 JP (18 decimals)
  const mintTx = await contract.mint(evmReceiver, mintAmount);
  console.log(`   - Transaction sent! TX Hash: ${mintTx.hash}`);
  console.log("   - Waiting for confirmation on Sepolia...");
  await mintTx.wait();

  // 4. Verify Final Balance on Sepolia
  const finalBalance = await contract.balanceOf(evmReceiver);
  console.log("\n==================================================");
  console.log("🎉 SUCCESS! Mock Cross-Chain Transfer Complete!");
  console.log(`- Solana Burn: 1,000 JP burned on Devnet.`);
  console.log(`- Sepolia Mint: 1,000 JP minted on Sepolia.`);
  console.log(`- New Sepolia Balance: ${ethers.formatUnits(finalBalance, 18)} JP`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("\n❌ Mock Bridge Error:", err);
});
