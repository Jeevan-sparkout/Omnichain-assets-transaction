import { ethers } from "hardhat";

async function main() {
    const ZetaNativeFactory = await ethers.getContractFactory("ZetaNativeStaking");
    const address = "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C";
    const contract = ZetaNativeFactory.attach(address);
    try {
        const pool = await contract.pools(1);
        console.log("Pool 1:", pool);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
main().catch(console.error);
