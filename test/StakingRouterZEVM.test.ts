import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("StakingRouterZEVM", function () {
  let stakingRouter: any;
  let mockGateway: any;
  let mockUniswap: any;
  let mockZRC20: any;
  let mockWZETA: any;
  let mockTargetZRC20: any;
  let owner: any, user: any, staker: any;

  const REGISTRY_ADDRESS = "0x7CCE3Eb018bf23e1FE2a32692f2C77592D110394";

  beforeEach(async function () {
    [owner, user, staker] = await ethers.getSigners();

    // 1. Deploy Mocks
    const MockGatewayFactory = await ethers.getContractFactory("MockGatewayZEVM");
    mockGateway = await MockGatewayFactory.deploy();

    const MockUniswapFactory = await ethers.getContractFactory("MockUniswapV2Router02");
    mockUniswap = await MockUniswapFactory.deploy();

    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockZRC20 = await MockERC20Factory.deploy("Source ZRC20", "SRC");
    mockTargetZRC20 = await MockERC20Factory.deploy("Target ZRC20", "TGT");
    mockWZETA = await MockERC20Factory.deploy("Wrapped ZETA", "WZETA");

    // 2. Mock the Registry at the hardcoded address
    const MockRegistryFactory = await ethers.getContractFactory("MockRegistry");
    const mockRegistryImpl = await MockRegistryFactory.deploy();
    
    // Copy the code of the deployed MockRegistry to the hardcoded REGISTRY_ADDRESS
    const registryCode = await ethers.provider.getCode(await mockRegistryImpl.getAddress());
    await network.provider.send("hardhat_setCode", [
      REGISTRY_ADDRESS,
      registryCode
    ]);

    // Instantiate a contract object pointing to the hardcoded address
    const mockRegistry = await ethers.getContractAt("MockRegistry", REGISTRY_ADDRESS);
    // Set the GatewayZEVM address in the registry so UniversalContract constructor can fetch it
    await mockRegistry.setGatewayZEVM(await mockGateway.getAddress());
    
    const readGateway = await mockRegistry.gatewayZEVM();
    console.log("MockRegistry read back gatewayZEVM:", readGateway);

    // 3. Deploy StakingRouterZEVM
    const StakingRouterFactory = await ethers.getContractFactory("StakingRouterZEVM");
    stakingRouter = await StakingRouterFactory.deploy(
      owner.address,
      await mockUniswap.getAddress(),
      await mockWZETA.getAddress()
    );

    // 4. Configure StakingRouterZEVM
    const TARGET_CHAIN_ID = 5; // Goerli / Sepolia
    const TARGET_CONTRACT_ADDR = ethers.hexlify(ethers.randomBytes(20)); // Simulated staking contract on edge chain
    
    await stakingRouter.setTargetContract(TARGET_CHAIN_ID, TARGET_CONTRACT_ADDR);
    await stakingRouter.setChainZRC20(TARGET_CHAIN_ID, await mockTargetZRC20.getAddress());

    mockGateway.on("ErrorString", (reason: string) => {
      console.log("MockGateway ErrorString:", reason);
    });
    mockGateway.on("ErrorBytes", (reason: any) => {
      console.log("MockGateway ErrorBytes:", reason);
    });
  });

  describe("Routing logic", function () {
    it("Should route a stake to the target chain (No swap needed)", async function () {
      const TARGET_CHAIN_ID = 5;
      const stakeAmount = ethers.parseEther("10");

      // Encode stake message
      const abiCoder = new ethers.AbiCoder();
      const message = abiCoder.encode(
        ["uint8", "address", "uint256", "address", "uint256"],
        [1, staker.address, TARGET_CHAIN_ID, await mockTargetZRC20.getAddress(), stakeAmount]
      );

      const messageContext = {
          sender: "0x",
          senderEVM: ethers.ZeroAddress,
          chainID: 1 // Source chain
      };

      // Mint to mockGateway so it can simulate "transfer before onCall"
      await mockTargetZRC20.mint(await mockGateway.getAddress(), stakeAmount);

      await expect(
        mockGateway.simulateOnCall(
          await stakingRouter.getAddress(),
          messageContext,
          await mockTargetZRC20.getAddress(), // zrc20 matches targetToken
          stakeAmount,
          message
        )
      ).to.emit(stakingRouter, "RoutedStake")
        .withArgs(staker.address, TARGET_CHAIN_ID, await mockTargetZRC20.getAddress(), stakeAmount);
    });

    it("Should swap and route a stake to the target chain (Swap needed)", async function () {
        const TARGET_CHAIN_ID = 5;
        const stakeAmount = ethers.parseEther("10");
  
        // Encode stake message
        const abiCoder = new ethers.AbiCoder();
        const message = abiCoder.encode(
          ["uint8", "address", "uint256", "address", "uint256"],
          [1, staker.address, TARGET_CHAIN_ID, await mockZRC20.getAddress(), stakeAmount]
        );
  
        const messageContext = {
            sender: "0x",
            senderEVM: ethers.ZeroAddress,
            chainID: 1 
        };
  
        await mockZRC20.mint(await mockGateway.getAddress(), stakeAmount);
        
        // When swapping, the router needs target tokens to give back to the contract
        await mockTargetZRC20.mint(await mockUniswap.getAddress(), stakeAmount);
  
        await expect(
          mockGateway.simulateOnCall(
            await stakingRouter.getAddress(),
            messageContext,
            await mockZRC20.getAddress(), // incoming token
            stakeAmount,
            message
          )
        ).to.emit(stakingRouter, "SwappedTokens")
         .to.emit(stakingRouter, "RoutedStake")
          .withArgs(staker.address, TARGET_CHAIN_ID, await mockTargetZRC20.getAddress(), stakeAmount);
    });

    it("Should handle an incoming withdraw and route it (No swap needed)", async function () {
        const TARGET_CHAIN_ID = 5;
        const withdrawAmount = ethers.parseEther("5");
  
        // Encode withdraw message
        const abiCoder = new ethers.AbiCoder();
        const message = abiCoder.encode(
          ["uint8", "address", "uint256", "address", "uint256"],
          [2, staker.address, TARGET_CHAIN_ID, await mockTargetZRC20.getAddress(), withdrawAmount]
        );
  
        const messageContext = {
            sender: "0x",
            senderEVM: ethers.ZeroAddress,
            chainID: 1 
        };
  
        await mockTargetZRC20.mint(await mockGateway.getAddress(), withdrawAmount);
  
        await expect(
          mockGateway.simulateOnCall(
            await stakingRouter.getAddress(),
            messageContext,
            await mockTargetZRC20.getAddress(),
            withdrawAmount,
            message
          )
        ).to.emit(stakingRouter, "RoutedWithdraw")
          .withArgs(staker.address, TARGET_CHAIN_ID, await mockTargetZRC20.getAddress(), withdrawAmount);
    });
  });
});
