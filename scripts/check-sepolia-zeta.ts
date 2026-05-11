import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const SEPOLIA_ZETA_TOKEN = "0x0000c304D2934c00Db1d51995b9f6996AffD17c0";

function requireEnv(value: string | undefined, label: string): string {
  if (!value) {
    throw new Error(`${label} is required`);
  }
  return value.trim();
}

async function main() {
  const rpcSepolia = requireEnv(
    process.env.SEPOLIA_RPC_URL ?? process.env.RPC_ETHEREUM,
    "SEPOLIA_RPC_URL or RPC_ETHEREUM"
  );
  const recipient = process.env.RECIPIENT;

  if (!recipient) {
    throw new Error("RECIPIENT is required");
  }
  if (!ethers.isAddress(recipient)) {
    throw new Error(`RECIPIENT must be a valid address, got: ${recipient}`);
  }

  const provider = new ethers.JsonRpcProvider(rpcSepolia);
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();
  console.log(`Sepolia RPC OK`);
  console.log(`  url: ${rpcSepolia}`);
  console.log(`  chainId: ${network.chainId.toString()}`);
  console.log(`  block: ${blockNumber}`);

  const code = await provider.getCode(SEPOLIA_ZETA_TOKEN);
  if (code === "0x") {
    throw new Error(
      `Sepolia ZETA token address ${SEPOLIA_ZETA_TOKEN} has no contract code on the selected RPC`
    );
  }

  const abi = ["function balanceOf(address account) view returns (uint256)"];
  const zetaToken = new ethers.Contract(SEPOLIA_ZETA_TOKEN, abi, provider);
  const balance = await zetaToken.balanceOf(recipient);

  console.log(`Sepolia ZETA token: ${SEPOLIA_ZETA_TOKEN}`);
  console.log(`Recipient: ${recipient}`);
  console.log(`ZETA balance: ${ethers.formatEther(balance)} ZETA`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
