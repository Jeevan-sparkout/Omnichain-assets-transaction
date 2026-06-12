import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log(`Starting deployment of ZetaNativeStaking to ${network.name}...`);

    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);

    const initialOwner = deployer.address;
    const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER || "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
    const WZETA = process.env.WZETA || "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";

    // Deploy ZetaNativeStaking
    const StakingFactory = await ethers.getContractFactory("ZetaNativeStaking");
    const staking = await StakingFactory.deploy(initialOwner, UNISWAP_ROUTER, WZETA);
    await staking.waitForDeployment();
    
    const stakingAddress = await staking.getAddress();
    console.log(`\n✅ ZetaNativeStaking deployed successfully to: ${stakingAddress}`);

    // Set ZRC20 mappings (example mappings for testnets)
    console.log(`\nSetting up ZRC20 target chains...`);
    const BSC_TESTNET_ID = 97;
    const SEPOLIA_ID = 11155111;
    const BSC_ZRC20 = "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891"; // BNB ZRC20 on Athens3
    const SEPOLIA_ZRC20 = "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0"; // ETH ZRC20 on Athens3
    
    let tx = await staking.setChainZRC20(BSC_TESTNET_ID, BSC_ZRC20);
    await tx.wait();
    tx = await staking.setChainZRC20(SEPOLIA_ID, SEPOLIA_ZRC20);
    await tx.wait();
    console.log(`✅ ZRC20 mappings configured`);

    // Set up a default ZETA pool (Address Zero)
    console.log(`\nConfiguring native ZETA staking pool 1...`);
    tx = await staking.setPoolConfig(1, ethers.ZeroAddress, 500, 86400, true);
    await tx.wait();
    console.log(`✅ Pool 1 configuration updated for native ZETA`);
    console.log(`- APY: 5%`);
    console.log(`- Lock Duration: 1 Day`);

    console.log(`\nConfiguring native ZETA staking pool 2...`);
    tx = await staking.setPoolConfig(2, ethers.ZeroAddress, 1000, 604800, true);
    await tx.wait();
    console.log(`✅ Pool 2 configuration updated for native ZETA`);
    console.log(`- APY: 10%`);
    console.log(`- Lock Duration: 7 Days`);



    console.log(`\nDeployment and configuration complete!`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
