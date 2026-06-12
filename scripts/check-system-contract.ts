import { ethers } from "hardhat";

async function main() {
    console.log("Querying SystemContract on ZetaChain Testnet for ZRC-20 gas tokens...\n");

    const SYSTEM_CONTRACT_ADDRESS = "0xEdf1c3275d13489aCdC6cD6eD246E72458B8795B";

    const abi = [
        "function gasCoinZRC20ByChainId(uint256 chainID) external view returns (address)"
    ];

    // Using zetaTestnet provider from hardhat.config.ts
    const provider = new ethers.JsonRpcProvider("https://zetachain-athens.g.allthatnode.com/archive/evm");
    const systemContract = new ethers.Contract(SYSTEM_CONTRACT_ADDRESS, abi, provider);

    const chainsToCheck = [
        { name: "Base Sepolia", id: 84532 },
        { name: "Avalanche Fuji", id: 43113 },
        { name: "Arbitrum Sepolia", id: 421614 },
        { name: "Solana Devnet", id: 901 }, // Known ZetaChain ID for Solana Devnet
        { name: "TON Testnet", id: 1111 },  // We will try standard mock IDs if unknown, or just use 0x0
        { name: "SUI Testnet", id: 104 }    // Usually 104 or similar, but let's just query EVMs + Solana
    ];

    for (const chain of chainsToCheck) {
        try {
            const zrc20Address = await systemContract.gasCoinZRC20ByChainId(chain.id);
            if (zrc20Address && zrc20Address !== "0x0000000000000000000000000000000000000000") {
                console.log(`✅ ${chain.name} (Chain ID: ${chain.id}) is ACTIVE.`);
                console.log(`   ZRC-20 Gas Token Address: ${zrc20Address}\n`);
            } else {
                console.log(`❌ ${chain.name} (Chain ID: ${chain.id}): Not active or no gas token registered.\n`);
            }
        } catch (e: any) {
             console.log(`⚠️ ${chain.name} (Chain ID: ${chain.id}): Error querying - ${e.message}\n`);
        }
    }
}

main().catch(console.error);
