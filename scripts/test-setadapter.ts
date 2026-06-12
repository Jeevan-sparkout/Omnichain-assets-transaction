import { ethers } from "hardhat";

async function main() {
    const local = "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314";
    const adapterAddress = "0x5d68c090870c914ee605e4be2cd8308b5d34a5d8";
    const [deployer] = await ethers.getSigners();
    
    const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
    const stakingContract = LocalStakingFactory.attach(local) as any;

    console.log("Owner is:", await stakingContract.owner());
    console.log("Deployer is:", deployer.address);
    console.log("Estimating gas for setAdapter...");
    
    try {
        const gas = await stakingContract.setAdapter.estimateGas(adapterAddress, true);
        console.log("Estimated gas:", gas.toString());
    } catch (e) {
        console.error("Gas estimation failed:", e);
    }
}

main().catch(console.error);
