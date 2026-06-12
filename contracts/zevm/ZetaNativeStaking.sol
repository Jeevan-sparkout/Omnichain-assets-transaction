// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {UniversalContract, MessageContext} from "@zetachain/protocol-contracts/contracts/zevm/interfaces/UniversalContract.sol";
import {RevertContext, RevertOptions} from "@zetachain/protocol-contracts/contracts/Revert.sol";

interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
}

/**
 * @title ZetaNativeStaking
 * @dev Deployed on ZetaChain (zEVM).
 * A standalone staking contract that natively accepts ZETA or ZRC-20 deposits.
 */
contract ZetaNativeStaking is UniversalContract, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct PoolConfig {
        address token;        // address(0) for native ZETA
        uint256 apy;          // e.g., 1000 for 10.00%
        uint256 lockDuration; // in seconds
        bool active;
    }

    struct StakeInfo {
        uint256 amount;
        uint256 stakeTime;
        uint256 lastClaimTime;
    }

    // Mapping of poolId to PoolConfig
    mapping(uint256 => PoolConfig) public pools;

    // User Balances: user => poolId => StakeInfo
    mapping(address => mapping(uint256 => StakeInfo)) public stakes;
    mapping(uint256 => uint256) public totalStaked;

    IUniswapV2Router02 public immutable uniswapRouter;
    address public immutable wZeta;
    mapping(uint256 => address) public chainToZRC20;

    event Staked(address indexed user, uint256 indexed poolId, address token, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed poolId, address token, uint256 amount);
    event RewardClaimed(address indexed user, uint256 indexed poolId, address token, uint256 amount);
    event PoolUpdated(uint256 indexed poolId, address token, uint256 apy, uint256 lockDuration, bool active);

    error ZeroAmount();
    error InsufficientBalance();
    error PoolNotActive();
    error Locked();
    error NativeTransferFailed();
    error TargetZRC20NotSet();

    constructor(address initialOwner, address _uniswapRouter, address _wZeta) Ownable(initialOwner) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        wZeta = _wZeta;
        pools[1] = PoolConfig(address(0), 500, 60, true);
        pools[2] = PoolConfig(address(0), 1000, 120, true);
        pools[3] = PoolConfig(address(0), 1500, 180, true);
        pools[4] = PoolConfig(address(0), 2000, 240, true);
        pools[5] = PoolConfig(address(0), 2500, 300, true);
        pools[6] = PoolConfig(address(0), 3000, 360, true);
        pools[7] = PoolConfig(address(0), 3500, 420, true);
        pools[8] = PoolConfig(address(0), 4000, 480, true);
        pools[9] = PoolConfig(address(0), 4500, 540, true);
        pools[10] = PoolConfig(address(0), 5000, 600, true);
    }

    receive() external payable {}

    function setChainZRC20(uint256 chainId, address zrc20Address) external onlyOwner {
        chainToZRC20[chainId] = zrc20Address;
    }

    function onCall(
        MessageContext calldata,
        address,
        uint256,
        bytes calldata
    ) external override onlyGateway {}

    /**
     * @dev Configure a staking pool for a specific token.
     * Use address(0) for native ZETA coin.
     */
    function setPoolConfig(uint256 poolId, address token, uint256 apy, uint256 lockDuration, bool active) external onlyOwner {
        pools[poolId] = PoolConfig(token, apy, lockDuration, active);
        emit PoolUpdated(poolId, token, apy, lockDuration, active);
    }

    uint8 constant ACTION_WITHDRAW = 1;
    uint8 constant ACTION_CLAIM = 2;

    function getPendingReward(address user, uint256 poolId) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user][poolId];
        if (userStake.amount == 0) return 0;
        PoolConfig memory config = pools[poolId];
        uint256 startTime = userStake.lastClaimTime == 0 ? userStake.stakeTime : userStake.lastClaimTime;
        if (block.timestamp <= startTime) return 0;
        uint256 timeStaked = block.timestamp - startTime;
        // APY is in basis points (10000 = 100%)
        return (userStake.amount * config.apy * timeStaked) / (10000 * 365 days);
    }

    /**
     * @dev Stake native ZETA (msg.value) or ZRC-20/ERC-20 tokens.
     * @param poolId The ID of the pool to stake into.
     * @param amount Amount to stake.
     */
    function stake(uint256 poolId, uint256 amount) external payable nonReentrant {
        if (amount == 0) revert ZeroAmount();
        PoolConfig memory config = pools[poolId];
        if (!config.active) revert PoolNotActive();

        StakeInfo storage userStake = stakes[msg.sender][poolId];
        if (userStake.amount > 0) {
            uint256 pending = getPendingReward(msg.sender, poolId);
            if (pending > 0) {
                address token = config.token;
                if (token == address(0)) {
                    (bool success, ) = msg.sender.call{value: pending}("");
                    if (!success) revert NativeTransferFailed();
                } else {
                    IERC20(token).safeTransfer(msg.sender, pending);
                }
                emit RewardClaimed(msg.sender, poolId, token, pending);
            }
        }

        if (config.token == address(0)) {
            if (msg.value != amount) revert InsufficientBalance();
        } else {
            IERC20(config.token).safeTransferFrom(msg.sender, address(this), amount);
        }

        userStake.amount += amount;
        userStake.stakeTime = block.timestamp;
        userStake.lastClaimTime = block.timestamp;
        totalStaked[poolId] += amount;
        
        emit Staked(msg.sender, poolId, config.token, amount);
    }

    /**
     * @dev Withdraw staked tokens.
     * @param poolId The ID of the pool to withdraw from.
     * @param amount Amount to withdraw.
     */
    function withdraw(uint256 poolId, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        StakeInfo storage userStake = stakes[msg.sender][poolId];
        if (userStake.amount < amount) revert InsufficientBalance();
        
        PoolConfig memory config = pools[poolId];
        if (block.timestamp < userStake.stakeTime + config.lockDuration) revert Locked();
        
        uint256 reward = getPendingReward(msg.sender, poolId);
        uint256 totalPayout = amount + reward;

        if (userStake.amount == amount) {
            delete stakes[msg.sender][poolId];
        } else {
            userStake.amount -= amount;
            userStake.lastClaimTime = block.timestamp;
        }
        totalStaked[poolId] -= amount;
        
        // Return principal + reward to the user
        if (config.token == address(0)) {
            (bool success, ) = msg.sender.call{value: totalPayout}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(config.token).safeTransfer(msg.sender, totalPayout);
        }
        
        emit Withdrawn(msg.sender, poolId, config.token, totalPayout);
    }

    /**
     * @dev Withdraw staked tokens to a target edge chain.
     */
    function withdrawToTargetChain(uint256 poolId, uint256 targetChainId, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        StakeInfo storage userStake = stakes[msg.sender][poolId];
        if (userStake.amount < amount) revert InsufficientBalance();
        
        address targetToken = chainToZRC20[targetChainId];
        if (targetToken == address(0)) revert TargetZRC20NotSet();

        PoolConfig memory config = pools[poolId];
        if (block.timestamp < userStake.stakeTime + config.lockDuration) revert Locked();

        uint256 reward = getPendingReward(msg.sender, poolId);
        uint256 totalPayout = amount + reward;

        uint256 originalStakeTime = userStake.stakeTime;
        uint256 originalLastClaimTime = userStake.lastClaimTime;

        if (userStake.amount == amount) {
            delete stakes[msg.sender][poolId];
        } else {
            userStake.amount -= amount;
            userStake.lastClaimTime = block.timestamp;
        }
        totalStaked[poolId] -= amount;

        uint256 finalAmount = totalPayout;

        if (config.token != targetToken) {
            address[] memory path = new address[](3);
            path[1] = wZeta;
            path[2] = targetToken;
            uint[] memory amounts;
            
            if (config.token == address(0)) { // Swap Native ZETA to Target ZRC20
                path = new address[](2);
                path[0] = wZeta;
                path[1] = targetToken;
                amounts = uniswapRouter.swapExactETHForTokens{value: totalPayout}(
                    0, path, address(this), block.timestamp
                );
            } else { // Swap ZRC20 to Target ZRC20
                path[0] = config.token;
                IERC20(config.token).forceApprove(address(uniswapRouter), totalPayout);
                amounts = uniswapRouter.swapExactTokensForTokens(
                    totalPayout, 0, path, address(this), block.timestamp
                );
            }
            finalAmount = amounts[amounts.length - 1];
        }

        IERC20(targetToken).forceApprove(address(gateway), finalAmount);

        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(ACTION_WITHDRAW, poolId, msg.sender, originalStakeTime, originalLastClaimTime),
            onRevertGasLimit: 500000
        });

        gateway.withdraw(
            abi.encodePacked(msg.sender),
            finalAmount,
            targetToken,
            revertOptions
        );

        emit Withdrawn(msg.sender, poolId, targetToken, finalAmount);
    }

    /**
     * @dev Claim accrued rewards.
     * @param poolId The ID of the pool.
     */
    function claim(uint256 poolId) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender][poolId];
        if (userStake.amount == 0) revert InsufficientBalance();
        
        PoolConfig memory config = pools[poolId];
        uint256 reward = getPendingReward(msg.sender, poolId);
        if (reward == 0) revert ZeroAmount();

        userStake.lastClaimTime = block.timestamp;

        if (config.token == address(0)) {
            (bool success, ) = msg.sender.call{value: reward}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(config.token).safeTransfer(msg.sender, reward);
        }

        emit RewardClaimed(msg.sender, poolId, config.token, reward);
    }

    /**
     * @dev Claim accrued rewards to a target edge chain.
     * @param poolId The ID of the pool.
     * @param targetChainId The ID of the target chain.
     */
    function claimToTargetChain(uint256 poolId, uint256 targetChainId) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender][poolId];
        if (userStake.amount == 0) revert InsufficientBalance();

        address targetToken = chainToZRC20[targetChainId];
        if (targetToken == address(0)) revert TargetZRC20NotSet();

        PoolConfig memory config = pools[poolId];
        uint256 reward = getPendingReward(msg.sender, poolId);
        if (reward == 0) revert ZeroAmount();

        uint256 originalStakeTime = userStake.stakeTime;
        uint256 originalLastClaimTime = userStake.lastClaimTime;

        userStake.lastClaimTime = block.timestamp;

        uint256 finalAmount = reward;

        if (config.token != targetToken) {
            address[] memory path = new address[](3);
            path[1] = wZeta;
            path[2] = targetToken;
            uint[] memory amounts;
            
            if (config.token == address(0)) { // Swap Native ZETA to Target ZRC20
                path = new address[](2);
                path[0] = wZeta;
                path[1] = targetToken;
                amounts = uniswapRouter.swapExactETHForTokens{value: reward}(
                    0, path, address(this), block.timestamp
                );
            } else { // Swap ZRC20 to Target ZRC20
                path[0] = config.token;
                IERC20(config.token).forceApprove(address(uniswapRouter), reward);
                amounts = uniswapRouter.swapExactTokensForTokens(
                    reward, 0, path, address(this), block.timestamp
                );
            }
            finalAmount = amounts[amounts.length - 1];
        }

        IERC20(targetToken).forceApprove(address(gateway), finalAmount);

        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(ACTION_CLAIM, poolId, msg.sender, originalStakeTime, originalLastClaimTime),
            onRevertGasLimit: 500000
        });

        gateway.withdraw(
            abi.encodePacked(msg.sender),
            finalAmount,
            targetToken,
            revertOptions
        );

        emit RewardClaimed(msg.sender, poolId, targetToken, finalAmount);
    }
    
    // --- Handling Reverts from Gateway Withdrawals ---
    function onRevert(
        RevertContext calldata revertContext
    ) external onlyGateway {
        (uint8 action, uint256 poolId, address user, uint256 originalStakeTime, uint256 originalLastClaimTime) = 
            abi.decode(revertContext.revertMessage, (uint8, uint256, address, uint256, uint256));
        
        StakeInfo storage userStake = stakes[user][poolId];
        
        if (action == ACTION_WITHDRAW) {
            if (userStake.amount == 0) {
                userStake.stakeTime = originalStakeTime;
                userStake.lastClaimTime = originalLastClaimTime;
            }
            userStake.amount += revertContext.amount;
            totalStaked[poolId] += revertContext.amount;
        } else if (action == ACTION_CLAIM) {
            if (userStake.amount == 0) {
                userStake.stakeTime = block.timestamp;
                userStake.lastClaimTime = block.timestamp;
            }
            userStake.amount += revertContext.amount;
            totalStaked[poolId] += revertContext.amount;
        }
    }
}
