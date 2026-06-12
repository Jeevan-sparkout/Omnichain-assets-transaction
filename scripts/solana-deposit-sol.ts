import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction, 
  sendAndConfirmTransaction 
} from "@solana/web3.js";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

// ZetaChain Solana Gateway Program ID on Devnet
const GATEWAY_PROGRAM_ID = new PublicKey("ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis");

async function main() {
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  const evmReceiver = process.env.RECIPIENT || "0x44E6d4e316261D306B020516e4B2849464a10864";

  if (!privateKey) {
    throw new Error("SOLANA_PRIVATE_KEY is not set in .env");
  }

  // Load Keypair
  const secretKey = bs58.decode(privateKey);
  const payer = Keypair.fromSecretKey(secretKey);

  console.log("=========================================");
  console.log("🚀 Solana Devnet to ZetaChain SOL Depositer");
  console.log("=========================================");
  console.log("Solana Address:", payer.publicKey.toBase58());
  console.log("ZetaChain EOA Receiver:", evmReceiver);

  const amount = "0.05"; // 0.05 SOL to transfer
  console.log(`\nInitiating deposit of ${amount} SOL to ZetaChain Athens-3...`);

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  // Check balance first
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`Current SOL Balance: ${balance / 1e9} SOL`);

  // Convert recipient to 20-byte EVM bytes
  const receiverBytes = ethers.getBytes(evmReceiver);

  // Build deposit instruction
  const depositAmount = ethers.parseUnits(amount, 9);
  
  // Create instruction data for deposit
  const discriminator = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]); // deposit discriminator
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(depositAmount.toString()), 0);
  const receiverBuffer = Buffer.from(receiverBytes);
  
  // Revert options
  const revertOptionsPresent = Buffer.from([1]); // Option::Some
  const revertAddressBuffer = Buffer.from(payer.publicKey.toBytes());
  const abortAddressBuffer = Buffer.from(ethers.getBytes(ethers.ZeroAddress));
  const callOnRevertBuffer = Buffer.from([0]);
  const revertMessageLength = Buffer.alloc(4);
  revertMessageLength.writeUInt32LE(6, 0); // "revert" length
  const revertMessageBuffer = Buffer.from("revert");
  const gasLimitBuffer = Buffer.alloc(8);
  gasLimitBuffer.writeBigUInt64LE(0n, 0);

  const instructionData = Buffer.concat([
    discriminator,
    amountBuffer,
    receiverBuffer,
    revertOptionsPresent,
    revertAddressBuffer,
    abortAddressBuffer,
    callOnRevertBuffer,
    revertMessageLength,
    revertMessageBuffer,
    gasLimitBuffer,
  ]);

  // Find PDA account (TSS PDA "meta")
  const seeds = [Buffer.from("meta", "utf-8")];
  const [pdaAccount] = PublicKey.findProgramAddressSync(seeds, GATEWAY_PROGRAM_ID);

  const keys = [
    { isSigner: true, isWritable: true, pubkey: payer.publicKey },
    { isSigner: false, isWritable: true, pubkey: pdaAccount },
    { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
  ];

  const instruction = new TransactionInstruction({
    data: instructionData,
    keys,
    programId: GATEWAY_PROGRAM_ID,
  });

  const transaction = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer.publicKey;

  console.log("Signing and sending transaction to Solana Devnet (skipping preflight)...");
  try {
    const signature = await connection.sendTransaction(transaction, [payer], {
      skipPreflight: true,
    });
    console.log("🎉 Deposit Transaction Sent!");
    console.log("Transaction Signature (Hash):", signature);
    console.log(`Track on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    console.log("Waiting for confirmation (this will likely fail/revert on-chain but register a tx hash)...");
    const confirmation = await connection.confirmTransaction(signature, "confirmed");
    console.log("Transaction confirmation result:", confirmation);
  } catch (err: any) {
    console.log("❌ Transaction sending failed!");
    console.error("Error details:", err);
  }
}

main().catch((err) => {
  console.error("❌ Error performing SOL deposit:", err);
});
