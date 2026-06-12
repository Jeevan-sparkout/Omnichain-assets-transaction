import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);
  const wallet = new ethers.Wallet(privateKey, provider);

  const zrc20Tokens = [
    { name: "SOL (Solana Devnet)", address: "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501" },
    { name: "ETH (Sepolia)", address: "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0" },
    { name: "BNB (BSC Testnet)", address: "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891" },
    { name: "USDC (Solana Devnet)", address: "0xD10932EB3616a937bd4a2652c87E9FeBbAce53e5" }
  ];

  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  console.log("=========================================");
  console.log("Checking ZRC-20 Balances on ZetaChain Athens-3");
  console.log(`Address: ${wallet.address}`);
  console.log("=========================================");

  for (const token of zrc20Tokens) {
    try {
      const contract = new ethers.Contract(token.address, abi, provider);
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf(wallet.address)
      ]);
      console.log(`- ${token.name}:`);
      console.log(`  Contract: ${token.address}`);
      console.log(`  Token:    ${name} (${symbol})`);
      console.log(`  Balance:  ${ethers.formatUnits(balance, decimals)} ${symbol}`);
    } catch (e: any) {
      console.log(`- ${token.name} Error: ${e.message.split('\n')[0]}`);
    }
  }
}

main().catch(console.error);
