import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function checkGateway(networkName: string, rpcUrl: string, gatewayAddress: string) {
  console.log(`\n=========================================`);
  console.log(`🔍 Checking Gateway on ${networkName}`);
  console.log(`Address: ${gatewayAddress}`);
  console.log(`RPC:     ${rpcUrl}`);
  console.log(`=========================================`);

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // We try several common Pausable / Gateway function signatures:
    const abi = [
      "function paused() view returns (bool)",
      "function depositPaused() view returns (bool)",
      "function isPaused() view returns (bool)"
    ];

    const contract = new ethers.Contract(gatewayAddress, abi, provider);

    // 1. Try paused()
    try {
      const paused = await contract.paused();
      console.log(`🟢 paused(): ${paused}`);
    } catch (e: any) {
      console.log(`❌ paused() call failed: ${e.message.split("\n")[0]}`);
    }

    // 2. Try depositPaused()
    try {
      const depositPaused = await contract.depositPaused();
      console.log(`🟢 depositPaused(): ${depositPaused}`);
    } catch (e: any) {
      console.log(`❌ depositPaused() call failed: ${e.message.split("\n")[0]}`);
    }

    // 3. Try isPaused()
    try {
      const isPaused = await contract.isPaused();
      console.log(`🟢 isPaused(): ${isPaused}`);
    } catch (e: any) {
      console.log(`❌ isPaused() call failed: ${e.message.split("\n")[0]}`);
    }

  } catch (err: any) {
    console.log(`❌ Network connection or contract error: ${err.message}`);
  }
}

async function main() {
  const rpcSepolia = process.env.RPC_ETHEREUM || "https://ethereum-sepolia-rpc.publicnode.com";
  const rpcBsc = process.env.RPC_BSC || "https://bsc-testnet-rpc.publicnode.com";
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";

  const gatewaySepolia = process.env.GATEWAY_ETHEREUM || "0x0c487a766110c85d301d96e33579c5b317fa4995";
  const gatewayBsc = process.env.GATEWAY_BSC || "0x0c487a766110c85d301d96e33579c5b317fa4995";
  const gatewayZeta = process.env.GATEWAY_ZETACHAIN || "0x6c533f7fe93fae114d0954697069df33c9b74fd7";

  await checkGateway("Ethereum Sepolia", rpcSepolia, gatewaySepolia);
  await checkGateway("BSC Testnet", rpcBsc, gatewayBsc);
  await checkGateway("ZetaChain Athens-3 EVM", rpcZeta, gatewayZeta);
}

main().catch(console.error);
