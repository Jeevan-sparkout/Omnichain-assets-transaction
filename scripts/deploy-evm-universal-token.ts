import { ethers } from "hardhat";

async function main() {
  const initialOwner = process.env.INITIAL_OWNER;
  const gatewayAddress = process.env.GATEWAY_ADDRESS;
  const name = process.env.TOKEN_NAME ?? "EVM Universal Token";
  const symbol = process.env.TOKEN_SYMBOL ?? "EUT";
  const gas = BigInt(process.env.GAS_LIMIT ?? "1000000");

  if (!initialOwner) throw new Error("INITIAL_OWNER is required");
  if (!gatewayAddress) throw new Error("GATEWAY_ADDRESS is required");

  const implFactory = await ethers.getContractFactory(
    "@zetachain/standard-contracts/contracts/token/contracts/example/EVMUniversalToken.sol:EVMUniversalToken"
  );
  const impl = await implFactory.deploy();
  await impl.waitForDeployment();

  const initData = new ethers.Interface(impl.interface.fragments).encodeFunctionData(
    "initializeEVMUniversalToken",
    [
    initialOwner,
    name,
    symbol,
    gas,
    gatewayAddress,
    ]
  );
  const proxyFactory = await ethers.getContractFactory("ERC1967Proxy");
  const proxy = await proxyFactory.deploy(await impl.getAddress(), initData);
  await proxy.waitForDeployment();

  console.log("implementation:", await impl.getAddress());
  console.log("proxy:", await proxy.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
