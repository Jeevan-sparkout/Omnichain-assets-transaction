import { ethers } from "hardhat";

async function main() {
    console.log("Checking Gateway paused status across networks using official addresses...\n");

    const abi = [
        "function paused() external view returns (bool)",
        "function depositPaused() external view returns (bool)"
    ];

    const networks = [
        { name: "Sepolia (Ethereum)", rpc: "https://ethereum-sepolia-rpc.publicnode.com", address: "0x0c487a766110c85d301d96e33579c5b317fa4995" },
        { name: "BSC Testnet", rpc: "https://bsc-testnet-rpc.publicnode.com", address: "0x0c487a766110c85d301d96e33579c5b317fa4995" },
        { name: "Base Sepolia", rpc: "https://base-sepolia-rpc.publicnode.com", address: "0x0c487a766110c85d301d96e33579c5b317fa4995" },
        { name: "Avalanche Fuji", rpc: "https://avalanche-fuji-c-chain-rpc.publicnode.com", address: "0x0dA86Dc3F9B71F84a0E97B0e2291e50B7a5df10f" },
        { name: "Arbitrum Sepolia", rpc: "https://sepolia-rollup.arbitrum.io/rpc", address: "0x0dA86Dc3F9B71F84a0E97B0e2291e50B7a5df10f" },
        { name: "ZetaChain Athens-3 EVM", rpc: "https://zetachain-athens.g.allthatnode.com/archive/evm", address: "0x6c533f7fe93fae114d0954697069df33c9b74fd7" }
    ];

    for (const net of networks) {
        console.log(`Checking ${net.name} at gateway ${net.address}...`);
        try {
            const provider = new ethers.JsonRpcProvider(net.rpc);
            const gateway = new ethers.Contract(net.address, abi, provider);
            
            let pausedStatus = "unknown";
            let depositPausedStatus = "unknown";

            try {
                const isPaused = await gateway.paused();
                pausedStatus = isPaused ? "🚨 PAUSED" : "✅ ACTIVE";
            } catch (e: any) {
                pausedStatus = `error (${e.message.split("\n")[0]})`;
            }

            try {
                const isDepPaused = await gateway.depositPaused();
                depositPausedStatus = isDepPaused ? "🚨 PAUSED" : "✅ ACTIVE";
            } catch (e: any) {
                depositPausedStatus = `error (${e.message.split("\n")[0]})`;
            }

            console.log(`  - paused(): ${pausedStatus}`);
            console.log(`  - depositPaused(): ${depositPausedStatus}`);
        } catch (e: any) {
            console.log(`❌ ${net.name} error: ${e.message}`);
        }
        console.log();
    }
}

main().catch(console.error);
