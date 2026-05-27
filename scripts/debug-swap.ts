import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);
  const wallet = new ethers.Wallet(privateKey, provider);

  const routerAddress = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  const solZrc20Address = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";

  const routerAbi = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
  ];

  const router = new ethers.Contract(routerAddress, routerAbi, wallet);

  console.log("=========================================");
  console.log("🔍 Simulating zEVM Swap to get Revert Reason");
  console.log("=========================================");

  const wzetaAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];
  const wzeta = new ethers.Contract(wzetaAddress, wzetaAbi, wallet);

  const balance = await wzeta.balanceOf(wallet.address);
  const allowance = await wzeta.allowance(wallet.address, routerAddress);
  console.log(`Wallet WZETA Balance: ${ethers.formatEther(balance)} WZETA`);
  console.log(`Router WZETA Allowance: ${ethers.formatEther(allowance)} WZETA`);

  const amountIn = ethers.parseEther("0.001"); // Use 0.001 WZETA
  const path = [wzetaAddress, solZrc20Address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  try {
    console.log("Simulating with eth_call...");
    const txData = await router.swapExactTokensForTokens.populateTransaction(
      amountIn,
      0,
      path,
      wallet.address,
      deadline
    );
    
    // We call provider.call to see the raw revert reason
    const result = await provider.call({
      from: wallet.address,
      to: routerAddress,
      data: txData.data
    });
    console.log("Raw Result:", result);
  } catch (e: any) {
    console.log("\n❌ Simulation Failed!");
    console.log("Error Message:", e.message);
    if (e.data) {
      console.log("Revert Data:", e.data);
    }
  }
}

main().catch(console.error);
