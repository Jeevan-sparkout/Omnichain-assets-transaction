import { ethers } from "hardhat";

const bscContracts = [
  "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
  "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
  "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
  "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
  "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A"
];

async function main() {
  console.log("Searching for authorized adapters on BSC Testnet...");

  const LocalStaking = await ethers.getContractFactory("LocalStaking");

  for (let i = 0; i < bscContracts.length; i++) {
    const contractAddr = bscContracts[i];
    const contract = LocalStaking.attach(contractAddr) as any;

    try {
      // Query events from block 40000000 to latest (Athens is fast, but we can query last 50000 blocks)
      const filter = contract.filters.AdapterStatusUpdated();
      const events = await contract.queryFilter(filter, -100000); // query last 100,000 blocks

      if (events.length > 0) {
        console.log(`Contract ${i + 1} (${contractAddr}):`);
        events.forEach((evt: any) => {
          console.log(`  Adapter: ${evt.args.adapter} (Status: ${evt.args.status})`);
        });
      } else {
        // Let's try querying from block 0 or a larger range if needed, or query transaction receipts
        const eventsAll = await contract.queryFilter(filter, 0, "latest");
        console.log(`Contract ${i + 1} (${contractAddr}):`);
        if (eventsAll.length > 0) {
          eventsAll.forEach((evt: any) => {
            console.log(`  Adapter: ${evt.args.adapter} (Status: ${evt.args.status})`);
          });
        } else {
          console.log("  No AdapterStatusUpdated events found.");
        }
      }
    } catch (e) {
      console.error(`Error querying contract ${contractAddr}:`, e);
    }
  }
}

main().catch(console.error);
