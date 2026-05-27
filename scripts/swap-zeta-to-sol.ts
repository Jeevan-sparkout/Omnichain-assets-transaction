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

  const wzetaAbi = [
    "function balanceOf(address) external view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  const routerAbi = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
  ];

  const wzeta = new ethers.Contract(wzetaAddress, wzetaAbi, wallet);
  const router = new ethers.Contract(routerAddress, routerAbi, wallet);

  console.log("=========================================");
  console.log("🔄 Swapping WZETA to SOL ZRC-20");
  console.log(`Wallet: ${wallet.address}`);
  console.log("=========================================");

  const wzetaBalance = await wzeta.balanceOf(wallet.address);
  const routerAllowance = await wzeta.allowance(wallet.address, routerAddress);

  console.log(`WZETA Balance: ${ethers.formatEther(wzetaBalance)} WZETA`);
  console.log(`Router Allowance: ${ethers.formatEther(routerAllowance)} WZETA`);

  const amountIn = ethers.parseEther("0.001");

  if (wzetaBalance < amountIn) {
    throw new Error("Insufficient WZETA balance");
  }

  if (routerAllowance < amountIn) {
    throw new Error("Insufficient Router allowance");
  }

  const path = [wzetaAddress, solZrc20Address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 min

  console.log(`Executing swap of ${ethers.formatEther(amountIn)} WZETA for SOL...`);
  const tx = await router.swapExactTokensForTokens(
    amountIn,
    0,
    path,
    wallet.address,
    deadline,
    { gasLimit: 500000 }
  );

  console.log(`Swap transaction sent: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  const receipt = await tx.wait();
  
  if (receipt.status === 1) {
    console.log("🎉 SUCCESS! Native ZETA to SOL swap executed successfully on-chain!");
  } else {
    console.log("❌ Transaction reverted on-chain!");
  }
}

main().catch(console.error);
