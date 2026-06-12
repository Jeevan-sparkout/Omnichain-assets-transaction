import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

async function main() {
    console.log(`Starting multi-deployment to ${network.name}...`);
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    const NUM_CONTRACTS = 5;
    const NUM_POOLS = 10;
    const deployedAddresses: string[] = [];

    // Configuration
    const GATEWAY_ADDRESS = "0x0c487a766110c85d301d96e33579c5b317fa4995"; 
    const ZETA_ROUTER_ADDRESS = "0xE283b9Ac87e7e4D0895B8045B6d5d922893693f7"; 
    const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER || "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
    const WZETA = process.env.WZETA || "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";

    let ZetaNativeFactory;
    let LocalStakingFactory;
    let StakingAdapterFactory;
    let isZetaNative = false;

    if (network.name === "zetaTestnet") {
        ZetaNativeFactory = await ethers.getContractFactory("ZetaNativeStaking");
        isZetaNative = true;
    } else if (network.name === "bscTestnet" || network.name === "sepolia") {
        LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
        StakingAdapterFactory = await ethers.getContractFactory("StakingAdapter");
    } else {
        throw new Error(`Unsupported network: ${network.name}`);
    }

    for (let c = 1; c <= NUM_CONTRACTS; c++) {
        console.log(`\n--- Deploying Contract ${c} of ${NUM_CONTRACTS} ---`);
        let staking;
        let adapterAddress = "";
        
        if (isZetaNative) {
            staking = await ZetaNativeFactory.deploy(deployer.address, UNISWAP_ROUTER, WZETA);
            await staking.waitForDeployment();
        } else {
            staking = await LocalStakingFactory.deploy(deployer.address);
            await staking.waitForDeployment();
            
            const localStakingAddress = await staking.getAddress();
            const adapter = await StakingAdapterFactory.deploy(GATEWAY_ADDRESS, ZETA_ROUTER_ADDRESS, localStakingAddress, deployer.address);
            await adapter.waitForDeployment();
            adapterAddress = await adapter.getAddress();
            
            // Authorize the adapter
            const txAuth = await staking.setAdapter(adapterAddress, true);
            await txAuth.wait();
            console.log(`✅ StakingAdapter deployed to: ${adapterAddress} and authorized on LocalStaking.`);
        }
        
        const stakingAddress = await staking.getAddress();
        console.log(`✅ ${isZetaNative ? "ZetaNativeStaking" : "LocalStaking"} ${c} deployed to: ${stakingAddress}`);
        deployedAddresses.push(isZetaNative ? stakingAddress : `${stakingAddress}|${adapterAddress}`);

        console.log(`Configuring pools pre-set in constructor for Contract ${c}...`);

        // Add some basic ZRC20 mappings for ZetaNativeStaking to prevent reverting during testing
        if (isZetaNative) {
            const BSC_TESTNET_ID = 97;
            const SEPOLIA_ID = 11155111;
            const BSC_ZRC20 = "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891";
            const SEPOLIA_ZRC20 = "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0";
            
            let tx = await staking.setChainZRC20(BSC_TESTNET_ID, BSC_ZRC20);
            await tx.wait();
            tx = await staking.setChainZRC20(SEPOLIA_ID, SEPOLIA_ZRC20);
            await tx.wait();
            console.log(`  -> Configured ZRC20 routing for cross-chain payouts.`);
        }
    }

    console.log(`\n=== Deployment Summary for ${network.name} ===`);
    deployedAddresses.forEach((addr, idx) => {
        if (isZetaNative) {
            console.log(`ZetaNativeStaking ${idx + 1}: ${addr}`);
        } else {
            const parts = addr.split('|');
            console.log(`Pair ${idx + 1}: LocalStaking = ${parts[0]} | StakingAdapter = ${parts[1]}`);
        }
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
