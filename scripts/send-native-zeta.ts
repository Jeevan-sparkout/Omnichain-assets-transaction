import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";
import { ZetaChainClient } from "@zetachain/toolkit/client";

dotenvConfig();

function requireEnv(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`${label} is required`);
  }
  return value.trim();
}

async function main() {
  const [signer] = await ethers.getSigners();
  if (!signer) {
    throw new Error("No signer found. Set PRIVATE_KEY and use the zetaTestnet network.");
  }

  const destination = requireEnv(process.env.DESTINATION_CHAIN, "DESTINATION_CHAIN");
  const recipient = process.env.RECIPIENT ?? (await signer.getAddress());
  const amount = process.env.AMOUNT ?? "0.5";
  const gasLimit = Number(process.env.DESTINATION_GAS_LIMIT ?? "500000");

  const client = new ZetaChainClient({
    network: "testnet",
    signer,
  });

  const supported = await client.getSupportedChains();
  const destinationChain = supported.find((chain) => chain.chain_name === destination);

  if (!destinationChain) {
    const labels = supported
      .map((chain) => chain.chain_name)
      .filter((name) => name.includes("testnet") || name.includes("sepolia"))
      .sort();
    throw new Error(
      `Unknown destination chain "${destination}". Try one of: ${labels.join(", ")}`
    );
  }

  const signerAddress = await signer.getAddress();
  const balanceBefore = await signer.provider!.getBalance(signerAddress);
  console.log(`Signer: ${signerAddress}`);
  console.log(`Native ZETA balance before: ${ethers.formatEther(balanceBefore)} ZETA`);
  console.log(`Destination chain: ${destinationChain.chain_name}`);
  console.log(`Recipient: ${recipient}`);
  console.log(`Amount: ${amount} ZETA`);
  console.log(`Gas limit: ${gasLimit}`);

  const tx = await client.sendZeta({
    chain: "zeta_testnet",
    destination: destinationChain.chain_name,
    recipient,
    amount,
    gasLimit,
  });

  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();

  const balanceAfter = await signer.provider!.getBalance(signerAddress);
  console.log(`Native ZETA balance after: ${ethers.formatEther(balanceAfter)} ZETA`);
  console.log(`Cross-chain transaction submitted successfully.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
