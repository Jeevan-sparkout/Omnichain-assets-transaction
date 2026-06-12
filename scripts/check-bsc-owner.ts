import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);
    
    const local = "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314";
    const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
    const stakingContract = LocalStakingFactory.attach(local) as any;
    
    const owner = await stakingContract.owner();
    console.log("Contract owner:", owner);
    console.log("Is deployer owner?", owner === deployer.address);
}

main().catch(console.error);
