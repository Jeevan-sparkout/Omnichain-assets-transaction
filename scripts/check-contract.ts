import { ethers } from "hardhat";

async function main() {
    const local = "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314";
    const code = await ethers.provider.getCode(local);
    console.log("Code length:", code.length);
    if (code === "0x") console.log("CONTRACT DOES NOT EXIST!");
}

main().catch(console.error);
