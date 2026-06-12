import { ethers } from "ethers";
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
  
  // Token addresses
  const ethAddress = "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0";
  const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  const solAddress = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";

  const tokenAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
  ];

  const routerAbi = [
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
  ];

  const ethToken = new ethers.Contract(ethAddress, tokenAbi, wallet);
  const router = new ethers.Contract(routerAddress, routerAbi, wallet);

  console.log("=========================================");
  console.log("🔄 Swapping ZRC-20 ETH to ZRC-20 SOL");
  console.log(`Wallet: ${wallet.address}`);
  console.log("=========================================");

  const balance = await ethToken.balanceOf(wallet.address);
  const decimals = await ethToken.decimals();
  console.log(`Current ZRC-20 ETH Balance: ${ethers.formatUnits(balance, decimals)} ETH`);

  if (balance === 0n) {
    console.log("❌ No ZRC-20 ETH available to swap.");
    return;
  }

  // Swap a very small amount to stay within pool liquidity limits
  const amountIn = ethers.parseUnits("0.0001", decimals);
  console.log(`Amount In: ${ethers.formatUnits(amountIn, decimals)} ETH`);

  // Approve router
  console.log("\nApproving Uniswap Router to spend ZRC-20 ETH...");
  const approveTx = await ethToken.approve(routerAddress, amountIn);
  console.log(`Approve Tx: ${approveTx.hash}`);
  await approveTx.wait();
  console.log("Approved successfully!");

  // Path: ETH -> WZETA -> SOL
  const path = [ethAddress, wzetaAddress, solAddress];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 min

  try {
    const amountsOut = await router.getAmountsOut(amountIn, path);
    console.log(`Expected output: ${ethers.formatUnits(amountsOut[2], 9)} SOL`);
  } catch (err: any) {
    console.log(`getAmountsOut failed: ${err.message}`);
    return;
  }

  console.log("\nExecuting Swap...");
  try {
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0, // accept any amount of SOL
      path,
      wallet.address,
      deadline,
      { gasLimit: 500000 }
    );
    console.log(`Swap Tx: ${tx.hash}`);
    await tx.wait();
    console.log("🎉 Swap Success!");
  } catch (err: any) {
    console.log(`❌ Swap execution failed: ${err.message}`);
  }
}

main().catch(console.error);
