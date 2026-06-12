import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "BNB");
    
    const StakingAdapterFactory = await ethers.getContractFactory("StakingAdapter");
    
    // Dummy deployment gas
    const GATEWAY_ADDRESS = "0x0c487a766110c85d301d96e33579c5b317fa4995"; 
    const ZETA_ROUTER_ADDRESS = "0xE283b9Ac87e7e4D0895B8045B6d5d922893693f7"; 
    const localStakingAddress = "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314";
    
    const adapterDeployTx = await StakingAdapterFactory.getDeployTransaction(GATEWAY_ADDRESS, ZETA_ROUTER_ADDRESS, localStakingAddress, deployer.address);
    const adapterGas = await ethers.provider.estimateGas(adapterDeployTx);
    console.log("Estimated Gas for 1 Adapter:", adapterGas.toString());
}
main().catch(console.error);
