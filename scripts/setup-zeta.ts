import { ethers, network } from "hardhat";
import * as fs from "fs";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Setting up ZetaChain Testnet with account: ${deployer.address}`);

    const ZetaNativeStakingFactory = await ethers.getContractFactory("ZetaNativeStaking");

    const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER || "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
    const WZETA = process.env.WZETA || "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";

    let results: string[] = [];

    // 10 pools with different APY/Lockin (less lockin for testing)
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

    const BSC_TESTNET_ID = 97;
    const SEPOLIA_ID = 11155111;
    const BSC_ZRC20 = "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891"; // BNB ZRC20 on Athens3
    const SEPOLIA_ZRC20 = "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0"; // ETH ZRC20 on Athens3

    for (let i = 0; i < 5; i++) {
        console.log(`\n--- Deploying ZetaNativeStaking ${i+1} ---`);

        try {
            const staking = await ZetaNativeStakingFactory.deploy(
                deployer.address, 
                UNISWAP_ROUTER, 
                WZETA,
                { gasPrice: 20000000000 }
            );
            await staking.waitForDeployment();
            const stakingAddress = await staking.getAddress();
            console.log(`✅ ZetaNativeStaking deployed at: ${stakingAddress}`);

            const stakingContract = ZetaNativeStakingFactory.attach(stakingAddress) as any;

            console.log(`Setting ZRC20 target chains...`);
            let tx = await stakingContract.setChainZRC20(BSC_TESTNET_ID, BSC_ZRC20, { gasPrice: 20000000000 });
            await tx.wait();
            tx = await stakingContract.setChainZRC20(SEPOLIA_ID, SEPOLIA_ZRC20, { gasPrice: 20000000000 });
            await tx.wait();
            console.log(`✅ ZRC20 mappings configured`);

            console.log(`Configuring 10 pools...`);
            for (const cfg of poolConfigs) {
                // Use ethers.ZeroAddress to denote native token
                tx = await stakingContract.setPoolConfig(cfg.id, ethers.ZeroAddress, cfg.apy, cfg.duration, true, { gasPrice: 20000000000 });
                await tx.wait();
                console.log(`   Pool ${cfg.id}: ${cfg.apy/100}% APY, ${cfg.duration}s lock configured.`);
            }

            results.push(stakingAddress);
        } catch (e) {
            console.error(`Failed on contract ${i+1}:`, e);
        }
    }

    fs.writeFileSync("zeta-native-results.json", JSON.stringify(results, null, 2));
    console.log("\nSetup complete for ZetaChain Testnet.");
}

main().catch(console.error);
