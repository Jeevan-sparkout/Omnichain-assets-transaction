import { ethers } from "ethers";

const errorStrings = [
  "CallerIsNotFungibleModule()",
  "InvalidSender()",
  "GasFeeTransferFailed()",
  "ZeroGasCoin()",
  "ZeroGasPrice()",
  "LowAllowance()",
  "LowBalance()",
  "ZeroAddress()"
];

for (const err of errorStrings) {
  const hash = ethers.id(err);
  const selector = hash.slice(0, 10);
  console.log(`${err} -> ${selector}`);
}
