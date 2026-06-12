import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CrossChainStaking, MockERC20, MockGatewayEVM } from "../typechain-types";

describe("CrossChainStaking", function () {
  let crossChainStaking: CrossChainStaking;
  let mockERC20: MockERC20;
  let mockGateway: MockGatewayEVM;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let zetaRouter: SignerWithAddress; // Use an EOA as the trusted zetaRouter for testing onCall
  const TARGET_CHAIN_ID = 7000;

  beforeEach(async function () {
    [owner, user1, zetaRouter] = await ethers.getSigners();

    // Deploy Mock ERC20
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20Factory.deploy("Test Token", "TST");
    await mockERC20.waitForDeployment();

    // Deploy Mock Gateway
    const MockGatewayFactory = await ethers.getContractFactory("MockGatewayEVM");
    mockGateway = await MockGatewayFactory.deploy();
    await mockGateway.waitForDeployment();

    // Deploy CrossChainStaking
    const CrossChainStakingFactory = await ethers.getContractFactory("CrossChainStaking");
    crossChainStaking = await CrossChainStakingFactory.deploy(
      await mockGateway.getAddress(),
      zetaRouter.address,
      owner.address
    );
    await crossChainStaking.waitForDeployment();

    // Setup supported token
    await crossChainStaking.setPoolConfig(await mockERC20.getAddress(), 1000, 0, true);
    await crossChainStaking.setPoolConfig(ethers.ZeroAddress, 1000, 0, true); // Native gas

    // Mint tokens to user1
    await mockERC20.mint(user1.address, ethers.parseEther("1000"));
  });

  describe("Local Staking", function () {
    it("Should stake native gas token locally", async function () {
      const stakeAmount = ethers.parseEther("1");
      await crossChainStaking.connect(user1).stakeLocal(ethers.ZeroAddress, stakeAmount, { value: stakeAmount });

      expect((await crossChainStaking.stakes(user1.address, ethers.ZeroAddress)).amount).to.equal(stakeAmount);
      expect(await crossChainStaking.totalStaked(ethers.ZeroAddress)).to.equal(stakeAmount);
    });

    it("Should stake ERC20 token locally", async function () {
      const stakeAmount = ethers.parseEther("100");
      const tokenAddr = await mockERC20.getAddress();

      await mockERC20.connect(user1).approve(await crossChainStaking.getAddress(), stakeAmount);
      await crossChainStaking.connect(user1).stakeLocal(tokenAddr, stakeAmount);

      expect((await crossChainStaking.stakes(user1.address, tokenAddr)).amount).to.equal(stakeAmount);
      expect(await crossChainStaking.totalStaked(tokenAddr)).to.equal(stakeAmount);
    });

    it("Should withdraw local native gas token", async function () {
      const stakeAmount = ethers.parseEther("1");
      await crossChainStaking.connect(user1).stakeLocal(ethers.ZeroAddress, stakeAmount, { value: stakeAmount });

      const initialBalance = await ethers.provider.getBalance(user1.address);
      const tx = await crossChainStaking.connect(user1).withdrawLocal(ethers.ZeroAddress, stakeAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.equal(initialBalance + stakeAmount - gasUsed);
    });

    it("Should withdraw local ERC20 token", async function () {
      const stakeAmount = ethers.parseEther("100");
      const tokenAddr = await mockERC20.getAddress();

      await mockERC20.connect(user1).approve(await crossChainStaking.getAddress(), stakeAmount);
      await crossChainStaking.connect(user1).stakeLocal(tokenAddr, stakeAmount);

      const initialBalance = await mockERC20.balanceOf(user1.address);
      await crossChainStaking.connect(user1).withdrawLocal(tokenAddr, stakeAmount);
      
      expect(await mockERC20.balanceOf(user1.address)).to.equal(initialBalance + stakeAmount);
    });
  });

  describe("Cross-Chain Staking", function () {
    it("Should initiate cross-chain stake with ERC20", async function () {
      const stakeAmount = ethers.parseEther("100");
      const tokenAddr = await mockERC20.getAddress();

      await mockERC20.connect(user1).approve(await crossChainStaking.getAddress(), stakeAmount);
      
      await expect(
        crossChainStaking.connect(user1).stakeCrossChain(tokenAddr, TARGET_CHAIN_ID, stakeAmount)
      )
        .to.emit(crossChainStaking, "CrossChainStakeInitiated")
        .withArgs(user1.address, TARGET_CHAIN_ID, tokenAddr, stakeAmount)
        .and.to.emit(mockGateway, "DepositedAndCalled");

      // Verify tokens are in MockGateway (they were deposited)
      expect(await mockERC20.balanceOf(await mockGateway.getAddress())).to.equal(stakeAmount);
    });

    it("Should initiate cross-chain stake with Native token", async function () {
      const stakeAmount = ethers.parseEther("1");

      await expect(
        crossChainStaking.connect(user1).stakeCrossChain(ethers.ZeroAddress, TARGET_CHAIN_ID, stakeAmount, { value: stakeAmount })
      )
        .to.emit(crossChainStaking, "CrossChainStakeInitiated")
        .withArgs(user1.address, TARGET_CHAIN_ID, ethers.ZeroAddress, stakeAmount)
        .and.to.emit(mockGateway, "DepositedAndCalled");

      expect(await ethers.provider.getBalance(await mockGateway.getAddress())).to.equal(stakeAmount);
    });

    it("Should initiate cross-chain withdraw", async function () {
      // Stake locally first
      const stakeAmount = ethers.parseEther("100");
      const tokenAddr = await mockERC20.getAddress();

      await mockERC20.connect(user1).approve(await crossChainStaking.getAddress(), stakeAmount);
      await crossChainStaking.connect(user1).stakeLocal(tokenAddr, stakeAmount);

      // Now withdraw cross chain
      await expect(
        crossChainStaking.connect(user1).withdrawCrossChain(tokenAddr, TARGET_CHAIN_ID, stakeAmount)
      )
        .to.emit(crossChainStaking, "CrossChainWithdrawInitiated")
        .withArgs(user1.address, TARGET_CHAIN_ID, tokenAddr, stakeAmount)
        .and.to.emit(mockGateway, "DepositedAndCalled");

      // Local balances should be 0
      expect((await crossChainStaking.stakes(user1.address, tokenAddr)).amount).to.equal(0);
    });
  });

  describe("Incoming ZetaChain Calls (onCall)", function () {
    it("Should handle incoming stake message via onCall", async function () {
      const stakeAmount = ethers.parseEther("100");
      const tokenAddr = await mockERC20.getAddress();
      const stakerAddr = user1.address;
      
      // Mock StakingMessages.encodeStake manually or via a helper. 
      // ACTION_STAKE = 1
      const action = 1;
      const message = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint8", "address", "uint256", "address", "uint256"],
        [action, stakerAddr, TARGET_CHAIN_ID, tokenAddr, stakeAmount]
      );

      const messageContext = [
        zetaRouter.address
      ];

      // Fund MockGateway with tokens so it can simulate "transfer before onCall"
      await mockERC20.mint(await mockGateway.getAddress(), stakeAmount);

      // We call simulateOnCall on MockGateway to trigger the onCall
      await mockGateway.simulateOnCall(
        await crossChainStaking.getAddress(),
        messageContext,
        message,
        tokenAddr,
        stakeAmount
      );

      // It should have credited the balance
      expect((await crossChainStaking.stakes(stakerAddr, tokenAddr)).amount).to.equal(stakeAmount);
    });

    it("Should handle incoming withdraw message via onCall (ERC20)", async function () {
      const withdrawAmount = ethers.parseEther("100");
      const tokenAddr = await mockERC20.getAddress();
      const userAddr = user1.address;

      const action = 2; // ACTION_WITHDRAW
      const message = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint8", "address", "uint256", "address", "uint256"],
        [action, userAddr, TARGET_CHAIN_ID, tokenAddr, withdrawAmount]
      );

      const messageContext = [
        zetaRouter.address
      ];

      await mockERC20.mint(await mockGateway.getAddress(), withdrawAmount);

      const initialUserBalance = await mockERC20.balanceOf(userAddr);

      await mockGateway.simulateOnCall(
        await crossChainStaking.getAddress(),
        messageContext,
        message,
        tokenAddr,
        withdrawAmount
      );

      const finalUserBalance = await mockERC20.balanceOf(userAddr);
      expect(finalUserBalance).to.equal(initialUserBalance + withdrawAmount);
    });
    
    it("Should handle incoming withdraw message via onCall (Native)", async function () {
      const withdrawAmount = ethers.parseEther("1");
      const userAddr = user1.address;

      const action = 2; // ACTION_WITHDRAW
      const message = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint8", "address", "uint256", "address", "uint256"],
        [action, userAddr, TARGET_CHAIN_ID, ethers.ZeroAddress, withdrawAmount]
      );

      const messageContext = [
        zetaRouter.address
      ];

      // Simulate onCall by directly sending ETH
      const initialUserBalance = await ethers.provider.getBalance(userAddr);

      await mockGateway.simulateOnCall(
        await crossChainStaking.getAddress(),
        messageContext,
        message,
        ethers.ZeroAddress,
        withdrawAmount,
        { value: withdrawAmount }
      );

      const finalUserBalance = await ethers.provider.getBalance(userAddr);
      expect(finalUserBalance).to.equal(initialUserBalance + withdrawAmount);
    });
  });

  describe("Handling Reverts (onRevert)", function () {
    it("Should restore tokens to user when a stakeCrossChain reverts", async function () {
      const stakeAmount = ethers.parseEther("100");
      const tokenAddr = await mockERC20.getAddress();

      const action = 1; // ACTION_STAKE
      const message = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint8", "address", "uint256", "address", "uint256"],
        [action, user1.address, TARGET_CHAIN_ID, tokenAddr, stakeAmount]
      );

      // Gateway calls onRevert directly. Let's act as gateway.
      const revertContext = [
        user1.address,
        tokenAddr,
        stakeAmount,
        message
      ];

      // Send tokens to CrossChainStaking first (simulate refund from gateway)
      await mockERC20.mint(await crossChainStaking.getAddress(), stakeAmount);

      // Assuming gateway calls onRevert
      // But we need to use a mocked gateway or Prank. Hardhat connect(impersonate) 
      // or we just call it using impersonation.
      await ethers.provider.send("hardhat_impersonateAccount", [await mockGateway.getAddress()]);
      const gatewaySigner = await ethers.getSigner(await mockGateway.getAddress());

      // We must fund the gatewaySigner with ETH to pay for gas
      await owner.sendTransaction({ to: gatewaySigner.address, value: ethers.parseEther("1") });

      const initialUserBalance = await mockERC20.balanceOf(user1.address);

      await crossChainStaking.connect(gatewaySigner).onRevert(revertContext);

      const finalUserBalance = await mockERC20.balanceOf(user1.address);
      expect(finalUserBalance).to.equal(initialUserBalance + stakeAmount);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [await mockGateway.getAddress()]);
    });

    it("Should restore local balance when withdrawCrossChain reverts", async function () {
      const withdrawAmount = ethers.parseEther("100");
      const tokenAddr = await mockERC20.getAddress();

      const action = 2; // ACTION_WITHDRAW
      const message = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint8", "address", "uint256", "address", "uint256"],
        [action, user1.address, TARGET_CHAIN_ID, tokenAddr, withdrawAmount]
      );

      const revertContext = [
        user1.address,
        tokenAddr,
        withdrawAmount,
        message
      ];

      await ethers.provider.send("hardhat_impersonateAccount", [await mockGateway.getAddress()]);
      const gatewaySigner = await ethers.getSigner(await mockGateway.getAddress());
      await owner.sendTransaction({ to: gatewaySigner.address, value: ethers.parseEther("1") });

      await crossChainStaking.connect(gatewaySigner).onRevert(revertContext);

      expect((await crossChainStaking.stakes(user1.address, tokenAddr)).amount).to.equal(withdrawAmount);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [await mockGateway.getAddress()]);
    });
  });
});
