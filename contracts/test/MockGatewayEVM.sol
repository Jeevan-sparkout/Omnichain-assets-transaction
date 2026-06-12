// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {RevertOptions} from "@zetachain/protocol-contracts/contracts/Revert.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Callable, MessageContext} from "@zetachain/protocol-contracts/contracts/evm/interfaces/IGatewayEVM.sol";

contract MockGatewayEVM {
    // Track what was deposited
    event DepositedAndCalled(address receiver, uint256 amount, address asset, bytes message, bool revertOptionsPresent);

    receive() external payable {}

    // Call this manually to simulate receiving a call from ZetaChain
    function simulateOnCall(
        address target,
        MessageContext calldata context,
        bytes calldata message,
        address asset,
        uint256 amount
    ) external payable {
        if (asset != address(0)) {
            // Need the test script to fund this contract first, or we just mint. 
            // Since it's a mock ERC20 we'll assume it has tokens.
            IERC20(asset).transfer(target, amount);
        }
        Callable(target).onCall{value: msg.value}(context, message);
    }

    function depositAndCall(
        address receiver,
        bytes calldata message,
        RevertOptions calldata revertOptions
    ) external payable {
        emit DepositedAndCalled(receiver, msg.value, address(0), message, revertOptions.callOnRevert);
    }

    function depositAndCall(
        address receiver,
        uint256 amount,
        address asset,
        bytes calldata message,
        RevertOptions calldata revertOptions
    ) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        emit DepositedAndCalled(receiver, amount, asset, message, revertOptions.callOnRevert);
    }
}
