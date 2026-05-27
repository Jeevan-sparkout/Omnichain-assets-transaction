import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const tokens = [
    { name: "SOL ZRC-20", address: "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501" },
    { name: "ETH ZRC-20", address: "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0" }
  ];

  const abi = [
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function withdrawGasFee() view returns (uint256, uint256)"
  ];

  for (const token of tokens) {
    console.log(`\n=========================================`);
    console.log(`🔍 Inspecting ZRC-20 ${token.name} (${token.address})`);
    console.log(`=========================================`);
    
    const contract = new ethers.Contract(token.address, abi, provider);

    try {
      const decimals = await contract.decimals();
      console.log(`Decimals: ${decimals}`);
    } catch (e: any) {
      console.log(`Decimals error: ${e.message}`);
    }

    try {
      const gasFee = await contract.withdrawGasFee();
      console.log(`Withdraw Gas Fee (limit, fee): ${gasFee[0].toString()}, ${gasFee[1].toString()}`);
    } catch (e: any) {
      console.log(`Withdraw Gas Fee error: ${e.message}`);
    }
  }
}

main().catch(console.error);
