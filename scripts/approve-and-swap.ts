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
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)"
  ];

  const routerAbi = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
  ];

  const wzeta = new ethers.Contract(wzetaAddress, wzetaAbi, wallet);
  const router = new ethers.Contract(routerAddress, routerAbi, wallet);

  console.log("=========================================");
  console.log("🔄 Resetting Approval and Swapping");
  console.log("=========================================");

  // Reset approval to 0 first
  console.log("Resetting Router allowance to 0...");
  const resetTx = await wzeta.approve(routerAddress, 0);
  console.log(`Reset tx sent: ${resetTx.hash}`);
  await resetTx.wait();
  console.log("Allowance reset to 0.");

  // Approve MaxUint256
  console.log("Approving MaxUint256 WZETA to Router...");
  const approveTx = await wzeta.approve(routerAddress, ethers.MaxUint256);
  console.log(`Approve tx sent: ${approveTx.hash}`);
  await approveTx.wait();
  console.log("Max WZETA approved.");

  // Let's verify allowance
  const newAllowance = await wzeta.allowance(wallet.address, routerAddress);
  console.log(`New allowance: ${ethers.formatEther(newAllowance)} WZETA`);

  // Swap a very tiny amount: 0.0001 WZETA
  const amountIn = ethers.parseEther("0.0001");
  console.log(`Swapping ${ethers.formatEther(amountIn)} WZETA for ZRC-20 SOL...`);
  const path = [wzetaAddress, solZrc20Address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  try {
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      wallet.address,
      deadline,
      { gasLimit: 400000 }
    );
    console.log(`Swap Tx Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`🎉 Swap Success! Status: ${receipt.status}`);
  } catch (e: any) {
    console.error("❌ Swap Failed!", e);
  }
}

main().catch(console.error);
