// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {UniversalContract, MessageContext} from "@zetachain/protocol-contracts/contracts/zevm/interfaces/UniversalContract.sol";
import {RevertContext, RevertOptions} from "@zetachain/protocol-contracts/contracts/Revert.sol";
import {CallOptions} from "@zetachain/protocol-contracts/contracts/zevm/interfaces/IGatewayZEVM.sol";
import {StakingMessages} from "./StakingMessages.sol";

interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

/**
 * @title StakingRouterZEVM
 * @dev Deployed on ZetaChain (zEVM).
 * Acts as the central hub routing staking and withdrawal messages across chains.
 */
contract StakingRouterZEVM is UniversalContract, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IUniswapV2Router02 public immutable uniswapRouter;
    address public immutable wZeta;

    // Mapping from chain ID to the target Staking contract address on that chain
    mapping(uint256 => bytes) public targetContracts;

    // Mapping from chain ID to the target ZRC-20 token address that should be sent to it
    // E.g., ChainID 97 (BSC Testnet) -> ZRC-20 BNB or ZRC-20 USDC Address on ZetaChain
    mapping(uint256 => address) public chainToZRC20;

    event RoutedStake(address indexed staker, uint256 targetChainId, address targetZrc20, uint256 amount);
    event RoutedWithdraw(address indexed user, uint256 targetChainId, address targetZrc20, uint256 amount);
    event RoutedClaim(address indexed user, uint256 targetChainId, address targetZrc20, uint256 amount);
    event SwappedTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    error TargetContractNotSet();
    error TargetZRC20NotSet();

    constructor(address initialOwner, address _uniswapRouter, address _wZeta) Ownable(initialOwner) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        wZeta = _wZeta;
    }

    function setTargetContract(uint256 chainId, bytes calldata contractAddress) external onlyOwner {
        targetContracts[chainId] = contractAddress;
    }

    function setChainZRC20(uint256 chainId, address zrc20Address) external onlyOwner {
        chainToZRC20[chainId] = zrc20Address;
    }

    /**
     * @dev Triggered by ZetaChain when an edge chain calls Gateway.depositAndCall() 
     * targeted to this Router.
     */
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway nonReentrant {
        uint8 action = StakingMessages.getAction(message);

        if (action == StakingMessages.ACTION_STAKE) {
            (address staker, uint256 targetChainId, , , ) = StakingMessages.decodeStake(message);
            
            bytes memory targetContract = targetContracts[targetChainId];
            if (targetContract.length == 0) revert TargetContractNotSet();
            
            address targetToken = chainToZRC20[targetChainId];
            if (targetToken == address(0)) revert TargetZRC20NotSet();

            uint256 finalAmount = amount;

            // Swap if incoming token does not match target chain's accepted token
            if (zrc20 != targetToken) {
                IERC20(zrc20).forceApprove(address(uniswapRouter), amount);
                address[] memory path;
                
                // Route through WZETA
                path = new address[](3);
                path[0] = zrc20;
                path[1] = wZeta;
                path[2] = targetToken;
                
                uint[] memory amounts = uniswapRouter.swapExactTokensForTokens(
                    amount,
                    0, // Accept any amount of targetToken for this simplified version
                    path,
                    address(this),
                    block.timestamp
                );
                finalAmount = amounts[amounts.length - 1];
                emit SwappedTokens(zrc20, targetToken, amount, finalAmount);
            }

            // Approve Gateway to withdraw and call the target chain
            IERC20(targetToken).forceApprove(address(gateway), finalAmount);

            gateway.withdrawAndCall(
                targetContract,
                finalAmount,
                targetToken,
                message, // Forward the exact same message to the target staking contract
                CallOptions({gasLimit: 500000, isArbitraryCall: false}),
                RevertOptions({
                    revertAddress: address(this),
                    callOnRevert: true,
                    abortAddress: address(0),
                    revertMessage: abi.encode(context.chainID, message),
                    onRevertGasLimit: 500000
                })
            );

            emit RoutedStake(staker, targetChainId, targetToken, finalAmount);
        } 
        else if (action == StakingMessages.ACTION_WITHDRAW) {
            (address user, uint256 targetChainId, , , ) = StakingMessages.decodeWithdraw(message);
            
            bytes memory targetContract = targetContracts[targetChainId];
            if (targetContract.length == 0) revert TargetContractNotSet();

            address targetToken = chainToZRC20[targetChainId];
            if (targetToken == address(0)) revert TargetZRC20NotSet();

            uint256 finalAmount = amount;

            if (zrc20 != targetToken) {
                IERC20(zrc20).forceApprove(address(uniswapRouter), amount);
                address[] memory path = new address[](3);
                path[0] = zrc20;
                path[1] = wZeta;
                path[2] = targetToken;
                
                uint[] memory amounts = uniswapRouter.swapExactTokensForTokens(
                    amount,
                    0,
                    path,
                    address(this),
                    block.timestamp
                );
                finalAmount = amounts[amounts.length - 1];
                emit SwappedTokens(zrc20, targetToken, amount, finalAmount);
            }

            IERC20(targetToken).forceApprove(address(gateway), finalAmount);

            // Send funds and message back to the target chain
            gateway.withdrawAndCall(
                targetContract,
                finalAmount,
                targetToken,
                message,
                CallOptions({gasLimit: 500000, isArbitraryCall: false}),
                RevertOptions({
                    revertAddress: address(this),
                    callOnRevert: true,
                    abortAddress: address(0),
                    revertMessage: abi.encode(context.chainID, message),
                    onRevertGasLimit: 500000
                })
            );

            emit RoutedWithdraw(user, targetChainId, targetToken, finalAmount);
        }
        else if (action == StakingMessages.ACTION_CLAIM_REWARD) {
            (address user, uint256 targetChainId, , , ) = StakingMessages.decodeClaimReward(message);
            
            bytes memory targetContract = targetContracts[targetChainId];
            if (targetContract.length == 0) revert TargetContractNotSet();

            address targetToken = chainToZRC20[targetChainId];
            if (targetToken == address(0)) revert TargetZRC20NotSet();

            uint256 finalAmount = amount;

            if (zrc20 != targetToken) {
                IERC20(zrc20).forceApprove(address(uniswapRouter), amount);
                address[] memory path = new address[](3);
                path[0] = zrc20;
                path[1] = wZeta;
                path[2] = targetToken;
                
                uint[] memory amounts = uniswapRouter.swapExactTokensForTokens(
                    amount,
                    0,
                    path,
                    address(this),
                    block.timestamp
                );
                finalAmount = amounts[amounts.length - 1];
                emit SwappedTokens(zrc20, targetToken, amount, finalAmount);
            }

            IERC20(targetToken).forceApprove(address(gateway), finalAmount);

            // Send funds and message back to the target chain
            gateway.withdrawAndCall(
                targetContract,
                finalAmount,
                targetToken,
                message,
                CallOptions({gasLimit: 500000, isArbitraryCall: false}),
                RevertOptions({
                    revertAddress: address(this),
                    callOnRevert: true,
                    abortAddress: address(0),
                    revertMessage: abi.encode(context.chainID, message),
                    onRevertGasLimit: 500000
                })
            );

            emit RoutedClaim(user, targetChainId, targetToken, finalAmount);
        }
    }

    /**
     * @dev Handle reverts from destination chains.
     */
    function onRevert(
        RevertContext calldata revertContext
    ) external onlyGateway {
        // If the route failed, we should bounce the message back to the original chain.
        // We recover the original source chain ID and message from revertMessage.
        (uint256 sourceChainId, bytes memory originalMessage) = abi.decode(revertContext.revertMessage, (uint256, bytes));

        bytes memory originalContract = targetContracts[sourceChainId];
        if (originalContract.length > 0) {
            IERC20(revertContext.asset).forceApprove(address(gateway), revertContext.amount);
            
            // Return funds back to the source chain
            gateway.withdrawAndCall(
                originalContract,
                revertContext.amount,
                revertContext.asset,
                originalMessage,
                CallOptions({gasLimit: 500000, isArbitraryCall: false}),
                RevertOptions({
                    revertAddress: address(0),
                    callOnRevert: false,
                    abortAddress: address(0),
                    revertMessage: "",
                    onRevertGasLimit: 0
                })
            );
        }
    }
}
