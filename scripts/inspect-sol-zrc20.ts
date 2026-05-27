import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);

  const solZrc20Address = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";
  
  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function paused() view returns (bool)",
    "function SYSTEM_CONTRACT_ADDRESS() view returns (address)",
    "function gatewayAddress() view returns (address)",
    "function coinType() view returns (uint8)"
  ];

  const tokens = [
    { name: "SOL ZRC-20", address: "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501" },
    { name: "ETH ZRC-20", address: "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0" }
  ];

  for (const token of tokens) {
    console.log(`\n=========================================`);
    console.log(`🔍 Inspecting ${token.name} (${token.address})`);
    console.log(`=========================================`);
    
    const contract = new ethers.Contract(token.address, abi, provider);

    try {
      const name = await contract.name();
      console.log(`Name: ${name}`);
    } catch (e: any) {
      console.log(`Name error: ${e.message}`);
    }

    try {
      const symbol = await contract.symbol();
      console.log(`Symbol: ${symbol}`);
    } catch (e: any) {
      console.log(`Symbol error: ${e.message}`);
    }

    try {
      const coinType = await contract.coinType();
      console.log(`Coin Type: ${coinType}`);
    } catch (e: any) {
      console.log(`Coin Type error: ${e.message.split("\n")[0]}`);
    }

    try {
      const systemContract = await contract.SYSTEM_CONTRACT_ADDRESS();
      console.log(`System Contract: ${systemContract}`);
    } catch (e: any) {
      try {
        const systemContract2 = await contract.systemContractAddress();
        console.log(`System Contract (camelCase): ${systemContract2}`);
      } catch {
        console.log(`System Contract error: ${e.message.split("\n")[0]}`);
      }
    }

    try {
      const paused = await contract.paused();
      console.log(`Paused: ${paused}`);
    } catch (e: any) {
      console.log(`Paused error: ${e.message.split("\n")[0]}`);
    }
  }
}

main().catch(console.error);
