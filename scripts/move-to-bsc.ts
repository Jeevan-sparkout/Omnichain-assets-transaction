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

  const rpcZeta = process.env.RPC_ZETACHAIN;
  if (!rpcZeta) throw new Error("RPC_ZETACHAIN is not set in .env");
  const zetaProvider = await probeRpc("ZetaChain", rpcZeta);

  const rpcBsc = process.env.RPC_BSC ?? process.env.BSC_RPC_URL;
  if (!rpcBsc) throw new Error("RPC_BSC is not set in .env");
  const bscProvider = await probeRpc("BSC", rpcBsc);

  const deployer = new ethers.Wallet(privateKey, zetaProvider);
  const zetaProxyAddress =
    process.env.ZETA_PROXY_ADDRESS || "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe";
  const bscProxyAddress =
    process.env.BSC_PROXY_ADDRESS || process.env.ZETA_PROXY_ADDRESS || zetaProxyAddress;
  const zrc20BscBnb =
    process.env.ZRC20_BSC_BNB ?? "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891";
  const gasLimitCandidates = (
    process.env.CROSS_CHAIN_GAS_LIMITS || "50000,100000,250000,500000,1000000"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => BigInt(value));
  const nativeZetaFee = ethers.parseEther(process.env.NATIVE_ZETA_FEE || "2.5");

  const transferAmountCandidates = (
    process.env.TRANSFER_AMOUNT_CANDIDATES || "1,10,100"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => ethers.parseUnits(value, 18));

  console.log("Loading ZetaChain Universal Token contract...");
  const tokenFactory = await ethers.getContractFactory(
    "@zetachain/standard-contracts/contracts/token/contracts/example/ZetaChainUniversalToken.sol:ZetaChainUniversalToken"
  );
  const zetaToken = tokenFactory.attach(zetaProxyAddress).connect(deployer) as any;

  const currentBalance = await zetaToken.balanceOf(deployer.address);
  console.log(`Current Token Balance on ZetaChain: ${ethers.formatUnits(currentBalance, 18)} JP`);

  const maxRequested = transferAmountCandidates[transferAmountCandidates.length - 1];
  if (currentBalance < maxRequested) {
    console.log(`Balance too low. Minting ${ethers.formatUnits(maxRequested, 18)} tokens to your address...`);
    const mintTx = await zetaToken.mint(deployer.address, maxRequested);
    await mintTx.wait();
    console.log("Tokens minted successfully.");
  }

  const expectedBytes = ethers.solidityPacked(["address"], [bscProxyAddress]);
  const connectedBytes = await zetaToken.connected(zrc20BscBnb);
  if (connectedBytes.toLowerCase() !== expectedBytes.toLowerCase()) {
    console.log("Linking BSC contract to ZetaChain contract...");
    const connectTx = await zetaToken.setConnected(zrc20BscBnb, expectedBytes);
    await connectTx.wait();
    console.log("Contracts linked successfully!");
  } else {
    console.log("Contracts are already linked.");
  }

  const bscFactory = await ethers.getContractFactory(
    "@zetachain/standard-contracts/contracts/token/contracts/example/EVMUniversalToken.sol:EVMUniversalToken"
  );
  const bscToken = bscFactory.attach(bscProxyAddress).connect(deployer.connect(bscProvider)) as any;
  const universalTarget = await bscToken.universal();
  if (universalTarget.toLowerCase() !== zetaProxyAddress.toLowerCase()) {
    console.log("Linking BSC contract back to ZetaChain contract...");
    const universalTx = await bscToken.setUniversal(zetaProxyAddress);
    await universalTx.wait();
    console.log("BSC contract linked successfully!");
  } else {
    console.log("BSC contract already points back to ZetaChain.");
  }

  const currentGasLimit = await zetaToken.gasLimitAmount();
  console.log(`Current cross-chain gas limit: ${currentGasLimit}`);
  console.log(`Gas limit candidates: ${gasLimitCandidates.join(", ")}`);

  console.log("Initiating Cross-Chain Transfer to BSC...");
  const zrc20Abi = [
    "function withdrawGasFeeWithGasLimit(uint256) view returns (address, uint256)",
  ];
  const zrc20 = new ethers.Contract(zrc20BscBnb, zrc20Abi, zetaProvider);
  const zrc20Code = await zetaProvider.getCode(zrc20BscBnb);
  if (zrc20Code === "0x") {
    throw new Error(
      `ZRC-20 address ${zrc20BscBnb} has no contract code on ZetaChain. Update ZRC20_BSC_BNB to the current BNB.BSC ZRC-20 for this network.`
    );
  }

  console.log(`Provided native ZETA fee: ${ethers.formatEther(nativeZetaFee)} ZETA`);
  if (nativeZetaFee === 0n) {
    throw new Error("NATIVE_ZETA_FEE is zero");
  }

  for (const candidateGasLimit of gasLimitCandidates) {
    const activeGasLimit = await zetaToken.gasLimitAmount();
    if (activeGasLimit !== candidateGasLimit) {
      console.log(`Updating contract gas limit from ${activeGasLimit} to ${candidateGasLimit}...`);
      const gasTx = await zetaToken.setGasLimit(candidateGasLimit);
      await gasTx.wait();
      console.log("Gas limit updated successfully.");
    }

    const [gasToken, quotedGasFee] = await zrc20.withdrawGasFeeWithGasLimit(candidateGasLimit);
    console.log(`Trying gas limit: ${candidateGasLimit}`);
    console.log(`Quoted destination gas token: ${gasToken}`);
    console.log(`Quoted destination gas fee: ${ethers.formatEther(quotedGasFee)}`);

    for (const transferAmount of transferAmountCandidates) {
      try {
        console.log(`Trying transfer amount: ${ethers.formatUnits(transferAmount, 18)} JP`);
        await zetaToken.transferCrossChain.staticCall(
          zrc20BscBnb,
          deployer.address,
          transferAmount,
          {
            value: nativeZetaFee,
            gasLimit: 1000000,
          }
        );
        console.log(`Static call passed at gas limit ${candidateGasLimit} and amount ${ethers.formatUnits(transferAmount, 18)}.`);

        const tx = await zetaToken.transferCrossChain(
          zrc20BscBnb,
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

        console.log(`\n🎉 Success! You transferred ${ethers.formatUnits(transferAmount, 18)} JP from ZetaChain to BSC.`);
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
        console.error(`Transfer failed at gas limit ${candidateGasLimit} and amount ${ethers.formatUnits(transferAmount, 18)}:`);
        console.error(`  shortMessage: ${err.shortMessage ?? "n/a"}`);
        console.error(`  reason: ${err.reason ?? "n/a"}`);
        console.error(`  message: ${err.message ?? "n/a"}`);
        console.error(`  data: ${JSON.stringify(err.data ?? null)}`);
        console.error(`  info: ${JSON.stringify(err.info ?? null)}`);
      }
    }
  }

  throw new Error("All cross-chain transfer attempts failed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
