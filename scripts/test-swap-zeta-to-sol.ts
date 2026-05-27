import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Uniswap V2 Router on ZetaChain Athens-3
  const routerAddress = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  
  // WZETA address on Athens-3
  const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  
  // SOL ZRC-20 address
  const solZrc20Address = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";

  const wzetaAbi = [
    "function deposit() external payable",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address) external view returns (uint256)"
  ];

  const routerAbi = [
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
  ];

  const wzeta = new ethers.Contract(wzetaAddress, wzetaAbi, wallet);
  const router = new ethers.Contract(routerAddress, routerAbi, wallet);

  console.log("=========================================");
  console.log("🔄 Swapping Native ZETA to ZRC-20 SOL (Small Amount)");
  console.log(`Wallet: ${wallet.address}`);
  console.log("=========================================");

  // We swap 0.001 ZETA because the pool has ~0.87 WZETA in liquidity.
  // Swapping 1.0 ZETA exceeds the pool reserves and causes the transaction to revert.
  const amountIn = ethers.parseEther("0.001"); 

  // Step 1: Deposit ZETA to get WZETA
  console.log("\nStep 1: Wrapping 0.05 ZETA into WZETA...");
  try {
    const balanceBefore = await wzeta.balanceOf(wallet.address);
    console.log(`Current WZETA Balance: ${ethers.formatEther(balanceBefore)} WZETA`);

    // Only deposit if we don't have enough WZETA already
    if (balanceBefore < amountIn) {
      const needed = amountIn - balanceBefore;
      console.log(`Depositing ${ethers.formatEther(needed)} ZETA...`);
      const depositTx = await wzeta.deposit({ value: needed });
      console.log(`Deposit sent: ${depositTx.hash}`);
      await depositTx.wait();
    } else {
      console.log("Already have enough WZETA balance. Skipping wrap deposit.");
    }
    
    const balanceAfter = await wzeta.balanceOf(wallet.address);
    console.log(`New WZETA Balance: ${ethers.formatEther(balanceAfter)} WZETA`);
  } catch (e: any) {
    console.log(`❌ Wrapping failed: ${e.message}`);
    return;
  }

  // Step 2: Approve Router
  console.log("\nStep 2: Approving Uniswap Router to spend WZETA...");
  try {
    const approveTx = await wzeta.approve(routerAddress, amountIn);
    console.log(`Approve transaction sent: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("Router approved successfully!");
  } catch (e: any) {
    console.log(`❌ Approve failed: ${e.message}`);
    return;
  }

  // Step 3: Swap WZETA for SOL ZRC-20
  console.log("\nStep 3: Swapping WZETA for ZRC-20 SOL...");
  const path = [wzetaAddress, solZrc20Address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 min deadline

  try {
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0, // amountOutMin
      path,
      wallet.address,
      deadline,
      { gasLimit: 500000 }
    );
    console.log(`Swap transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("🎉 Swap Success! You now have real ZRC-20 SOL on ZetaChain!");
  } catch (e: any) {
    console.log(`❌ Swap failed: ${e.message}`);
  }
}

main().catch(console.error);
