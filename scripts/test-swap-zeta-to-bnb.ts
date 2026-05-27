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
  
  // BNB ZRC-20 address
  const bnbZrc20Address = "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891";

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
  console.log("🔄 Swapping Native ZETA to ZRC-20 BNB");
  console.log(`Wallet: ${wallet.address}`);
  console.log("=========================================");

  // Let's first query getAmountsOut
  const amountIn = ethers.parseEther("0.001");
  const path = [wzetaAddress, bnbZrc20Address];

  try {
    const amountsOut = await router.getAmountsOut(amountIn, path);
    console.log(`Amounts out (ZETA -> BNB): ${ethers.formatEther(amountsOut[0])} ZETA -> ${ethers.formatEther(amountsOut[1])} BNB`);
  } catch (e: any) {
    console.log(`❌ Pool query (getAmountsOut) failed: ${e.message}`);
    return;
  }

  // Step 1: Wrap ZETA to WZETA
  console.log("\nStep 1: Wrapping ZETA into WZETA...");
  try {
    const balanceBefore = await wzeta.balanceOf(wallet.address);
    console.log(`Current WZETA Balance: ${ethers.formatEther(balanceBefore)} WZETA`);

    if (balanceBefore < amountIn) {
      const needed = amountIn - balanceBefore;
      console.log(`Wrapping ${ethers.formatEther(needed)} ZETA...`);
      const depositTx = await wzeta.deposit({ value: needed });
      console.log(`Deposit transaction sent: ${depositTx.hash}`);
      await depositTx.wait();
    } else {
      console.log("Already have enough WZETA balance.");
    }
  } catch (e: any) {
    console.log(`❌ Wrapping failed: ${e.message}`);
    return;
  }

  // Step 2: Approve Router
  console.log("\nStep 2: Approving Uniswap Router...");
  try {
    const approveTx = await wzeta.approve(routerAddress, amountIn);
    console.log(`Approve transaction sent: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("Approved router!");
  } catch (e: any) {
    console.log(`❌ Approve failed: ${e.message}`);
    return;
  }

  // Step 3: Swap WZETA for BNB ZRC-20
  console.log("\nStep 3: Swapping WZETA for ZRC-20 BNB...");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  try {
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
    console.log("Tx status:", receipt.status);
    console.log("🎉 Swap Success! Swapped ZETA to BNB successfully!");
  } catch (e: any) {
    console.log(`❌ Swap failed: ${e.message}`);
  }
}

main().catch(console.error);
