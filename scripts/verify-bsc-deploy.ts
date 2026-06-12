import { ethers } from "hardhat";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://bsc-testnet-dataseed.bnbchain.org");
    const contracts = [
        "0xEB9CF75B2f032d4cC4A122F814cB73f95618e314",
        "0x7CB465aC74B2Feae06cE78e6dC2395a165445353",
        "0x3F46E4CD9375B92112EC12c7C5580B522250A77A",
        "0xF6e4Db7106593B924b6b93bd3E765d28Fe161F0F",
        "0x98A346F40AA9b3c483070EC9cE4a6dE4A6C0d67A"
    ];

    const LocalStakingAbi = [
        "function owner() view returns (address)",
        "function isAdapter(address) view returns (bool)",
        "function pools(uint256) view returns (address token, uint256 apy, uint256 lockDuration, bool active)"
    ];

    for (let i = 0; i < contracts.length; i++) {
        const addr = contracts[i];
        console.log(`\nChecking contract ${i + 1}: ${addr}`);
        try {
            const contract = new ethers.Contract(addr, LocalStakingAbi, provider);
            const owner = await contract.owner();
            console.log(`Owner: ${owner}`);
            const pool1 = await contract.pools(1);
            console.log(`Pool 1: token=${pool1.token}, apy=${pool1.apy}, lock=${pool1.lockDuration}, active=${pool1.active}`);
        } catch (e: any) {
            console.error(`Error querying ${addr}: ${e.message}`);
        }
    }
}

main().catch(console.error);
