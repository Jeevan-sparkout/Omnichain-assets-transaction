import { Connection, PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const publicKeyStr = process.env.SOLANA_PUBLIC_KEY || "5AERojNymbXK3XRqDSUvygcp9qQvZmfyvcnHXZNjEpa2";
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  console.log(`Checking balance for Solana address: ${publicKeyStr}`);
  const balance = await connection.getBalance(new PublicKey(publicKeyStr));
  console.log(`Balance: ${balance / 1e9} SOL`);
}

main().catch(console.error);
