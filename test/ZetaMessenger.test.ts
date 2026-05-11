import { expect } from "chai";
import { ethers } from "hardhat";

describe("ZetaMessenger", function () {
  it("stores the gateway address", async function () {
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ZetaMessenger");
    const contract = await factory.deploy(owner.address, owner.address);
    await contract.waitForDeployment();

    expect(await contract.gateway()).to.equal(owner.address);
  });
});
