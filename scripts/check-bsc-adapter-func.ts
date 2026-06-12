import { ethers } from "hardhat";

async function main() {
    const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
    const contract = LocalStakingFactory.attach("0xEB9CF75B2f032d4cC4A122F814cB73f95618e314");
    try {
        const tx = await contract.setAdapter.populateTransaction("0x144be9cE96Ee27881C3CCe0325794671eFEa620C", true);
        console.log("Populated:", tx);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
main().catch(console.error);
