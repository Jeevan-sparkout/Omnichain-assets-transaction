import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log(`Starting deployment of MockUSDC to ${network.name}...`);

    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);

    const TokenFactory = await ethers.getContractFactory("MockERC20");
    // Mint 1,000,000 USDC initially
    const initialSupply = ethers.parseUnits("1000000", 6);
    
    // We pass "USD Coin", "USDC" based on the constructor: name, symbol
    const token = await TokenFactory.deploy("USD Coin Mock", "USDC");
    await token.waitForDeployment();
    
    const tokenAddress = await token.getAddress();
    console.log(`\n✅ MockUSDC deployed successfully to: ${tokenAddress}`);

    // Mint some initial tokens to the deployer
    console.log("Minting initial supply to deployer...");
    const tx = await token.mint(deployer.address, initialSupply);
    await tx.wait();
    console.log(`✅ Minted 1,000,000 USDC to ${deployer.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
