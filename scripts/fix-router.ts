import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

// Known correct ZetaChain Athens testnet system addresses
const CORRECT_ROUTER = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
const CORRECT_WZETA  = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");
  const rpcZeta = process.env.RPC_ZETACHAIN;
  if (!rpcZeta) throw new Error("RPC_ZETACHAIN is not set in .env");

  const zetaProvider = new ethers.JsonRpcProvider(rpcZeta);
  const deployer = new ethers.Wallet(privateKey, zetaProvider);

  const zetaProxyAddress =
    process.env.ZETA_PROXY_ADDRESS || "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe";

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Proxy:    ${zetaProxyAddress}`);
  console.log(`Target router: ${CORRECT_ROUTER}`);
  console.log(`Target WZETA:  ${CORRECT_WZETA}`);

  // ── Step 1: Deploy the new V2 implementation ──────────────────────────────
  console.log("\n[1/4] Deploying ZetaChainUniversalTokenV2 implementation...");
  const V2Factory = await ethers.getContractFactory(
    "ZetaChainUniversalTokenV2",
    deployer
  );
  const v2Impl = await V2Factory.deploy();
  await v2Impl.waitForDeployment();
  const v2ImplAddress = await v2Impl.getAddress();
  console.log(`  V2 implementation deployed at: ${v2ImplAddress}`);

  // ── Step 2: Upgrade the proxy via UUPS ───────────────────────────────────
  console.log("\n[2/4] Upgrading proxy to V2 implementation...");
  const upgradeAbi = [
    "function upgradeToAndCall(address newImplementation, bytes calldata data) external payable",
  ];
  const proxy = new ethers.Contract(zetaProxyAddress, upgradeAbi, deployer);
  const upgradeTx = await proxy.upgradeToAndCall(v2ImplAddress, "0x");
  console.log(`  Upgrade tx: ${upgradeTx.hash}`);
  await upgradeTx.wait();
  console.log("  ✅ Proxy upgraded successfully.");

  // ── Step 3 & 4: Set router and WZETA ─────────────────────────────────────
  const v2Abi = [
    "function setUniswapRouter(address newRouter) external",
    "function setWZETA(address newWZETA) external",
    "function uniswapRouter() view returns (address)",
    "function fixedWZETA() view returns (address)",
  ];
  const proxyV2 = new ethers.Contract(zetaProxyAddress, v2Abi, deployer);

  console.log("\n[3/4] Setting correct Uniswap router...");
  const routerBefore = await proxyV2.uniswapRouter();
  console.log(`  Router before: ${routerBefore}`);
  const setRouterTx = await proxyV2.setUniswapRouter(CORRECT_ROUTER);
  console.log(`  setUniswapRouter tx: ${setRouterTx.hash}`);
  await setRouterTx.wait();
  const routerAfter = await proxyV2.uniswapRouter();
  console.log(`  Router after:  ${routerAfter}`);

  console.log("\n[4/4] Setting correct WZETA address...");
  const setWzetaTx = await proxyV2.setWZETA(CORRECT_WZETA);
  console.log(`  setWZETA tx: ${setWzetaTx.hash}`);
  await setWzetaTx.wait();
  const wzetaAfter = await proxyV2.fixedWZETA();
  console.log(`  WZETA after:   ${wzetaAfter}`);

  const routerOk = routerAfter.toLowerCase() === CORRECT_ROUTER.toLowerCase();
  const wzetaOk  = wzetaAfter.toLowerCase()  === CORRECT_WZETA.toLowerCase();

  if (routerOk && wzetaOk) {
    console.log("\n🎉 Both fixes applied! Run the transfer:");
    console.log("   npx hardhat run scripts/move-to-sepolia.ts --network zetaTestnet");
  } else {
    if (!routerOk) console.error(`❌ Router mismatch: got ${routerAfter}`);
    if (!wzetaOk)  console.error(`❌ WZETA mismatch:  got ${wzetaAfter}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
