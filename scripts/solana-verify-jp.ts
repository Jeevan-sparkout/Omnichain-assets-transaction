import { Connection, PublicKey } from "@solana/web3.js";
import { getMint, getAccount } from "@solana/spl-token";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const jpMintAddress = process.env.SOLANA_JP_MINT || "2UkNQXn4USd4GXx2h9qHLa8eCTozNShswzfhvjGxdTKG";
  const payerPublicAddress = process.env.SOLANA_PUBLIC_KEY || "5AERojNymbXK3XRqDSUvygcp9qQvZmfyvcnHXZNjEpa2";

  console.log("=========================================");
  console.log("🔍 Solana Devnet JP Token Verifier");
  console.log("=========================================");
  console.log("Target Mint Address:", jpMintAddress);

  const mintPubkey = new PublicKey(jpMintAddress);

  try {
    // 1. Fetch Mint Information
    console.log("\n1. Querying Mint Account...");
    const mintInfo = await getMint(connection, mintPubkey);
    
    console.log("   - Decimals:", mintInfo.decimals);
    console.log("   - Total Supply:", (Number(mintInfo.supply) / 10 ** mintInfo.decimals).toLocaleString(), "JP");
    console.log("   - Mint Authority:", mintInfo.mintAuthority?.toBase58());
    console.log("   - Freeze Authority:", mintInfo.freezeAuthority?.toBase58());
    console.log("   - Is Initialized:", mintInfo.isInitialized);

    // 2. Fetch Payer's Associated Token Account Info
    if (payerPublicAddress) {
      console.log(`\n2. Querying Associated Token Account for Payer (${payerPublicAddress})...`);
      const payerPubkey = new PublicKey(payerPublicAddress);
      
      // Calculate derived ATA
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(payerPubkey, {
        mint: mintPubkey
      });

      if (tokenAccounts.value.length > 0) {
        for (const account of tokenAccounts.value) {
          const accountInfo = account.account.data.parsed.info;
          console.log("   - Token Account Address:", account.pubkey.toBase58());
          console.log("   - Balance:", accountInfo.tokenAmount.uiAmount, "JP");
          console.log("   - State:", accountInfo.state);
        }
      } else {
        console.log("   ⚠️ No Associated Token Account found for this mint on the payer address.");
      }
    }

    console.log("\n3. Public Explorer URL:");
    console.log(`   👉 https://explorer.solana.com/address/${jpMintAddress}?cluster=devnet`);

  } catch (err) {
    console.error("❌ Error verifying token on Solana Devnet:", err);
  }
  console.log("=========================================\n");
}

main().catch((err) => {
  console.error("❌ Unhandled execution error:", err);
});
