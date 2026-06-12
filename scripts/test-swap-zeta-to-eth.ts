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
  const ethZrc20Address = "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0";

  const wzetaAbi = [
    "function deposit() external payable",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address) external view returns (uint256)"
  ];

  const routerAbi = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
  ];

  const wzeta = new ethers.Contract(wzetaAddress, wzetaAbi, wallet);
  const router = new ethers.Contract(routerAddress, routerAbi, wallet);

  console.log("=========================================");
  console.log("🔄 Swapping Native ZETA to ZRC-20 Sepolia ETH");
  console.log(`Wallet: ${wallet.address}`);
  console.log("=========================================");

  const amountIn = ethers.parseEther("6.0"); // Swap 6.0 ZETA

  console.log("\nStep 1: Checking/Wrapping WZETA...");
  const balanceBefore = await wzeta.balanceOf(wallet.address);
  console.log(`Current WZETA Balance: ${ethers.formatEther(balanceBefore)} WZETA`);

  if (balanceBefore < amountIn) {
    const needed = amountIn - balanceBefore;
    console.log(`Depositing ${ethers.formatEther(needed)} ZETA...`);
    const depositTx = await wzeta.deposit({ value: needed });
    await depositTx.wait();
  }

  console.log("\nStep 2: Approving Uniswap Router...");
  const approveTx = await wzeta.approve(routerAddress, amountIn);
  await approveTx.wait();
  console.log("Router approved successfully!");

  console.log("\nStep 3: Swapping WZETA for ZRC-20 Sepolia ETH...");
  const path = [wzetaAddress, ethZrc20Address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  try {
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      wallet.address,
      deadline
    );
    console.log(`Swap transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("🎉 Swap Success! You now have ZRC-20 Sepolia ETH on ZetaChain!");
  } catch (e: any) {
    console.log(`❌ Swap failed: ${e.message}`);
  }
}

main().catch(console.error);
