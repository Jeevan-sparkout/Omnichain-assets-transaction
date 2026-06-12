import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction, 
  sendAndConfirmTransaction 
} from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

// ZetaChain Solana Gateway Program ID on Devnet
const GATEWAY_PROGRAM_ID = new PublicKey("ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis");

async function main() {
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  const evmReceiver = process.env.RECIPIENT || "0x44E6d4e316261D306B020516e4B2849464a10864";
  const jpMintAddress = process.env.SOLANA_JP_MINT || "";

  if (!privateKey) {
    throw new Error("SOLANA_PRIVATE_KEY is not set in .env");
  }
  if (!jpMintAddress) {
    throw new Error("SOLANA_JP_MINT is not set in .env. Please deploy the SPL token first and set SOLANA_JP_MINT!");
  }

  // Load Keypair
  const secretKey = bs58.decode(privateKey);
  const payer = Keypair.fromSecretKey(secretKey);

  console.log("=========================================");
  console.log("🚀 Solana Devnet to ZetaChain JP SPL Depositer");
  console.log("=========================================");
  console.log("Solana Address:", payer.publicKey.toBase58());
  console.log("JP SPL Token Mint:", jpMintAddress);
  console.log("ZetaChain EOA Receiver:", evmReceiver);

  const amount = "1000.0"; // 1000.0 JP Tokens
  console.log(`\nInitiating deposit of ${amount} JP tokens to ZetaChain Athens-3...`);

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const tokenMint = new PublicKey(jpMintAddress);

  // 1. Get payer's Associated Token Account (ATA)
  const fromAta = await getAssociatedTokenAddress(tokenMint, payer.publicKey);

  // 2. Find TSS PDA ("meta" seed)
  const seeds = [Buffer.from("meta", "utf-8")];
  const [tssPda] = PublicKey.findProgramAddressSync(seeds, GATEWAY_PROGRAM_ID);

  // 3. Find TSS ATA for the mint
  const tssAta = await getAssociatedTokenAddress(tokenMint, tssPda, true);

  // 4. Find whitelist entry PDA for the mint
  const [whitelistEntry] = PublicKey.findProgramAddressSync([
    Buffer.from("whitelist", "utf-8"),
    tokenMint.toBytes(),
  ], GATEWAY_PROGRAM_ID);

  // Build deposit instruction
  // JP token has 9 decimals
  const decimals = 9;
  const depositAmount = ethers.parseUnits(amount, decimals);
  
  // Create instruction data for depositSplToken
  const discriminator = Buffer.from([86, 172, 212, 121, 63, 233, 96, 144]); // deposit_spl_token discriminator
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(depositAmount.toString()), 0);
  const receiverBuffer = Buffer.from(ethers.getBytes(evmReceiver));
  
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

  const keys = [
    { isSigner: true, isWritable: true, pubkey: payer.publicKey },
    { isSigner: false, isWritable: true, pubkey: tssPda },
    { isSigner: false, isWritable: false, pubkey: whitelistEntry },
    { isSigner: false, isWritable: false, pubkey: tokenMint },
    { isSigner: false, isWritable: false, pubkey: TOKEN_PROGRAM_ID },
    { isSigner: false, isWritable: true, pubkey: fromAta },
    { isSigner: false, isWritable: true, pubkey: tssAta },
    { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
  ];

  const instruction = new TransactionInstruction({
    data: instructionData,
    keys,
    programId: GATEWAY_PROGRAM_ID,
  });

  const transaction = new Transaction().add(instruction);

  const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
    commitment: "confirmed",
    skipPreflight: true,
  });

  console.log("🎉 Deposit Transaction Sent!");
  console.log("Transaction Signature:", signature);
  console.log(`Track on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
}

main().catch((err) => {
  console.error("❌ Error performing JP SPL deposit:", err);
});
