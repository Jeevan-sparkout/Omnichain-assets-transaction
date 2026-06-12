import { ethers, network } from "hardhat";
import * as fs from "fs";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Setting up BSC Testnet with account: ${deployer.address}`);

    const StakingAdapterFactory = await ethers.getContractFactory("StakingAdapter");
    const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");

    const GATEWAY_ADDRESS = "0x0c487a766110c85d301d96e33579c5b317fa4995"; 
    const ZETA_ROUTER_ADDRESS = "0xE283b9Ac87e7e4D0895B8045B6d5d922893693f7"; 

    const localStakings = [
        "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
        "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
        "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
        "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
        "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A"
    ];

    let results: string[] = [];

    // The user wants 10 pools with different APY/Lockin (less lockin for testing)
    const poolConfigs = [
        { id: 1, apy: 500, duration: 300 }, // 5% APY, 5 mins lock
        { id: 2, apy: 1000, duration: 600 }, // 10% APY, 10 mins lock
        { id: 3, apy: 1500, duration: 1800 }, // 15% APY, 30 mins lock
        { id: 4, apy: 2000, duration: 3600 }, // 20% APY, 1 hour lock
        { id: 5, apy: 3000, duration: 7200 }, // 30% APY, 2 hours lock
        { id: 6, apy: 5000, duration: 14400 }, // 50% APY, 4 hours lock
        { id: 7, apy: 7500, duration: 43200 }, // 75% APY, 12 hours lock
        { id: 8, apy: 10000, duration: 86400 }, // 100% APY, 1 day lock
        { id: 9, apy: 15000, duration: 172800 }, // 150% APY, 2 days lock
        { id: 10, apy: 20000, duration: 259200 } // 200% APY, 3 days lock
    ];

    for (let i = 0; i < localStakings.length; i++) {
        const local = localStakings[i];
        console.log(`\n--- Processing LocalStaking ${i+1}: ${local} ---`);

        try {
            console.log(`Deploying adapter...`);
            const adapter = await StakingAdapterFactory.deploy(
                GATEWAY_ADDRESS, 
                ZETA_ROUTER_ADDRESS, 
                local,
                deployer.address
            );
            await adapter.waitForDeployment();
            const adapterAddress = await adapter.getAddress();
            console.log(`✅ Adapter deployed at: ${adapterAddress}`);

            const stakingContract = LocalStakingFactory.attach(local) as any;
            console.log(`Authorizing adapter...`);
            let tx = await stakingContract.setAdapter(adapterAddress, true);
            await tx.wait();
            console.log(`✅ Authorized adapter on LocalStaking`);

            console.log(`Configuring 10 pools...`);
            for (const cfg of poolConfigs) {
                // Use ethers.ZeroAddress to denote native token
                tx = await stakingContract.setPoolConfig(cfg.id, ethers.ZeroAddress, cfg.apy, cfg.duration, true);
                await tx.wait();
                console.log(`   Pool ${cfg.id}: ${cfg.apy/100}% APY, ${cfg.duration}s lock configured.`);
            }

            results.push(`${local}|${adapterAddress}`);
        } catch (e) {
            console.error(`Failed on contract ${i+1}:`, e);
        }
    }

    fs.writeFileSync("bsc-adapters-results.json", JSON.stringify(results, null, 2));
    console.log("\nSetup complete for BSC Testnet.");
}

main().catch(console.error);
