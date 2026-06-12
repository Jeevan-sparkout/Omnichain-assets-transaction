import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

  const rpcEth = process.env.RPC_ETHEREUM || "https://ethereum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcEth);
  const wallet = new ethers.Wallet(privateKey, provider);

  const gatewayAddress = process.env.GATEWAY_ETHEREUM || "0x0c487a766110c85d301d96e33579c5b317fa4995";

  // ABI for the deposit function
  const abi = [
    {
      "inputs": [
        { "internalType": "address", "name": "receiver", "type": "address" },
        {
          "components": [
            { "internalType": "address", "name": "revertAddress", "type": "address" },
            { "internalType": "bool", "name": "callOnRevert", "type": "bool" },
            { "internalType": "address", "name": "abortAddress", "type": "address" },
            { "internalType": "bytes", "name": "revertMessage", "type": "bytes" },
            { "internalType": "uint256", "name": "onRevertGasLimit", "type": "uint256" }
          ],
          "internalType": "struct RevertOptions",
          "name": "revertOptions",
          "type": "tuple"
        }
      ],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ];

  const gateway = new ethers.Contract(gatewayAddress, abi, wallet);

  console.log("=========================================");
  console.log("🚀 Depositing Native ETH from Sepolia to ZetaChain");
  console.log(`Gateway: ${gatewayAddress}`);
  console.log(`Wallet:  ${wallet.address}`);
  console.log("=========================================");

  const balance = await provider.getBalance(wallet.address);
  console.log(`Current Sepolia ETH Balance: ${ethers.formatEther(balance)} ETH`);

  const depositAmount = ethers.parseEther("0.02");
  if (balance < depositAmount) {
    throw new Error("Insufficient balance for deposit");
  }

  const revertOptions = {
    revertAddress: wallet.address,
    callOnRevert: false,
    abortAddress: ethers.ZeroAddress,
    revertMessage: "0x",
    onRevertGasLimit: 0n
  };

  console.log(`\nSending 0.02 ETH to Sepolia Gateway...`);
  const tx = await gateway.deposit(wallet.address, revertOptions, {
    value: depositAmount,
    gasLimit: 150000
  });

  console.log(`Transaction Sent! Hash: ${tx.hash}`);
  console.log("Waiting for block confirmation...");
  const receipt = await tx.wait();
  console.log("🎉 Transaction confirmed! Block:", receipt.blockNumber);
  console.log(`Explorer link: https://sepolia.etherscan.io/tx/${tx.hash}`);
}

main().catch(console.error);
