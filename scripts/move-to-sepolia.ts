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

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  // Use the live ZetaChain RPC from env; do not fall back to a stale endpoint.
  const rpcZeta = process.env.RPC_ZETACHAIN;
  if (!rpcZeta) throw new Error("RPC_ZETACHAIN is not set in .env");
  const zetaProvider = await probeRpc("ZetaChain", rpcZeta);
  const rpcSepolia = process.env.SEPOLIA_RPC_URL;
  if (!rpcSepolia) throw new Error("SEPOLIA_RPC_URL is not set in .env");
  const sepoliaProvider = await probeRpc("Sepolia", rpcSepolia);
  const deployer = new ethers.Wallet(privateKey, zetaProvider);

  const zetaProxyAddress =
    process.env.ZETA_PROXY_ADDRESS || "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe";
  const sepoliaProxyAddress =
    process.env.SEPOLIA_PROXY_ADDRESS || "0x6B644A9Ed78f135A6c4C75A0788d8D02a58e335D";
  const zrc20SepoliaEth =
    process.env.ZRC20_SEPOLIA_ETH ?? "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0";
  const gasLimitCandidates = (
    process.env.CROSS_CHAIN_GAS_LIMITS || "50000,100000,250000,500000,1000000"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => BigInt(value));
  const nativeZetaFee = ethers.parseEther(process.env.NATIVE_ZETA_FEE || "2.5");

  // Amount to send (100 tokens with 18 decimals)
  const transferAmount = ethers.parseUnits("100", 18);

  // Load the ZetaChain token contract
  console.log("Loading ZetaChain Universal Token contract...");
  const tokenFactory = await ethers.getContractFactory(
    "@zetachain/standard-contracts/contracts/token/contracts/example/ZetaChainUniversalToken.sol:ZetaChainUniversalToken"
  );
  const zetaToken = tokenFactory.attach(zetaProxyAddress).connect(deployer) as any;

  
  // 1. Check current token balance on ZetaChain
  const currentBalance = await zetaToken.balanceOf(deployer.address);
  console.log(`Current Token Balance on ZetaChain: ${ethers.formatUnits(currentBalance, 18)} JP`);

  // Mint tokens if balance is insufficient
  if (currentBalance < transferAmount) {
    console.log("Balance too low. Minting 100 tokens to your address...");
    const mintTx = await zetaToken.mint(deployer.address, transferAmount);
    await mintTx.wait();
    console.log("Tokens minted successfully.");
  }

  // 2. Connect the Sepolia contract to the ZetaChain contract
  // This tells ZetaChain: "When sending tokens to Sepolia (ZRC-20), send them to this Sepolia contract address"
  const expectedBytes = ethers.solidityPacked(["address"], [sepoliaProxyAddress]);
  const connectedBytes = await zetaToken.connected(zrc20SepoliaEth);
  
  if (connectedBytes.toLowerCase() !== expectedBytes.toLowerCase()) {
    console.log("Linking Sepolia contract to ZetaChain contract...");
    const connectTx = await zetaToken.setConnected(zrc20SepoliaEth, expectedBytes);
    await connectTx.wait();
    console.log("Contracts linked successfully!");
  } else {
    console.log("Contracts are already linked.");
  }

  const sepoliaFactory = await ethers.getContractFactory(
    "@zetachain/standard-contracts/contracts/token/contracts/example/EVMUniversalToken.sol:EVMUniversalToken"
  );
  const sepoliaToken = sepoliaFactory.attach(sepoliaProxyAddress).connect(deployer.connect(sepoliaProvider)) as any;
  const universalTarget = await sepoliaToken.universal();
  if (universalTarget.toLowerCase() !== zetaProxyAddress.toLowerCase()) {
    console.log("Linking Sepolia contract back to ZetaChain contract...");
    const universalTx = await sepoliaToken.setUniversal(zetaProxyAddress);
    await universalTx.wait();
    console.log("Sepolia contract linked successfully!");
  } else {
    console.log("Sepolia contract already points back to ZetaChain.");
  }

  // 3. Lower the gas limit to reduce the required fee if needed
  const currentGasLimit = await zetaToken.gasLimitAmount();
  console.log(`Current cross-chain gas limit: ${currentGasLimit}`);
  console.log(`Gas limit candidates: ${gasLimitCandidates.join(", ")}`);

  // 4. Perform the cross-chain transfer
  console.log("Initiating Cross-Chain Transfer to Sepolia...");
  const zrc20Abi = [
    "function withdrawGasFeeWithGasLimit(uint256) view returns (address, uint256)",
  ];
  const zrc20 = new ethers.Contract(zrc20SepoliaEth, zrc20Abi, zetaProvider);
  const zrc20Code = await zetaProvider.getCode(zrc20SepoliaEth);
  if (zrc20Code === "0x") {
    throw new Error(
      `ZRC-20 address ${zrc20SepoliaEth} has no contract code on ZetaChain. Update ZRC20_SEPOLIA_ETH to the current ETH.ETHSEP ZRC-20 for this network.`
    );
  }
  console.log(`Provided native ZETA fee: ${ethers.formatEther(nativeZetaFee)} ZETA`);
  if (nativeZetaFee === 0n) {
    throw new Error("NATIVE_ZETA_FEE is zero");
  }

  for (const candidateGasLimit of gasLimitCandidates) {
    const activeGasLimit = await zetaToken.gasLimitAmount();
    if (activeGasLimit !== candidateGasLimit) {
      console.log(
        `Updating contract gas limit from ${activeGasLimit} to ${candidateGasLimit}...`
      );
      const gasTx = await zetaToken.setGasLimit(candidateGasLimit);
      await gasTx.wait();
      console.log("Gas limit updated successfully.");
    }

    const [gasToken, quotedGasFee] = await zrc20.withdrawGasFeeWithGasLimit(candidateGasLimit);
    console.log(`Trying gas limit: ${candidateGasLimit}`);
    console.log(`Quoted destination gas token: ${gasToken}`);
    console.log(`Quoted destination gas fee: ${ethers.formatEther(quotedGasFee)}`);

    try {
      await zetaToken.transferCrossChain.staticCall(
        zrc20SepoliaEth,
        deployer.address,
        transferAmount,
        {
          value: nativeZetaFee,
          gasLimit: 1000000,
        }
      );
      console.log(`Static call passed at gas limit ${candidateGasLimit}.`);

      const tx = await zetaToken.transferCrossChain(
        zrc20SepoliaEth,
        deployer.address,
        transferAmount,
        {
          value: nativeZetaFee,
          gasLimit: 1000000,
        }
      );

      console.log(`Transaction sent! TX Hash: ${tx.hash}`);
      console.log("Waiting for confirmation...");
      await tx.wait();

      console.log(`\n🎉 Success! You transferred 100 tokens from ZetaChain to Sepolia.`);
      console.log(`You can track the cross-chain message here:`);
      console.log(`https://testnet.zetachain.com/cc/tx/${tx.hash}`);
      return;
    } catch (error) {
      const err = error as {
        shortMessage?: string;
        reason?: string;
        message?: string;
        info?: unknown;
        data?: unknown;
      };
      console.error(`Transfer failed at gas limit ${candidateGasLimit}:`);
      console.error(`  shortMessage: ${err.shortMessage ?? "n/a"}`);
      console.error(`  reason: ${err.reason ?? "n/a"}`);
      console.error(`  message: ${err.message ?? "n/a"}`);
      console.error(`  data: ${JSON.stringify(err.data ?? null)}`);
      console.error(`  info: ${JSON.stringify(err.info ?? null)}`);
    }
  }

  throw new Error("All cross-chain transfer attempts failed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
