import { ethers } from "hardhat";

async function main() {
    const key1 = "8035cbd2d3840833b853f7168c657db217830a972e8ec5c827b3ca2b819e5859";
    const key2 = "936cd756dcf05d3e61bacd45dc5cd532d35ae98e7a0d7bffe8cb0f9a149fbaee";
    
    const rpczeta = "https://zetachain-athens.g.allthatnode.com/archive/evm";
    const rpcsepolia = "https://ethereum-sepolia-rpc.publicnode.com";
    const rpcbsc = "https://bsc-testnet-rpc.publicnode.com";
    
    const provZeta = new ethers.JsonRpcProvider(rpczeta);
    const provSepolia = new ethers.JsonRpcProvider(rpcsepolia);
    const provBsc = new ethers.JsonRpcProvider(rpcbsc);
    
    const wallet1 = new ethers.Wallet(key1);
    const wallet2 = new ethers.Wallet(key2);
    
    console.log("=== Key 1:", wallet1.address, "===");
    console.log("ZetaChain Balance:", ethers.formatEther(await provZeta.getBalance(wallet1.address)), "ZETA");
    console.log("Sepolia Balance:", ethers.formatEther(await provSepolia.getBalance(wallet1.address)), "ETH");
    console.log("BSC Testnet Balance:", ethers.formatEther(await provBsc.getBalance(wallet1.address)), "BNB");
    
    console.log("\n=== Key 2:", wallet2.address, "===");
    console.log("ZetaChain Balance:", ethers.formatEther(await provZeta.getBalance(wallet2.address)), "ZETA");
    console.log("Sepolia Balance:", ethers.formatEther(await provSepolia.getBalance(wallet2.address)), "ETH");
    console.log("BSC Testnet Balance:", ethers.formatEther(await provBsc.getBalance(wallet2.address)), "BNB");
}

main().catch(console.error);
