import { ethers } from "hardhat";
import * as hre from "hardhat";

async function main() {
    console.log("Checking networks operational status and balances...\n");

    // We can't easily iterate over all networks using hre.ethers.provider because it is bound to the current network.
    // Instead, we will construct JsonRpcProviders using the URLs from the config.
    const configNetworks = hre.config.networks;
    const networksToCheck = ["zetaTestnet", "sepolia", "bscTestnet", "baseSepolia"];

    const deployer = new ethers.Wallet(process.env.PRIVATE_KEY || "");
    console.log(`Deployer address: ${deployer.address}\n`);

    for (const netName of networksToCheck) {
        const netConfig = configNetworks[netName] as any;
        if (!netConfig || !netConfig.url) {
            console.log(`❌ ${netName}: Missing URL configuration`);
            continue;
        }

        try {
            const provider = new ethers.JsonRpcProvider(netConfig.url);
            const blockNumber = await provider.getBlockNumber();
            const balance = await provider.getBalance(deployer.address);
            console.log(`✅ ${netName}: Operational (Block: ${blockNumber}) | Balance: ${ethers.formatEther(balance)}`);
        } catch (e: any) {
            console.log(`❌ ${netName}: Error - ${e.message}`);
        }
    }
}

main().catch(console.error);
