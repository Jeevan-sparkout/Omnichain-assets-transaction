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
  const amount = process.env.AMOUNT ?? "0.5";
  const gasLimit = Number(process.env.DESTINATION_GAS_LIMIT ?? "500000");

  const client = new ZetaChainClient({
    network: "testnet",
    signer,
  });

  const supported = await client.getSupportedChains();
  const destinationChain = supported.find((chain) => chain.chain_name === destination);
  if (!destinationChain) {
    const available = supported
      .map((chain) => chain.chain_name)
      .filter((name) => name.includes("testnet") || name.includes("sepolia"))
      .sort();
    throw new Error(
      `Unknown destination chain "${destination}". Try one of: ${available.join(", ")}`
    );
  }

  const fees = await client.getFees(gasLimit);
  const feeItem = fees.messaging.find((item) => item.chainID === String(destinationChain.chain_id));
  if (!feeItem) {
    throw new Error(`Could not fetch fee quote for ${destinationChain.chain_name}`);
  }

  const amountWei = ethers.parseEther(amount);
  const feeWei = ethers.parseEther(feeItem.totalFee);
  const receiveWei = amountWei > feeWei ? amountWei - feeWei : 0n;

  console.log(`Destination chain: ${destinationChain.chain_name}`);
  console.log(`Amount sent: ${amount} ZETA`);
  console.log(`Estimated cross-chain fee: ${feeItem.totalFee} ZETA`);
  console.log(`Estimated amount received: ${ethers.formatEther(receiveWei)} ZETA`);
  console.log(`Gas limit used for quote: ${gasLimit}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
