import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const tokens = [
    { name: "ETH (Ethereum Sepolia)", address: "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0" },
    { name: "BNB (BSC Testnet)", address: "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891" },
    { name: "SOL (Solana Devnet)", address: "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501" },
    { name: "SUI (Sui Testnet)", address: "0x3e128c169564DD527C8e9bd85124BF6A890E5a5f" },
    { name: "BTC (Bitcoin Signet)", address: "0xdbfF6471a79E5374d771922F2194eccc42210B9F" }
  ];

  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function paused() view returns (bool)"
  ];

  console.log("=========================================");
  console.log("🔍 Inspecting ZRC-20 Paused Statuses (EVM)");
  console.log("=========================================");

  for (const token of tokens) {
    try {
      const contract = new ethers.Contract(token.address, abi, provider);
      const [name, symbol, paused] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.paused()
      ]);
      console.log(`- Asset:  ${token.name}`);
      console.log(`  Symbol: ${symbol}`);
      console.log(`  ZRC-20: ${token.address}`);
      console.log(`  Paused: ${paused}`);
      console.log("-----------------------------------------");
    } catch (e: any) {
      console.log(`- Asset:  ${token.name} (${token.address})`);
      console.log(`  ❌ Call Failed: ${e.message.split("\n")[0]}`);
      console.log("-----------------------------------------");
    }
  }
}

main().catch(console.error);
