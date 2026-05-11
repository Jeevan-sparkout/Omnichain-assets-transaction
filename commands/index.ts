import { readFile } from "fs/promises";
import path from "path";
import { ethers } from "ethers";

type ArgMap = Record<string, string>;

function parseArgs(argv: string[]): { command: string; args: ArgMap } {
  const [command = "help", ...rest] = argv;
  const args: ArgMap = {};

  for (let i = 0; i < rest.length; i += 1) {
    const current = rest[i];
    if (!current.startsWith("--")) continue;

    const key = current.slice(2);
    const value = rest[i + 1];
    if (value == null || value.startsWith("--")) {
      args[key] = "true";
      continue;
    }

    args[key] = value;
    i += 1;
  }

  return { command, args };
}

function requireArg(args: ArgMap, key: string): string {
  const value = args[key];
  if (!value) throw new Error(`Missing required flag: --${key}`);
  return value;
}

async function loadArtifactByName(name: string): Promise<{ abi: unknown[]; bytecode: string }> {
  const root = path.resolve(process.cwd());
  const candidates = [
    path.join(root, "artifacts", "contracts", `${name}.sol`, `${name}.json`),
    path.join(root, "artifacts", "contracts", "token", `${name}.sol`, `${name}.json`),
    path.join(root, "artifacts", `${name}.json`),
  ];

  for (const candidate of candidates) {
    try {
      const artifact = JSON.parse(await readFile(candidate, "utf8")) as {
        abi?: unknown[];
        bytecode?: string | { object?: string };
      };
      const bytecode =
        typeof artifact.bytecode === "string"
          ? artifact.bytecode
          : artifact.bytecode?.object ?? "";

      if (!artifact.abi || !bytecode) continue;
      return { abi: artifact.abi, bytecode };
    } catch {
      continue;
    }
  }

  throw new Error(
    `Could not find artifact for ${name}. Compile the contract first or pass a contract name that exists in artifacts/.`
  );
}

async function getSigner(rpc: string, privateKey: string) {
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  return { provider, wallet };
}

function decodeJsonArg(value: string | undefined, fallback: unknown): unknown {
  if (!value) return fallback;
  return JSON.parse(value);
}

async function deployCommand(args: ArgMap) {
  const rpc = requireArg(args, "rpc");
  const privateKey = requireArg(args, "private-key");
  const name = requireArg(args, "name");
  const constructorArgs = decodeJsonArg(args["constructor-args"], []) as any[];

  const { wallet } = await getSigner(rpc, privateKey);
  const artifact = await loadArtifactByName(name);
  const factory = new ethers.ContractFactory(artifact.abi as ethers.InterfaceAbi, artifact.bytecode, wallet);
  const contract = await factory.deploy(...constructorArgs);
  await contract.waitForDeployment();

  console.log(JSON.stringify({ command: "deploy", name, address: await contract.getAddress() }, null, 2));
}

async function mintCommand(args: ArgMap) {
  const rpc = requireArg(args, "rpc");
  const privateKey = requireArg(args, "private-key");
  const contractAddress = requireArg(args, "contract");
  const name = requireArg(args, "name");
  const amount = BigInt(requireArg(args, "amount"));
  const recipient = args["recipient"];

  const { wallet } = await getSigner(rpc, privateKey);
  const artifact = await loadArtifactByName(name);
  const contract = new ethers.Contract(contractAddress, artifact.abi as ethers.InterfaceAbi, wallet);

  const signerAddress = await wallet.getAddress();
  const targetRecipient = recipient ?? signerAddress;

  let tx: ethers.ContractTransactionResponse;
  try {
    tx = await contract.mint(targetRecipient, amount);
  } catch {
    tx = await contract.mint(amount);
  }

  await tx.wait();
  console.log(JSON.stringify({ command: "mint", contract: contractAddress, amount: amount.toString() }, null, 2));
}

async function transferCommand(args: ArgMap) {
  const rpc = requireArg(args, "rpc");
  const privateKey = requireArg(args, "private-key");
  const contractAddress = requireArg(args, "contract");
  const name = requireArg(args, "name");
  const destination = requireArg(args, "destination");
  const amount = BigInt(requireArg(args, "amount"));
  const gasAmount = BigInt(requireArg(args, "gas-amount"));
  const method = args["method"];

  const { wallet } = await getSigner(rpc, privateKey);
  const artifact = await loadArtifactByName(name);
  const contract = new ethers.Contract(contractAddress, artifact.abi as ethers.InterfaceAbi, wallet);

  let tx: ethers.ContractTransactionResponse;
  const encodedDestination =
    destination.startsWith("0x") && destination.length === 42
      ? ethers.solidityPacked(["address"], [ethers.getAddress(destination)])
      : destination;

  if (method) {
    tx = await contract[method](encodedDestination, amount, gasAmount);
  } else {
    try {
      tx = await contract.transferCrossChain(encodedDestination, amount, gasAmount);
    } catch {
      try {
        tx = await contract.transfer(encodedDestination, amount, gasAmount);
      } catch {
        try {
          tx = await contract.send(encodedDestination, amount, gasAmount);
        } catch {
          throw new Error(
            "Could not infer a transfer method. Re-run with --method <functionName> and ensure the ABI matches the contract."
          );
        }
      }
    }
  }

  await tx.wait();
  console.log(
    JSON.stringify(
      { command: "transfer", contract: contractAddress, destination, amount: amount.toString(), gasAmount: gasAmount.toString() },
      null,
      2
    )
  );
}

async function main() {
  const { command, args } = parseArgs(process.argv.slice(2));

  switch (command) {
    case "deploy":
      await deployCommand(args);
      return;
    case "mint":
      await mintCommand(args);
      return;
    case "transfer":
      await transferCommand(args);
      return;
    case "help":
    default:
      console.log(
        [
          "Usage:",
          "  npx tsx commands deploy --rpc <url> --private-key <key> --name <ContractName> [--constructor-args '[]']",
          "  npx tsx commands mint --rpc <url> --private-key <key> --contract <address> --amount <wei> [--recipient <address>]",
          "  npx tsx commands transfer --rpc <url> --private-key <key> --contract <address> --destination <address|bytes> --amount <wei> --gas-amount <wei> [--method <name>]",
        ].join("\n")
      );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
