import { ethers } from "hardhat";

async function main() {
    const txHash = "0x16d47f528fbf12a57acdb4beab0a6daca27944ab9fd73d1d448dd4e4ef90ceac";
    const tx = await ethers.provider.getTransaction(txHash);
    console.log("Transaction:", tx?.hash);
    console.log("To:", tx?.to);
    
    if (tx) {
        try {
            await ethers.provider.call(tx);
            console.log("Call successful");
        } catch (e: any) {
            console.log("Revert reason:", e.data ? await ethers.provider.call(tx) : e);
        }
    }
}

main().catch(console.error);
