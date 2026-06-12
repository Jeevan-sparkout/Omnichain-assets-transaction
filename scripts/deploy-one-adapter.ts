import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const StakingAdapterFactory = await ethers.getContractFactory("StakingAdapter");
    const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
    
    const GATEWAY_ADDRESS = "0x0c487a766110c85d301d96e33579c5b317fa4995"; 
    const ZETA_ROUTER_ADDRESS = "0xE283b9Ac87e7e4D0895B8045B6d5d922893693f7"; 
    
    const local = "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314";

    console.log(`Deploying adapter for LocalStaking: ${local}...`);
        
    try {
        const adapter = await StakingAdapterFactory.deploy(
            GATEWAY_ADDRESS, 
            ZETA_ROUTER_ADDRESS, 
            local, 
            deployer.address,
            { gasLimit: 2000000, gasPrice: 1500000000 }
        );
        await adapter.waitForDeployment();
        const adapterAddress = await adapter.getAddress();
        console.log(`✅ Adapter deployed at: ${adapterAddress}`);
        
        const stakingContract = LocalStakingFactory.attach(local) as any;
        console.log(`Authorizing adapter...`);
        const tx = await stakingContract.setAdapter(adapterAddress, true, { gasLimit: 100000, gasPrice: 1500000000 });
        await tx.wait();
        console.log(`✅ Authorized adapter on LocalStaking`);
    } catch (e) {
        console.error(`Failed on contract:`, e);
    }
}

main().catch(console.error);
