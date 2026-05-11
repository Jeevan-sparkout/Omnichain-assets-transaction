import { readFile } from "fs/promises";
import path from "path";
import { execSync } from "child_process";
import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";

dotenvConfig();

type Artifact = {
  abi: ethers.InterfaceAbi;
  bytecode: string;
};

async function readArtifact(relativePath: string): Promise<Artifact> {
  const fullPath = path.resolve(process.cwd(), relativePath);
  const artifact = JSON.parse(await readFile(fullPath, "utf8")) as {
    abi: ethers.InterfaceAbi;
    bytecode?: string;
  };

  if (!artifact.abi || !artifact.bytecode) {
    throw new Error(`Invalid artifact at ${relativePath}`);
  }

  return { abi: artifact.abi, bytecode: artifact.bytecode };
}

function resolveEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.startsWith("$(") && trimmed.endsWith(")")) {
    return execSync(trimmed.slice(2, -1), { encoding: "utf8" }).trim();
  }
  return trimmed;
}

function normalizeAddress(value: string, label: string): string {
  if (!ethers.isAddress(value)) {
    throw new Error(`${label} must be a valid 0x-prefixed address, got: ${value}`);
  }
  return ethers.getAddress(value);
}

async function deployProxy(
  rpcUrl: string,
  privateKey: string,
  implementationArtifactPath: string,
  proxyArtifactPath: string,
  initializeArgs: unknown[],
  initializeFunctionName: string,
  label: string
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const implArtifact = await readArtifact(implementationArtifactPath);
  const proxyArtifact = await readArtifact(proxyArtifactPath);

  console.log(`deploying ${label} implementation as ${await wallet.getAddress()}`);
  const implFactory = new ethers.ContractFactory(implArtifact.abi, implArtifact.bytecode, wallet);
  const impl = await implFactory.deploy();
  await impl.waitForDeployment();

  const initData = new ethers.Interface(implArtifact.abi).encodeFunctionData(
    initializeFunctionName,
    initializeArgs
  );
  const proxyFactory = new ethers.ContractFactory(proxyArtifact.abi, proxyArtifact.bytecode, wallet);
  const proxy = await proxyFactory.deploy(await impl.getAddress(), initData);
  await proxy.waitForDeployment();

  return {
    implementation: await impl.getAddress(),
    proxy: await proxy.getAddress(),
    deployer: await wallet.getAddress(),
  };
}

async function deployLabeledProxy(
  label: string,
  rpcUrl: string,
  privateKey: string,
  implementationArtifactPath: string,
  proxyArtifactPath: string,
  initializeArgs: unknown[],
  initializeFunctionName: string
) {
  try {
    return await deployProxy(
      rpcUrl,
      privateKey,
      implementationArtifactPath,
      proxyArtifactPath,
      initializeArgs,
      initializeFunctionName,
      label
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} deployment failed: ${message}`);
  }
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const initialOwner = process.env.INITIAL_OWNER;
  const tokenName = process.env.TOKEN_NAME ?? "JP";
  const tokenSymbol = process.env.TOKEN_SYMBOL ?? tokenName;
  const gas = BigInt(process.env.GAS_LIMIT ?? "1000000");
  const minZetaBalance = ethers.parseEther(process.env.MIN_ZETA_BALANCE ?? "0.01");

  const rpcZeta = resolveEnv(process.env.RPC_ZETACHAIN ?? process.env.ZETA_RPC_URL);
  const rpcBsc = resolveEnv(process.env.RPC_BSC ?? process.env.BSC_RPC);
  const rpcEthereum = resolveEnv(process.env.RPC_ETHEREUM ?? process.env.SEPOLIA_RPC_URL);

  const gatewayBsc = resolveEnv(process.env.GATEWAY_BSC);
  const gatewayEthereum = resolveEnv(process.env.GATEWAY_ETHEREUM);

  if (!privateKey) throw new Error("PRIVATE_KEY is required");
  if (!rpcZeta) throw new Error("RPC_ZETACHAIN or ZETA_RPC_URL is required");
  if (!rpcBsc) throw new Error("RPC_BSC is required");
  if (!rpcEthereum) throw new Error("RPC_ETHEREUM or SEPOLIA_RPC_URL is required");
  if (!gatewayBsc) throw new Error("GATEWAY_BSC is required");
  if (!gatewayEthereum) throw new Error("GATEWAY_ETHEREUM is required");

  const deployer = new ethers.Wallet(privateKey);
  const owner = initialOwner ? normalizeAddress(initialOwner, "INITIAL_OWNER") : deployer.address;

  const zetaProvider = new ethers.JsonRpcProvider(rpcZeta);
  const bscProvider = new ethers.JsonRpcProvider(rpcBsc);
  const ethereumProvider = new ethers.JsonRpcProvider(rpcEthereum);
  const [zetaBalance, bscBalance, ethereumBalance] = await Promise.all([
    zetaProvider.getBalance(deployer.address),
    bscProvider.getBalance(deployer.address),
    ethereumProvider.getBalance(deployer.address),
  ]);

  console.log(
    JSON.stringify(
      {
        deployer: deployer.address,
        balances: {
          zeta: ethers.formatEther(zetaBalance),
          bsc: ethers.formatEther(bscBalance),
          ethereum: ethers.formatEther(ethereumBalance),
        },
      },
      null,
      2
    )
  );

  if (zetaBalance < minZetaBalance) {
    throw new Error(
      `ZetaChain balance too low for deployment: have ${ethers.formatEther(zetaBalance)} ZETA, need at least ${ethers.formatEther(minZetaBalance)} ZETA`
    );
  }

  const zeta = await deployLabeledProxy(
    "zeta",
    rpcZeta,
    privateKey,
    "artifacts/contracts/token/ZetaChainUniversalToken.sol/ZetaChainUniversalToken.json",
    "artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json",
    [owner, tokenName, tokenSymbol, gas],
    "initializeZetaChainUniversalToken"
  );

  const bsc = await deployLabeledProxy(
    "bsc",
    rpcBsc,
    privateKey,
    "artifacts/contracts/token/EVMUniversalToken.sol/EVMUniversalToken.json",
    "artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json",
    [owner, tokenName, tokenSymbol, gas, gatewayBsc],
    "initializeEVMUniversalToken"
  );

  const ethereum = await deployLabeledProxy(
    "ethereum",
    rpcEthereum,
    privateKey,
    "artifacts/contracts/token/EVMUniversalToken.sol/EVMUniversalToken.json",
    "artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json",
    [owner, tokenName, tokenSymbol, gas, gatewayEthereum],
    "initializeEVMUniversalToken"
  );

  console.log(
    JSON.stringify(
      {
        tokenName,
        tokenSymbol,
        gas: gas.toString(),
        zeta,
        bsc,
        ethereum,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
