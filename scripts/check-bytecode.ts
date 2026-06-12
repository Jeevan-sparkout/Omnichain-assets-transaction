import { ethers } from "hardhat";

async function main() {
    const local = "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314";
    const code = await ethers.provider.getCode(local);
    const factory = await ethers.getContractFactory("LocalStaking");
    console.log("Deployed code starts with:", code.slice(0, 100));
    console.log("Expected code starts with:", factory.bytecode.slice(0, 100));
}

main().catch(console.error);
