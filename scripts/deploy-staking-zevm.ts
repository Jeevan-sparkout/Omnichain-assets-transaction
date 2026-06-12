import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying zEVM Staking Router...");
  console.log("Deployer address:", deployer.address);
  console.log("Network:", network.name);

  // In production, these should be loaded from env or config per network
  const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER || "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe"; // ZetaChain Athens 3 Uniswap V2
  const WZETA = process.env.WZETA || "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf"; // WZETA on ZetaChain Athens 3

  const StakingRouterZEVM = await ethers.getContractFactory("StakingRouterZEVM");
  const stakingRouter = await StakingRouterZEVM.deploy(
    deployer.address,
    UNISWAP_ROUTER,
    WZETA
  );

  await stakingRouter.waitForDeployment();
  console.log("StakingRouterZEVM deployed to:", await stakingRouter.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
