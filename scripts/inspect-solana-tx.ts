import { Connection } from "@solana/web3.js";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const signature = process.argv[2] || "4fwVqk7fnsexv1mRg9XUqbvSUSiuxWMcTqqS9zUqA2AoQMkN2tZEG2WdfjG9NLDNv97nkfZufq1sox9uSP77z7KS";
  console.log(`Fetching logs for signature: ${signature}`);
  
  const tx = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0
  });
  
  if (!tx) {
    console.log("Transaction not found");
    return;
  }
  
  console.log("Error details:", JSON.stringify(tx.meta?.err, null, 2));
  console.log("Transaction Logs:");
  if (tx.meta?.logMessages) {
    tx.meta.logMessages.forEach(log => console.log(log));
  } else {
    console.log("No logs found");
  }
}

main().catch(console.error);
