import { ethers } from "hardhat";

async function main() {
    const pk1 = "936cd756dcf05d3e61bacd45dc5cd532d35ae98e7a0d7bffe8cb0f9a149fbaee";
    const pk2 = "8035cbd2d3840833b853f7168c657db217830a972e8ec5c827b3ca2b819e5859";
    
    const w1 = new ethers.Wallet(pk1, ethers.provider);
    const w2 = new ethers.Wallet(pk2, ethers.provider);
    
    const bal1 = await ethers.provider.getBalance(w1.address);
    const bal2 = await ethers.provider.getBalance(w2.address);
    
    console.log("Wallet 1 (", w1.address, ") Balance:", ethers.formatEther(bal1));
    console.log("Wallet 2 (", w2.address, ") Balance:", ethers.formatEther(bal2));
}
main().catch(console.error);
