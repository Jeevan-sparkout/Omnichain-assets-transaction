import { ethers } from "hardhat";

async function main() {
  const messengerAddress = process.env.MESSENGER_ADDRESS;
  const receiverAddress = process.env.REMOTE_RECEIVER_ADDRESS;
  const receiverBytes = process.env.REMOTE_RECEIVER_BYTES;
  const destinationGasZRC20 = process.env.DESTINATION_GAS_ZRC20;
  const message = process.env.CALL_MESSAGE ?? "hello from ZetaChain";
  const gasLimit = BigInt(process.env.GAS_LIMIT ?? "300000");

  if (!messengerAddress) throw new Error("MESSENGER_ADDRESS is required");
  if (!receiverAddress && !receiverBytes) {
    throw new Error("REMOTE_RECEIVER_ADDRESS or REMOTE_RECEIVER_BYTES is required");
  }
  if (!destinationGasZRC20) throw new Error("DESTINATION_GAS_ZRC20 is required");

  const [signer] = await ethers.getSigners();
  const messenger = await ethers.getContractAt("ZetaMessenger", messengerAddress, signer);
  const receiver =
    receiverBytes ?? ethers.solidityPacked(["address"], [ethers.getAddress(receiverAddress!)]);

  const gasFee = await messenger.quoteGasFee(destinationGasZRC20, gasLimit);
  console.log("quoted gas fee:", gasFee.toString());

  const tx = await messenger.callRemote(receiver, destinationGasZRC20, ethers.toUtf8Bytes(message), gasLimit, true);
  console.log("tx hash:", tx.hash);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
