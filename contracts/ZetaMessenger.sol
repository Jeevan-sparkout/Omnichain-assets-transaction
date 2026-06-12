// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IZetaChainGateway} from "./interfaces/IZetaChainGateway.sol";
import {IZRC20} from "./interfaces/IZRC20.sol";

contract ZetaMessenger is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IZetaChainGateway public immutable gateway;

    event IncomingCall(
        uint256 indexed sourceChainId,
        address indexed sourceSender,
        bytes origin,
        address indexed zrc20,
        uint256 amount,
        bytes message
    );

    event OutgoingCallRequested(
        bytes receiver,
        address indexed destinationGasZRC20,
        uint256 gasFee,
        uint256 gasLimit,
        bytes message
    );

    error OnlyGateway();
    error EmptyReceiver();
    error EmptyMessage();

    constructor(
        address gatewayAddress,
        address initialOwner
    ) Ownable(initialOwner) {
        gateway = IZetaChainGateway(gatewayAddress);
    }

    modifier onlyGateway() {
        if (msg.sender != address(gateway)) revert OnlyGateway();
        _;
    }

    function onCall(
        IZetaChainGateway.MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external onlyGateway {
        emit IncomingCall(
            context.chainID,
            context.senderEVM,
            context.sender,
            zrc20,
            amount,
            message
        );
    }

    function quoteGasFee(
        address destinationGasZRC20,
        uint256 gasLimit
    ) public view returns (uint256 gasFee) {
        (, gasFee) = IZRC20(destinationGasZRC20).withdrawGasFeeWithGasLimit(
            gasLimit
        );
    }

    function callRemote(
        bytes calldata receiver,
        address destinationGasZRC20,
        bytes calldata message,
        uint256 gasLimit,
        bool isArbitraryCall
    ) external nonReentrant returns (uint256 gasFee) {
        if (receiver.length == 0) revert EmptyReceiver();
        if (message.length == 0) revert EmptyMessage();

        gasFee = quoteGasFee(destinationGasZRC20, gasLimit);

        IERC20(destinationGasZRC20).safeTransferFrom(
            msg.sender,
            address(this),
            gasFee
        );
        IERC20(destinationGasZRC20).forceApprove(address(gateway), gasFee);

        IZetaChainGateway.CallOptions memory callOptions = IZetaChainGateway
            .CallOptions({
                gasLimit: gasLimit,
                isArbitraryCall: isArbitraryCall
            });

        IZetaChainGateway.RevertOptions memory revertOptions = IZetaChainGateway
            .RevertOptions({
                revertAddress: address(this),
                callOnRevert: true,
                abortAddress: address(0),
                revertMessage: abi.encode(
                    receiver,
                    destinationGasZRC20,
                    message
                ),
                onRevertGasLimit: gasLimit
            });

        gateway.call(
            receiver,
            destinationGasZRC20,
            message,
            callOptions,
            revertOptions
        );

        emit OutgoingCallRequested(
            receiver,
            destinationGasZRC20,
            gasFee,
            gasLimit,
            message
        );
    }
}
