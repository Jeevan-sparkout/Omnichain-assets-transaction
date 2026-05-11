import { ethers } from "hardhat";

async function main() {
  const initialOwner = process.env.INITIAL_OWNER;
  const name = process.env.TOKEN_NAME ?? "ZetaChain Universal Token";
  const symbol = process.env.TOKEN_SYMBOL ?? "ZUT";
  const gas = BigInt(process.env.GAS_LIMIT ?? "1000000");

  if (!initialOwner) throw new Error("INITIAL_OWNER is required");

  const implFactory = await ethers.getContractFactory(
    "@zetachain/standard-contracts/contracts/token/contracts/example/ZetaChainUniversalToken.sol:ZetaChainUniversalToken"
  );
  const impl = await implFactory.deploy();
  await impl.waitForDeployment();

  const initData = new ethers.Interface(impl.interface.fragments).encodeFunctionData(
    "initializeZetaChainUniversalToken",
    [
    initialOwner,
    name,
    symbol,
    gas,
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
