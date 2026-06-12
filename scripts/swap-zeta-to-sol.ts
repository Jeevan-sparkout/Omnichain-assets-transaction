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
    "function deposit() external payable",
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
  console.log("🔄 Performing ZETA -> WZETA -> ZRC-20 SOL Swap");
  console.log(`Wallet: ${wallet.address}`);
  console.log("=========================================");

  // Swap 0.0005 WZETA (very safe small amount)
  const amountIn = ethers.parseEther("0.0005");

  // Step 1: Wrap ZETA to WZETA
  const wzetaBal = await wzeta.balanceOf(wallet.address);
  console.log(`Current WZETA Balance: ${ethers.formatEther(wzetaBal)} WZETA`);
  if (wzetaBal < amountIn) {
    const depositAmt = ethers.parseEther("0.01");
    console.log(`Wrapping ${ethers.formatEther(depositAmt)} native ZETA...`);
    const depTx = await wzeta.deposit({ value: depositAmt });
    console.log(`Wrap sent: ${depTx.hash}`);
    await depTx.wait();
    console.log(`Wrapped successfully!`);
  }

  // Step 2: Approve WZETA if needed
  const allowance = await wzeta.allowance(wallet.address, routerAddress);
  console.log(`Current WZETA Allowance for Router: ${ethers.formatEther(allowance)} WZETA`);
  if (allowance < amountIn) {
    const approveAmt = ethers.parseEther("1.0");
    console.log(`Approving ${ethers.formatEther(approveAmt)} WZETA to Router...`);
    const appTx = await wzeta.approve(routerAddress, approveAmt);
    console.log(`Approve sent: ${appTx.hash}`);
    await appTx.wait();
    console.log("Router approved!");
  }

  // Step 3: Swap
  console.log("Swapping WZETA for ZRC-20 SOL on-chain...");
  const path = [wzetaAddress, solZrc20Address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  try {
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      wallet.address,
      deadline,
      { gasLimit: 300000 }
    );
    console.log(`Swap Tx Hash: ${tx.hash}`);
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log(`🎉 Swap Success! Status: ${receipt.status}`);
  } catch (e: any) {
    console.error("❌ Swap Failed!", e);
  }
}

main().catch(console.error);
