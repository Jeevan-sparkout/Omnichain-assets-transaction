import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set");

  const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const provider = new ethers.JsonRpcProvider(rpcZeta);
  const wallet = new ethers.Wallet(privateKey, provider);

  const routerAddress = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";

  const wzetaAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  const wzeta = new ethers.Contract(wzetaAddress, wzetaAbi, wallet);

  console.log("Approving router for 10 WZETA...");
  const tx = await wzeta.approve(routerAddress, ethers.parseEther("10.0"));
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log("Approved successfully!");

  const allowance = await wzeta.allowance(wallet.address, routerAddress);
  console.log(`New allowance: ${ethers.formatEther(allowance)} WZETA`);
}

main().catch(console.error);
