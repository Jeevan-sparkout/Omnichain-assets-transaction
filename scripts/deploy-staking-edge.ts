import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Edge Chain Staking Contract...");
  console.log("Deployer address:", deployer.address);
  console.log("Network:", network.name);

  // In production, these should be loaded from env or config per network
  const GATEWAY_ADDRESS = process.env.GATEWAY_ADDRESS || "0x..."; 
  const ZETA_ROUTER_ADDRESS = process.env.ZETA_ROUTER_ADDRESS || "0x...";

  if (GATEWAY_ADDRESS === "0x..." || ZETA_ROUTER_ADDRESS === "0x...") {
    console.error("Please set GATEWAY_ADDRESS and ZETA_ROUTER_ADDRESS in env or code before deploying.");
    process.exit(1);
  }

  const LocalStaking = await ethers.getContractFactory("LocalStaking");
  const staking = await LocalStaking.deploy(deployer.address);
  await staking.waitForDeployment();
  const localStakingAddress = await staking.getAddress();
  console.log("LocalStaking deployed to:", localStakingAddress);

  const StakingAdapter = await ethers.getContractFactory("StakingAdapter");
  const adapter = await StakingAdapter.deploy(
    GATEWAY_ADDRESS,
    ZETA_ROUTER_ADDRESS,
    localStakingAddress,
    deployer.address
  );
  await adapter.waitForDeployment();
  const adapterAddress = await adapter.getAddress();
  console.log("StakingAdapter deployed to:", adapterAddress);

  const txAuth = await staking.setAdapter(adapterAddress, true);
  await txAuth.wait();
  console.log("StakingAdapter authorized on LocalStaking.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
