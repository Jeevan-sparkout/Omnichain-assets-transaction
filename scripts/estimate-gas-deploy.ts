import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
  const StakingAdapterFactory = await ethers.getContractFactory("StakingAdapter");

  console.log("Estimating deployment gas...");

  const localDeployTx = await LocalStakingFactory.getDeployTransaction(deployer.address);
  const localGas = await ethers.provider.estimateGas(localDeployTx);
  console.log(`LocalStaking deployment gas: ${localGas}`);

  // Dummy addresses for adapter estimation
  const adapterDeployTx = await StakingAdapterFactory.getDeployTransaction(
    "0x0c487a766110c85d301d96e33579c5b317fa4995",
    "0xE283b9Ac87e7e4D0895B8045B6d5d922893693f7",
    deployer.address, // localStakingAddress dummy
    deployer.address
  );
  const adapterGas = await ethers.provider.estimateGas(adapterDeployTx);
  console.log(`StakingAdapter deployment gas: ${adapterGas}`);

  const totalGas = (localGas + adapterGas) * 5n;
  console.log(`Total gas for 5 contracts: ${totalGas}`);
  const gasPrice = (await ethers.provider.getFeeData()).gasPrice || 50000000000n;
  console.log(`Current gas price: ${ethers.formatUnits(gasPrice, "gwei")} Gwei`);
  console.log(`Total cost: ${ethers.formatEther(totalGas * gasPrice)} ETH`);
}

main().catch(console.error);
