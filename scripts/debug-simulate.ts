import { ethers } from "hardhat";

async function main() {
    const [owner, user1, zetaRouter] = await ethers.getSigners();
    const MockGatewayFactory = await ethers.getContractFactory("MockGatewayEVM");
    const mockGateway = await MockGatewayFactory.deploy();
    await mockGateway.waitForDeployment();

    const target = user1.address;
    const messageContext = [ ethers.zeroPadValue(zetaRouter.address, 32) ];
    const message = "0x";
    const asset = ethers.ZeroAddress;
    const amount = 100n;

    try {
        await mockGateway.simulateOnCall(target, messageContext, message, asset, amount);
        console.log("Success with array!");
    } catch(e) {
        console.error("Error with array:", e);
    }
}

main().catch(console.error);
