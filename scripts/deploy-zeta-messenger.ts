import { ethers } from "hardhat";

async function main() {
  const gatewayAddress = process.env.ZETA_GATEWAY_ADDRESS ?? process.env.GATEWAY_ZETACHAIN;
  if (!gatewayAddress) throw new Error("ZETA_GATEWAY_ADDRESS or GATEWAY_ZETACHAIN is required");

  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("ZetaMessenger");
  const contract = await factory.deploy(gatewayAddress, deployer.address);
  await contract.waitForDeployment();

  console.log("ZetaMessenger:", await contract.getAddress());
  console.log("deployer:", deployer.address);
  console.log("gateway:", gatewayAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
