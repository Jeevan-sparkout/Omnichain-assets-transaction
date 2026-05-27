import { ethers, network } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  console.log(`Forking ZetaChain Athens-3 from RPC: ${rpcZeta}`);

  // Reset the network to fork Athens-3
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: rpcZeta,
        },
      },
    ],
  });

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set");
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`Real wallet address: ${wallet.address}`);

  // Fund the real wallet with some ZETA locally just in case
  await network.provider.send("hardhat_setBalance", [
    wallet.address,
    "0x56bc75e2d63100000" // 100 ZETA in hex
  ]);

  const routerAddress = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
  const solZrc20Address = "0xADF73ebA3Ebaa7254E859549A44c74eF7cff7501";

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

  const amountIn = ethers.parseEther("0.001");
  console.log("\nWrapping ZETA...");
  await wzeta.deposit({ value: amountIn });
  console.log("Approving WZETA to router...");
  await wzeta.approve(routerAddress, amountIn);

  console.log("Performing swap in local fork...");
  const path = [wzetaAddress, solZrc20Address];
  const deadline = Math.floor(Date.now() / 1000) + 600;

  try {
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      wallet.address,
      deadline
    );
    console.log(`🎉 Local swap succeeded! Transaction hash: ${tx.hash}`);
  } catch (e: any) {
    console.error("❌ Local swap failed:");
    console.error(e);
  }
}

main().catch(console.error);
