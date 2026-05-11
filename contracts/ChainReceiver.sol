// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IZetaChainGateway} from "./interfaces/IZetaChainGateway.sol";

contract ChainReceiver is Ownable {
    event ReceivedCall(
        uint256 indexed sourceChainId,
        address indexed sourceSender,
        bytes origin,
        address indexed zrc20,
        uint256 amount,
        bytes message
    );

    error OnlyGateway();

    address public immutable gateway;

    constructor(address gatewayAddress, address initialOwner) Ownable(initialOwner) {
        gateway = gatewayAddress;
    }

    modifier onlyGateway() {
        if (msg.sender != gateway) revert OnlyGateway();
        _;
    }

    function onCall(
        IZetaChainGateway.MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external onlyGateway {
        emit ReceivedCall(context.chainID, context.senderEVM, context.sender, zrc20, amount, message);
    }
}
