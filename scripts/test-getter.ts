import { ethers } from "hardhat";

async function main() {
    const local = "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314";
    const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
    const stakingContract = LocalStakingFactory.attach(local) as any;
    
    console.log("Pool 1:", await stakingContract.pools(1));
}

main().catch(console.error);
