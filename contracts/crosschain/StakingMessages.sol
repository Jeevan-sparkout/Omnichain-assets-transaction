// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library StakingMessages {
    uint8 public constant ACTION_STAKE = 1;
    uint8 public constant ACTION_WITHDRAW = 2;
    uint8 public constant ACTION_CLAIM_REWARD = 3;

    struct StakePayload {
        uint8 action;
        address staker;
        uint256 targetChainId; // The chain where the stake should land
        uint256 targetPoolId; // The specific pool ID to stake into
        address token; // The token being staked
        uint256 amount; // The amount being staked
    }

    struct WithdrawPayload {
        uint8 action;
        address user;
        uint256 targetChainId; // The chain where the user wants to receive the funds
        uint256 targetPoolId; // The specific pool ID to withdraw from
        address token; // The token being withdrawn
        uint256 amount; // The amount being withdrawn
    }

    struct ClaimRewardPayload {
        uint8 action;
        address user;
        uint256 targetChainId; // The chain where the user wants to receive the rewards
        uint256 targetPoolId;  // The specific pool ID to claim from
        address token;         // The token of the reward pool
        uint256 amount;        // The amount of reward being claimed/routed
    }

    function encodeStake(address staker, uint256 targetChainId, uint256 targetPoolId, address token, uint256 amount) internal pure returns (bytes memory) {
        return abi.encode(ACTION_STAKE, staker, targetChainId, targetPoolId, token, amount);
    }

    function decodeStake(bytes memory message) internal pure returns (address staker, uint256 targetChainId, uint256 targetPoolId, address token, uint256 amount) {
        (, staker, targetChainId, targetPoolId, token, amount) = abi.decode(message, (uint8, address, uint256, uint256, address, uint256));
    }

    function encodeWithdraw(address user, uint256 targetChainId, uint256 targetPoolId, address token, uint256 amount) internal pure returns (bytes memory) {
        return abi.encode(ACTION_WITHDRAW, user, targetChainId, targetPoolId, token, amount);
    }

    function decodeWithdraw(bytes memory message) internal pure returns (address user, uint256 targetChainId, uint256 targetPoolId, address token, uint256 amount) {
        (, user, targetChainId, targetPoolId, token, amount) = abi.decode(message, (uint8, address, uint256, uint256, address, uint256));
    }

    function encodeClaimReward(address user, uint256 targetChainId, uint256 targetPoolId, address token, uint256 amount) internal pure returns (bytes memory) {
        return abi.encode(ACTION_CLAIM_REWARD, user, targetChainId, targetPoolId, token, amount);
    }

    function decodeClaimReward(bytes memory message) internal pure returns (address user, uint256 targetChainId, uint256 targetPoolId, address token, uint256 amount) {
        (, user, targetChainId, targetPoolId, token, amount) = abi.decode(message, (uint8, address, uint256, uint256, address, uint256));
    }

    function getAction(bytes memory message) internal pure returns (uint8) {
        if (message.length < 32) return 0;
        return abi.decode(message, (uint8));
    }
}
