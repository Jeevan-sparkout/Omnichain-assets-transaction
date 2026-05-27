import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY, 
  Transaction, 
  TransactionInstruction, 
  sendAndConfirmTransaction 
} from "@solana/web3.js";
import bs58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

// Metaplex Token Metadata Program ID
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

async function main() {
  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  const jpMintAddress = process.env.SOLANA_JP_MINT || "2UkNQXn4USd4GXx2h9qHLa8eCTozNShswzfhvjGxdTKG";

  if (!privateKey) {
    throw new Error("SOLANA_PRIVATE_KEY is not set in .env");
  }

  // Load Keypair
  const secretKey = bs58.decode(privateKey);
  const payer = Keypair.fromSecretKey(secretKey);

  console.log("=========================================");
  console.log("🏷️ Solana SPL Token Metadata Register");
  console.log("=========================================");
  console.log("Payer/Authority Address:", payer.publicKey.toBase58());
  console.log("Token Mint Address:", jpMintAddress);

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const mintPubkey = new PublicKey(jpMintAddress);

  // 1. Derive Metaplex Metadata Account PDA
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf-8"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintPubkey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  console.log("Derived Metadata PDA:", metadataPDA.toBase58());

  // 2. Build Borsh Serialized Data for CreateMetadataAccountV3
  // Data Structure:
  // - discriminator (u8) = 33 (CreateMetadataAccountV3)
  // - name (string)
  // - symbol (string)
  // - uri (string)
  // - sellerFeeBasisPoints (u16)
  // - creators (Option<Vec<Creator>>) -> 0 for None
  // - isMutable (bool) -> 1 for True
  // - collectionDetails (Option<CollectionDetails>) -> 0 for None

  const name = "JP Token";
  const symbol = "JP";
  const uri = ""; // No external metadata json needed for basic name/symbol

  // Helper to serialize string in Borsh format: [u32 length] + [bytes]
  const serializeString = (str: string): Buffer => {
    const bytes = Buffer.from(str, "utf-8");
    const lenBuffer = Buffer.alloc(4);
    lenBuffer.writeUInt32LE(bytes.length, 0);
    return Buffer.concat([lenBuffer, bytes]);
  };

  const discriminator = Buffer.from([33]);
  const nameBuffer = serializeString(name);
  const symbolBuffer = serializeString(symbol);
  const uriBuffer = serializeString(uri);
  const sellerFeeBuffer = Buffer.alloc(2); // 0
  const creatorsPresent = Buffer.from([0]); // None
  const collectionPresent = Buffer.from([0]); // None
  const usesPresent = Buffer.from([0]); // None
  const isMutableBuffer = Buffer.from([1]); // True
  const collectionDetailsPresent = Buffer.from([0]); // None

  const instructionData = Buffer.concat([
    discriminator,
    nameBuffer,
    symbolBuffer,
    uriBuffer,
    sellerFeeBuffer,
    creatorsPresent,
    collectionPresent,
    usesPresent,
    isMutableBuffer,
    collectionDetailsPresent,
  ]);

  // 3. Build Instruction Accounts
  const keys = [
    { isSigner: false, isWritable: true, pubkey: metadataPDA },
    { isSigner: false, isWritable: false, pubkey: mintPubkey },
    { isSigner: true, isWritable: false, pubkey: payer.publicKey }, // Mint Authority
    { isSigner: true, isWritable: true, pubkey: payer.publicKey }, // Payer
    { isSigner: true, isWritable: false, pubkey: payer.publicKey }, // Update Authority
    { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
    { isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY },
  ];

  const instruction = new TransactionInstruction({
    data: instructionData,
    keys,
    programId: METADATA_PROGRAM_ID,
  });

  const transaction = new Transaction().add(instruction);

  console.log("\nSubmitting metadata registration transaction to Solana Devnet...");
  
  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    console.log("🎉 Metadata Registered Successfully!");
    console.log("Transaction Signature:", signature);
    console.log(`Track on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("\nRefresh your Phantom Wallet or Solana Explorer page!");
    console.log("Your token will now be recognized as: JP Token (JP)!");
  } catch (err) {
    console.error("❌ Error registering metadata:", err);
  }
  console.log("=========================================\n");
}

main().catch((err) => {
  console.error("❌ Unhandled execution error:", err);
});
