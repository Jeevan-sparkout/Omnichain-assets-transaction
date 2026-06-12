import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const config: Record<string, { staking: string; usdc: string; type: string }> = {
    sepolia: {
        staking: "0x9A46B4092fdBdfe6C66b2332813EAC53D1772421",
        usdc: "0xfe692abffa23D2ffAb6C0591692347510D98dF3f",
        type: "CrossChainStaking"
    },
    bscTestnet: {
        staking: "0x0CA440CFFE824A95dd7414E17d3792817D3ACEdf",
        usdc: "0x21256efE77e24a9F5B1e0c28759A3e26F3fb990D",
        type: "CrossChainStaking"
    },
    zetaTestnet: {
        staking: "0xB00Aa51D0b175e5295c608C7550C57dca82C7CCB",
        usdc: "0xF39D31eF9d971Ccaf7473493EFe4846A3aEE745A",
        type: "ZetaNativeStaking"
    }
};

async function main() {
    console.log(`Configuring USDC pool on ${network.name}...`);
    const envConfig = config[network.name];
    if (!envConfig) {
        throw new Error(`Network ${network.name} not configured.`);
    }

    const [deployer] = await ethers.getSigners();
    const StakingContract = await ethers.getContractAt(envConfig.type, envConfig.staking, deployer);

    // 8% APY, 1 day lock
    const apy = 800; 
    const lockDuration = 86400; 

    console.log(`Setting pool config for USDC ${envConfig.usdc} on contract ${envConfig.staking}...`);
    const tx = await StakingContract.setPoolConfig(envConfig.usdc, apy, lockDuration, true);
    await tx.wait();

    console.log(`✅ USDC Pool successfully configured on ${network.name}!`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
