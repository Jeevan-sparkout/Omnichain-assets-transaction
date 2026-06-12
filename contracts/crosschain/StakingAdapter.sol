// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IGatewayEVM, MessageContext} from "@zetachain/protocol-contracts/contracts/evm/interfaces/IGatewayEVM.sol";
import {RevertContext, RevertOptions} from "@zetachain/protocol-contracts/contracts/Revert.sol";
import {StakingMessages} from "./StakingMessages.sol";

interface ILocalStaking {
    function getPendingReward(address user, uint256 poolId) external view returns (uint256);
    function stakeFor(address user, uint256 poolId, uint256 amount) external payable;
    function withdrawFor(address user, uint256 poolId, uint256 amount, address recipient) external;
    function claimFor(address user, uint256 poolId, address recipient) external returns (uint256 reward, address token);
    function pools(uint256 poolId) external view returns (address token, uint256 apy, uint256 lockDuration, bool active);
}

/**
 * @title StakingAdapter
 * @dev Deployed on edge chains (BSC, Sepolia, etc.).
 * Acts as a Gateway proxy that connects LocalStaking to the ZetaChain cross-chain ecosystem.
 */
contract StakingAdapter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IGatewayEVM public immutable gateway;
    ILocalStaking public localStaking;
    address public zetaRouter;

    event CrossChainStakeInitiated(address indexed user, uint256 targetChainId, uint256 targetPoolId, uint256 amount);
    event CrossChainWithdrawInitiated(address indexed user, uint256 targetChainId, uint256 targetPoolId, uint256 amount);
    event CrossChainClaimInitiated(address indexed user, uint256 targetChainId, uint256 targetPoolId, uint256 amount);

    error OnlyGateway();
    error OnlyRouter();
    error ZeroAmount();
    error InsufficientBalance();
    error PoolNotActive();
    error NativeTransferFailed();

    constructor(
        address _gateway,
        address _zetaRouter,
        address _localStaking,
        address initialOwner
    ) Ownable(initialOwner) {
        gateway = IGatewayEVM(_gateway);
        zetaRouter = _zetaRouter;
        localStaking = ILocalStaking(_localStaking);
    }

    receive() external payable {}

    modifier onlyGateway() {
        if (msg.sender != address(gateway)) revert OnlyGateway();
        _;
    }

    function setZetaRouter(address _zetaRouter) external onlyOwner {
        zetaRouter = _zetaRouter;
    }

    function setLocalStaking(address _localStaking) external onlyOwner {
        localStaking = ILocalStaking(_localStaking);
    }

    // --- Cross-Chain Initiation ---

    function stakeCrossChain(uint256 poolId, uint256 targetChainId, uint256 targetPoolId, uint256 amount) external payable nonReentrant {
        if (amount == 0) revert ZeroAmount();
        (address token, , , bool active) = localStaking.pools(poolId);
        if (!active) revert PoolNotActive();
        
        bytes memory message = StakingMessages.encodeStake(msg.sender, targetChainId, targetPoolId, token, amount);
        
        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(poolId, message),
            onRevertGasLimit: 500000
        });

        if (token == address(0)) {
            if (msg.value != amount) revert InsufficientBalance();
            gateway.depositAndCall{value: amount}(
                zetaRouter,
                message,
                revertOptions
            );
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(token).forceApprove(address(gateway), amount);
            gateway.depositAndCall(
                zetaRouter,
                amount,
                token,
                message,
                revertOptions
            );
        }

        emit CrossChainStakeInitiated(msg.sender, targetChainId, targetPoolId, amount);
    }

    function withdrawCrossChain(uint256 poolId, uint256 targetChainId, uint256 targetPoolId, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        (address token, , , ) = localStaking.pools(poolId);
        
        uint256 balanceBefore = token == address(0) ? address(this).balance : IERC20(token).balanceOf(address(this));
        
        localStaking.withdrawFor(msg.sender, poolId, amount, address(this));

        uint256 balanceAfter = token == address(0) ? address(this).balance : IERC20(token).balanceOf(address(this));
        uint256 totalPayout = balanceAfter - balanceBefore;

        bytes memory message = StakingMessages.encodeWithdraw(msg.sender, targetChainId, targetPoolId, token, totalPayout);

        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(poolId, message),
            onRevertGasLimit: 500000
        });

        if (token == address(0)) {
            gateway.depositAndCall{value: totalPayout}(
                zetaRouter,
                message,
                revertOptions
            );
        } else {
            IERC20(token).forceApprove(address(gateway), totalPayout);
            gateway.depositAndCall(
                zetaRouter,
                totalPayout,
                token,
                message,
                revertOptions
            );
        }

        emit CrossChainWithdrawInitiated(msg.sender, targetChainId, targetPoolId, totalPayout);
    }

    function claimRewardCrossChain(uint256 poolId, uint256 targetChainId) external nonReentrant {
        (address token, , , ) = localStaking.pools(poolId);
        
        uint256 balanceBefore = token == address(0) ? address(this).balance : IERC20(token).balanceOf(address(this));
        
        localStaking.claimFor(msg.sender, poolId, address(this));

        uint256 balanceAfter = token == address(0) ? address(this).balance : IERC20(token).balanceOf(address(this));
        uint256 totalReward = balanceAfter - balanceBefore;
        if (totalReward == 0) revert ZeroAmount();

        bytes memory message = StakingMessages.encodeClaimReward(msg.sender, targetChainId, poolId, token, totalReward);

        RevertOptions memory revertOptions = RevertOptions({
            revertAddress: address(this),
            callOnRevert: true,
            abortAddress: address(0),
            revertMessage: abi.encode(poolId, message),
            onRevertGasLimit: 500000
        });

        if (token == address(0)) {
            gateway.depositAndCall{value: totalReward}(
                zetaRouter,
                message,
                revertOptions
            );
        } else {
            IERC20(token).forceApprove(address(gateway), totalReward);
            gateway.depositAndCall(
                zetaRouter,
                totalReward,
                token,
                message,
                revertOptions
            );
        }

        emit CrossChainClaimInitiated(msg.sender, targetChainId, poolId, totalReward);
    }

    // --- Incoming Cross-Chain Messages ---

    function onCall(
        MessageContext calldata context,
        bytes calldata message
    ) external payable onlyGateway returns (bytes memory) {
        address senderAddress = address(uint160(bytes20(context.sender)));
        if (senderAddress != zetaRouter) revert OnlyRouter();

        uint8 action = StakingMessages.getAction(message);

        if (action == StakingMessages.ACTION_STAKE) {
            (address staker, , uint256 targetPoolId, , uint256 msgAmount) = StakingMessages.decodeStake(message);
            
            (address expectedToken, , , ) = localStaking.pools(targetPoolId);
            if (expectedToken == address(0)) {
                if (msg.value != msgAmount) revert InsufficientBalance();
                localStaking.stakeFor{value: msgAmount}(staker, targetPoolId, msgAmount);
            } else {
                IERC20(expectedToken).forceApprove(address(localStaking), msgAmount);
                localStaking.stakeFor(staker, targetPoolId, msgAmount);
            }
        } 
        else if (action == StakingMessages.ACTION_WITHDRAW) {
            (address user, , uint256 targetPoolId, , uint256 msgAmount) = StakingMessages.decodeWithdraw(message);
            
            (address expectedToken, , , ) = localStaking.pools(targetPoolId);
            if (expectedToken == address(0)) {
                if (msg.value != msgAmount) revert InsufficientBalance();
                (bool success, ) = user.call{value: msgAmount}("");
                if (!success) revert NativeTransferFailed();
            } else {
                IERC20(expectedToken).safeTransfer(user, msgAmount);
            }
        }
        else if (action == StakingMessages.ACTION_CLAIM_REWARD) {
            (address user, , uint256 targetPoolId, , uint256 msgAmount) = StakingMessages.decodeClaimReward(message);
            
            (address expectedToken, , , ) = localStaking.pools(targetPoolId);
            if (expectedToken == address(0)) {
                if (msg.value != msgAmount) revert InsufficientBalance();
                (bool success, ) = user.call{value: msgAmount}("");
                if (!success) revert NativeTransferFailed();
            } else {
                IERC20(expectedToken).safeTransfer(user, msgAmount);
            }
        }

        return "";
    }

    // --- Handling Reverts ---

    function onRevert(
        RevertContext calldata revertContext
    ) external onlyGateway {
        (uint256 poolId, bytes memory message) = abi.decode(revertContext.revertMessage, (uint256, bytes));
        uint8 action = StakingMessages.getAction(message);

        if (action == StakingMessages.ACTION_STAKE) {
            (address staker, , , , ) = StakingMessages.decodeStake(message);
            (address expectedToken, , , ) = localStaking.pools(poolId);
            if (expectedToken == address(0)) {
                (bool success, ) = staker.call{value: revertContext.amount}("");
                if (!success) revert NativeTransferFailed();
            } else {
                IERC20(expectedToken).safeTransfer(staker, revertContext.amount);
            }
        } 
        else if (action == StakingMessages.ACTION_WITHDRAW) {
            (address user, , , , ) = StakingMessages.decodeWithdraw(message);
            (address expectedToken, , , ) = localStaking.pools(poolId);
            
            if (expectedToken == address(0)) {
                localStaking.stakeFor{value: revertContext.amount}(user, poolId, revertContext.amount);
            } else {
                IERC20(expectedToken).forceApprove(address(localStaking), revertContext.amount);
                localStaking.stakeFor(user, poolId, revertContext.amount);
            }
        }
        else if (action == StakingMessages.ACTION_CLAIM_REWARD) {
            (address user, , , , ) = StakingMessages.decodeClaimReward(message);
            (address expectedToken, , , ) = localStaking.pools(poolId);
            
            if (expectedToken == address(0)) {
                localStaking.stakeFor{value: revertContext.amount}(user, poolId, revertContext.amount);
            } else {
                IERC20(expectedToken).forceApprove(address(localStaking), revertContext.amount);
                localStaking.stakeFor(user, poolId, revertContext.amount);
            }
        }
    }
}
