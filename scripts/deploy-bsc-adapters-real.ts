import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const StakingAdapterFactory = await ethers.getContractFactory("StakingAdapter");
    const LocalStakingFactory = await ethers.getContractFactory("LocalStaking");
    
    const GATEWAY_ADDRESS = "0x0c487a766110c85d301d96e33579c5b317fa4995"; 
    const ZETA_ROUTER_ADDRESS = "0xE283b9Ac87e7e4D0895B8045B6d5d922893693f7"; 
    
    const localStakings = [
        "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
        "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
        "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
        "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
        "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A"
    ];

    let results = [];

    for (let i = 0; i < localStakings.length; i++) {
        const local = localStakings[i];
        console.log(`Deploying adapter for LocalStaking ${i+1}: ${local}...`);
        
        try {
            const adapter = await StakingAdapterFactory.deploy(
                GATEWAY_ADDRESS, 
                ZETA_ROUTER_ADDRESS, 
                local, 
                deployer.address,
                { gasLimit: 2000000, gasPrice: 1500000000 } // 1.5 gwei
            );
            await adapter.waitForDeployment();
            const adapterAddress = await adapter.getAddress();
            console.log(`✅ Adapter deployed at: ${adapterAddress}`);
            
            const stakingContract = LocalStakingFactory.attach(local);
            const tx = await stakingContract.setAdapter(adapterAddress, true, { gasLimit: 100000, gasPrice: 1500000000 });
            await tx.wait();
            console.log(`✅ Authorized adapter on LocalStaking`);
            
            results.push(`${local}|${adapterAddress}`);
        } catch (e) {
            console.error(`Failed on contract ${i+1}:`, e);
        }
    }

    fs.writeFileSync("bsc-adapters.json", JSON.stringify(results, null, 2));
}

main().catch(console.error);
