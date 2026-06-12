import { ethers } from "hardhat";

async function main() {
    const feeData = await ethers.provider.getFeeData();
    console.log("Gas Price:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");
}
main().catch(console.error);
