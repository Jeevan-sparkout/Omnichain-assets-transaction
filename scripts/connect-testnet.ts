import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function probeRpc(label: string, url: string) {
  const provider = new ethers.JsonRpcProvider(url);
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();
  console.log(`${label} RPC OK`);
  console.log(`  url: ${url}`);
  console.log(`  chainId: ${network.chainId.toString()}`);
  console.log(`  block: ${blockNumber}`);
  return provider;
}

function requireAddress(value: string | undefined, label: string): string {
  if (!value || !ethers.isAddress(value)) {
    throw new Error(`${label} is required and must be a valid 0x-prefixed address`);
  }
  return ethers.getAddress(value);
}

async function linkUniversal(
  token: any,
  zetaAddress: string,
  label: string,
  connectFn: string
) {
  const universalTarget = await token.universal();
  if (universalTarget.toLowerCase() !== zetaAddress.toLowerCase()) {
    console.log(`Linking ${label} contract back to ZetaChain contract...`);
    const tx = await token[connectFn](zetaAddress);
    await tx.wait();
    console.log(`${label} contract linked successfully!`);
  } else {
    console.log(`${label} contract already points back to ZetaChain.`);
  }
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is required");

  const rpcZeta = process.env.RPC_ZETACHAIN;
  const rpcBsc = process.env.RPC_BSC;
  const rpcEthereum = process.env.RPC_ETHEREUM;
  if (!rpcZeta) throw new Error("RPC_ZETACHAIN is required");
  if (!rpcBsc) throw new Error("RPC_BSC is required");

  const zetaProvider = await probeRpc("ZetaChain", rpcZeta);
  const bscProvider = await probeRpc("BSC", rpcBsc);
  const ethereumProvider = rpcEthereum ? await probeRpc("Ethereum", rpcEthereum) : undefined;

  const deployer = new ethers.Wallet(privateKey, zetaProvider);
  const zetaProxyAddress = requireAddress(
    process.env.ZETA_PROXY_ADDRESS || "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe",
    "ZETA_PROXY_ADDRESS"
  );
  const bscProxyAddress = requireAddress(
    process.env.BSC_PROXY_ADDRESS || zetaProxyAddress,
    "BSC_PROXY_ADDRESS"
  );
  const zrc20Bsc = requireAddress(
    process.env.ZRC20_BSC_BNB || "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891",
    "ZRC20_BSC_BNB"
  );

  const tokenFactory = await ethers.getContractFactory(
    "@zetachain/standard-contracts/contracts/token/contracts/example/ZetaChainUniversalToken.sol:ZetaChainUniversalToken"
  );
  const zetaToken = tokenFactory.attach(zetaProxyAddress).connect(deployer) as any;

  const bscFactory = await ethers.getContractFactory(
    "@zetachain/standard-contracts/contracts/token/contracts/example/EVMUniversalToken.sol:EVMUniversalToken"
  );
  const bscToken = bscFactory.attach(bscProxyAddress).connect(deployer.connect(bscProvider)) as any;

  const expectedBscBytes = ethers.solidityPacked(["address"], [bscProxyAddress]);
  const connectedBytes = await zetaToken.connected(zrc20Bsc);
  if (connectedBytes.toLowerCase() !== expectedBscBytes.toLowerCase()) {
    console.log("Linking BSC contract to ZetaChain contract...");
    const connectTx = await zetaToken.setConnected(zrc20Bsc, expectedBscBytes);
    await connectTx.wait();
    console.log("BSC contract linked successfully!");
  } else {
    console.log("BSC contract already linked.");
  }

  await linkUniversal(bscToken, zetaProxyAddress, "BSC", "setUniversal");

  if (rpcEthereum && ethereumProvider) {
    const ethereumProxyAddress = process.env.ETHEREUM_PROXY_ADDRESS;
    const zrc20Ethereum = process.env.ZRC20_SEPOLIA_ETH;

    if (!ethereumProxyAddress) {
      console.log("Skipping Ethereum link: ETHEREUM_PROXY_ADDRESS not set.");
    } else if (!zrc20Ethereum) {
      console.log("Skipping Ethereum link: ZRC20_SEPOLIA_ETH not set.");
    } else if (!ethers.isAddress(ethereumProxyAddress) || !ethers.isAddress(zrc20Ethereum)) {
      throw new Error("ETHEREUM_PROXY_ADDRESS and ZRC20_SEPOLIA_ETH must be valid addresses");
    } else {
      const ethereumProxy = ethers.getAddress(ethereumProxyAddress);
      const ethereumZrc20 = ethers.getAddress(zrc20Ethereum);
      const ethereumFactory = await ethers.getContractFactory(
        "@zetachain/standard-contracts/contracts/token/contracts/example/EVMUniversalToken.sol:EVMUniversalToken"
      );
      const ethereumToken = ethereumFactory
        .attach(ethereumProxy)
        .connect(deployer.connect(ethereumProvider)) as any;

      const expectedEthBytes = ethers.solidityPacked(["address"], [ethereumProxy]);
      const ethConnectedBytes = await zetaToken.connected(ethereumZrc20);
      if (ethConnectedBytes.toLowerCase() !== expectedEthBytes.toLowerCase()) {
        console.log("Linking Ethereum contract to ZetaChain contract...");
        const connectTx = await zetaToken.setConnected(ethereumZrc20, expectedEthBytes);
        await connectTx.wait();
        console.log("Ethereum contract linked successfully!");
      } else {
        console.log("Ethereum contract already linked.");
      }

      await linkUniversal(ethereumToken, zetaProxyAddress, "Ethereum", "setUniversal");
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
