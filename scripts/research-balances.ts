import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const chains = [
    { name: "ZetaChain", rpc: process.env.RPC_ZETACHAIN, proxy: "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe" },
    { name: "Sepolia", rpc: process.env.RPC_ETHEREUM, proxy: "0x6B644A9Ed78f135A6c4C75A0788d8D02a58e335D" },
    { name: "BSC Testnet", rpc: process.env.RPC_BSC, proxy: "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe" }
  ];

  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  console.log("--- JP Token Balance Research ---");

  for (const chain of chains) {
    if (!chain.rpc) {
      console.log(`[${chain.name}] Skipping: RPC not found in .env`);
      continue;
    }

    try {
      const provider = new ethers.JsonRpcProvider(chain.rpc, undefined, { staticNetwork: true });
      const wallet = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(chain.proxy, abi, provider);

      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf(wallet.address)
      ]);

      console.log(`[${chain.name}]`);
      console.log(`  Proxy:   ${chain.proxy}`);
      console.log(`  Token:   ${name} (${symbol})`);
      console.log(`  Balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
    } catch (e: any) {
      console.log(`[${chain.name}] Error: ${e.message.split('\n')[0]}`);
    }
  }
}

main().catch(console.error);
