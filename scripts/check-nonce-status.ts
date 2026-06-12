import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    // Check nonce on BSC Testnet
    const providerBsc = new ethers.JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");
    const countBsc = await providerBsc.getTransactionCount(deployer.address, "latest");
    const pendingCountBsc = await providerBsc.getTransactionCount(deployer.address, "pending");
    console.log(`BSC Testnet Nonce - Latest: ${countBsc}, Pending: ${pendingCountBsc}`);
    
    const feeData = await providerBsc.getFeeData();
    console.log("BSC Testnet Gas Price:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");
}

main().catch(console.error);
