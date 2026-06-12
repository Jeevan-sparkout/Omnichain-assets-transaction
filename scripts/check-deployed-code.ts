import { ethers } from "hardhat";

async function main() {
    const rpcBsc = "https://bsc-testnet-rpc.publicnode.com";
    const rpcSepolia = "https://ethereum-sepolia-rpc.publicnode.com";
    const rpcZeta = "https://zetachain-athens.g.allthatnode.com/archive/evm";
    
    const provBsc = new ethers.JsonRpcProvider(rpcBsc);
    const provSepolia = new ethers.JsonRpcProvider(rpcSepolia);
    const provZeta = new ethers.JsonRpcProvider(rpcZeta);
    
    // BSC Addresses in bsc-deploy.log
    const bscAddresses = [
        "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
        "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
        "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
        "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
        "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A"
    ];
    
    console.log("=== Checking BSC Testnet Addresses ===");
    for (const addr of bscAddresses) {
        const code = await provBsc.getCode(addr);
        console.log(`${addr}: ${code !== "0x" ? "✅ Contract" : "❌ No code"}`);
    }
    
    // Zeta Addresses in Agent_Project_Reference.md
    const zetaAddresses = [
        "0xb8543ab22a1bDC321636C5542cB4b7df1b6BCC7C",
        "0x89a801ff88A30DFF80b2Fee01DEeC43791827C54",
        "0x09D2Df121c6B85b5536a58Af659E0Fee4a2b3701",
        "0x79C7aE287Cca853B31B17205cA690f0A7e6831B4",
        "0xD6E138Fb0cb91a233CE756Be37E4aFE5369D3a51"
    ];
    
    console.log("\n=== Checking ZetaChain Testnet Addresses ===");
    for (const addr of zetaAddresses) {
        const code = await provZeta.getCode(addr);
        console.log(`${addr}: ${code !== "0x" ? "✅ Contract" : "❌ No code"}`);
    }
}

main().catch(console.error);
