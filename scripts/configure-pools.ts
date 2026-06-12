import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Configuring Pools for network:", network.name);

  // Address of the deployed CrossChainStaking or ZetaNativeStaking contract on the current network
  const STAKING_ADDRESS = process.env.STAKING_ADDRESS;
  if (!STAKING_ADDRESS) {
    console.error("Please set STAKING_ADDRESS in env");
    process.exit(1);
  }

  const staking = await ethers.getContractAt("CrossChainStaking", STAKING_ADDRESS);

  // Pool 1: Native Token (address(0)), 5% APY, 1 day
  console.log("Setting Pool 1: Native Token (5%, 1 day)");
  let tx = await staking.setPoolConfig(1, ethers.ZeroAddress, 500, 86400, true);
  await tx.wait();
  console.log("Pool 1 configured.");

  // Pool 2: Native Token (address(0)), 10% APY, 7 days
  console.log("Setting Pool 2: Native Token (10%, 7 days)");
  tx = await staking.setPoolConfig(2, ethers.ZeroAddress, 1000, 604800, true);
  await tx.wait();
  console.log("Pool 2 configured.");

  console.log("Pool configuration complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
