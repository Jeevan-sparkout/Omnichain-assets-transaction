import { ethers } from "hardhat";

async function main() {
  const gatewayAddress =
    process.env.DESTINATION_GATEWAY_ADDRESS ??
    process.env.GATEWAY_DESTINATION ??
    process.env.GATEWAY_BSC ??
    process.env.GATEWAY_ETHEREUM;
  if (!gatewayAddress) {
    throw new Error(
      "DESTINATION_GATEWAY_ADDRESS, GATEWAY_DESTINATION, GATEWAY_BSC, or GATEWAY_ETHEREUM is required"
    );
  }

  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("ChainReceiver");
  const contract = await factory.deploy(gatewayAddress, deployer.address);
  await contract.waitForDeployment();

  console.log("ChainReceiver:", await contract.getAddress());
  console.log("deployer:", deployer.address);
  console.log("gateway:", gatewayAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
