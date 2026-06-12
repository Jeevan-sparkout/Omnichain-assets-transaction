// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LocalStaking
 * @dev A completely pure staking contract with zero cross-chain dependencies.
 * Contains standard staking logic and allows authorized Adapters to stake/withdraw on behalf of users.
 */
contract LocalStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct PoolConfig {
        address token;
        uint256 apy;          // e.g., 1000 for 10.00%
        uint256 lockDuration; // in seconds
        bool active;
    }

    struct StakeInfo {
        uint256 amount;
        uint256 stakeTime;
        uint256 lastClaimTime;
    }

    mapping(uint256 => PoolConfig) public pools;
    mapping(address => mapping(uint256 => StakeInfo)) public stakes;
    mapping(uint256 => uint256) public totalStaked;
    mapping(address => bool) public isAdapter;

    event Staked(address indexed user, uint256 indexed poolId, uint256 amount, address indexed caller);
    event Withdrawn(address indexed user, uint256 indexed poolId, uint256 amount, address indexed caller);
    event RewardClaimed(address indexed user, uint256 indexed poolId, uint256 amount, address indexed caller);
    event AdapterStatusUpdated(address indexed adapter, bool status);

    error OnlyAdapter();
    error ZeroAmount();
    error InsufficientBalance();
    error PoolNotActive();
    error Locked();
    error NativeTransferFailed();

    constructor(address initialOwner) Ownable(initialOwner) {
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

    // --- Admin Functions ---

    function setAdapter(address adapter, bool status) external onlyOwner {
        isAdapter[adapter] = status;
        emit AdapterStatusUpdated(adapter, status);
    }

    function setPoolConfig(uint256 poolId, address token, uint256 apy, uint256 lockDuration, bool active) external onlyOwner {
        pools[poolId] = PoolConfig(token, apy, lockDuration, active);
    }

    // --- View Functions ---

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

    // --- Core Staking Logic ---

    function _processStake(address user, uint256 poolId, uint256 amount) internal {
        if (amount == 0) revert ZeroAmount();
        PoolConfig memory config = pools[poolId];
        if (!config.active) revert PoolNotActive();

        StakeInfo storage userStake = stakes[user][poolId];
        if (userStake.amount > 0) {
            uint256 pending = getPendingReward(user, poolId);
            if (pending > 0) {
                address token = config.token;
                if (token == address(0)) {
                    (bool success, ) = user.call{value: pending}("");
                    if (!success) revert NativeTransferFailed();
                } else {
                    IERC20(token).safeTransfer(user, pending);
                }
                emit RewardClaimed(user, poolId, pending, msg.sender);
            }
        }

        userStake.amount += amount;
        userStake.stakeTime = block.timestamp;
        userStake.lastClaimTime = block.timestamp;
        totalStaked[poolId] += amount;
        emit Staked(user, poolId, amount, msg.sender);
    }

    function _processWithdraw(address user, uint256 poolId, uint256 amount) internal returns (uint256 principal, uint256 reward, address token) {
        if (amount == 0) revert ZeroAmount();
        StakeInfo storage userStake = stakes[user][poolId];
        if (userStake.amount < amount) revert InsufficientBalance();
        
        PoolConfig memory config = pools[poolId];
        if (block.timestamp < userStake.stakeTime + config.lockDuration) revert Locked();
        
        reward = getPendingReward(user, poolId);
        principal = amount;
        token = config.token;

        if (userStake.amount == amount) {
            delete stakes[user][poolId];
        } else {
            userStake.amount -= amount;
            userStake.lastClaimTime = block.timestamp;
        }
        totalStaked[poolId] -= amount;
    }

    function _processClaim(address user, uint256 poolId) internal returns (uint256 reward, address token) {
        StakeInfo storage userStake = stakes[user][poolId];
        if (userStake.amount == 0) revert InsufficientBalance();
        
        PoolConfig memory config = pools[poolId];
        reward = getPendingReward(user, poolId);
        token = config.token;

        userStake.lastClaimTime = block.timestamp;
    }

    // --- User Facing ---

    function stakeLocal(uint256 poolId, uint256 amount) external payable nonReentrant {
        address token = pools[poolId].token;
        if (token == address(0)) {
            if (msg.value != amount) revert InsufficientBalance();
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
        _processStake(msg.sender, poolId, amount);
    }

    function withdrawLocal(uint256 poolId, uint256 amount) external nonReentrant {
        (uint256 principal, uint256 reward, address token) = _processWithdraw(msg.sender, poolId, amount);
        uint256 totalPayout = principal + reward;
        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: totalPayout}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(token).safeTransfer(msg.sender, totalPayout);
        }
        emit Withdrawn(msg.sender, poolId, totalPayout, msg.sender);
    }

    function claimLocal(uint256 poolId) external nonReentrant {
        (uint256 reward, address token) = _processClaim(msg.sender, poolId);
        if (reward == 0) revert ZeroAmount();
        
        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: reward}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(token).safeTransfer(msg.sender, reward);
        }
        emit RewardClaimed(msg.sender, poolId, reward, msg.sender);
    }

    // --- Adapter Facing ---

    modifier onlyAdapter() {
        if (!isAdapter[msg.sender]) revert OnlyAdapter();
        _;
    }

    function stakeFor(address user, uint256 poolId, uint256 amount) external payable nonReentrant onlyAdapter {
        address token = pools[poolId].token;
        if (token == address(0)) {
            if (msg.value != amount) revert InsufficientBalance();
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
        _processStake(user, poolId, amount);
    }

    function withdrawFor(address user, uint256 poolId, uint256 amount, address recipient) external nonReentrant onlyAdapter {
        (uint256 principal, uint256 reward, address token) = _processWithdraw(user, poolId, amount);
        uint256 totalPayout = principal + reward;
        if (token == address(0)) {
            (bool success, ) = recipient.call{value: totalPayout}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(token).safeTransfer(recipient, totalPayout);
        }
        emit Withdrawn(user, poolId, totalPayout, msg.sender);
    }

    function claimFor(address user, uint256 poolId, address recipient) external nonReentrant onlyAdapter returns (uint256 reward, address token) {
        (reward, token) = _processClaim(user, poolId);
        if (reward == 0) revert ZeroAmount();
        
        if (token == address(0)) {
            (bool success, ) = recipient.call{value: reward}("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(token).safeTransfer(recipient, reward);
        }
        emit RewardClaimed(user, poolId, reward, msg.sender);
    }
}
