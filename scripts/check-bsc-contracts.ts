import { ethers } from "hardhat";

async function main() {
    const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
    const address = "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314";
    const contract = LocalStakingFactory.attach(address);
    try {
        const pool = await contract.pools(1);
        console.log("Pool 1:", pool);
        const owner = await contract.owner();
        console.log("Owner:", owner);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
main().catch(console.error);
