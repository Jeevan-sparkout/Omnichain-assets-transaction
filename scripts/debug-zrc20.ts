import { execSync } from "child_process";
import { config as dotenvConfig } from "dotenv";
import { ethers } from "hardhat";

dotenvConfig();

async function main() {
  const rpcUrl =
    process.env.RPC_ZETACHAIN ??
    process.env.ZETA_RPC_URL ??
    "https://zetachain-athens-evm.blockpi.network/v1/rpc/public";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  console.log(`Checking ZRC-20 address for Sepolia ETH on ${rpcUrl}...`);
  try {
    const zrc20Address = execSync("zetachain q tokens show -s ETH.ETHSEP -f zrc20").toString().trim();
    console.log(`Actual ZRC-20 Address for ETH.ETHSEP: ${zrc20Address}`);

    const expected = "0xc9073d4166687029583bcc0a887754b235c66228";
    if (zrc20Address.toLowerCase() !== expected.toLowerCase()) {
      console.log(`❌ Mismatch! The script was using ${expected}. Please update the script!`);
    } else {
      console.log("✅ The ZRC-20 address matches what we were using.");
    }
  } catch (e: any) {
    console.log("Could not run zetachain CLI command, proceeding with contract check...");
  }

  const zrc20AddressFallback =
    process.env.ZRC20_ETH_SEP ||
    process.env.ZRC20_ETHEREUM_SEPOLIA ||
    "0xc9073d4166687029583bcc0a887754b235c66228";
  const code = await provider.getCode(zrc20AddressFallback);
  if (code === "0x") {
    console.log(`❌ No contract code found at ${zrc20AddressFallback} on the selected RPC.`);
    console.log("This usually means the address is wrong for the network you are querying.");
    return;
  }

  console.log("\nChecking exact gas fee required from the ZRC-20 contract...");
  const zrc20Abi = ["function withdrawGasFeeWithGasLimit(uint256) view returns (uint256, uint256)"];
  const zrc20 = new ethers.Contract(zrc20AddressFallback, zrc20Abi, provider);

  try {
    const [gasToken, gasFee] = await zrc20.withdrawGasFeeWithGasLimit(50000);
    console.log(`Gas token: ${gasToken.toString()}`);
    console.log(`Gas fee (wei): ${gasFee.toString()}`);
    console.log(`Gas fee (ETH): ${ethers.formatEther(gasFee)}`);
  } catch (e: any) {
    console.log("❌ withdrawGasFeeWithGasLimit failed.");
    console.error(e.message);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
