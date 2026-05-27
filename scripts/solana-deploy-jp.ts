import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import bs58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  const devnetRpc = "https://api.devnet.solana.com";

  if (!privateKey) {
    throw new Error("SOLANA_PRIVATE_KEY is not set in .env");
  }

  const connection = new Connection(devnetRpc, "confirmed");
  
  // Load Keypair
  const secretKey = bs58.decode(privateKey);
  const payer = Keypair.fromSecretKey(secretKey);

  console.log("=========================================");
  console.log("🚀 Solana Devnet JP Token Deployer");
  console.log("=========================================");
  console.log("Payer Address:", payer.publicKey.toBase58());

  // Check SOL balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`SOL Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    console.log("⚠️ Low SOL Balance! Requesting an Airdrop...");
    try {
      const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      // Wait for confirmation
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature
      });
      const newBalance = await connection.getBalance(payer.publicKey);
      console.log(`Airdrop Success! New Balance: ${newBalance / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
      console.log("❌ Airdrop failed or rate limited. Please top up your wallet manually using a Solana devnet faucet.");
      console.log(`Your Solana Address: ${payer.publicKey.toBase58()}`);
    }
  }

  // Deploy SPL Token Mint (JP)
  console.log("\nDeploying JP Token Mint (equivalent to ERC-20 contract)...");
  
  // Decimals = 9 (Solana standard for SPL tokens)
  const decimals = 9;
  
  const mint = await createMint(
    connection,
    payer, // Payer
    payer.publicKey, // Mint Authority
    payer.publicKey, // Freeze Authority
    decimals
  );

  console.log("🎉 JP Token Mint Deployed Successfully!");
  console.log("JP Mint Address:", mint.toBase58());

  // Create Associated Token Account (ATA) for Payer
  console.log("\nCreating Associated Token Account for Payer...");
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log("Associated Token Account Address:", tokenAccount.address.toBase58());

  // Mint JP Tokens to Payer
  const mintAmount = 1000000000000n; // 1000 JP (9 decimals)
  console.log(`\nMinting ${Number(mintAmount) / 10**decimals} JP to Payer...`);
  
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    mintAmount
  );

  console.log("🎉 Successfully minted 1000 JP tokens!");
  
  console.log("\n=========================================");
  console.log("👉 Next steps:");
  console.log("Save your JP Mint Address to your .env:");
  console.log(`SOLANA_JP_MINT=${mint.toBase58()}`);
  console.log("=========================================");
}

main().catch((err) => {
  console.error("❌ Error deploying token:", err);
});
