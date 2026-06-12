// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {RevertOptions} from "@zetachain/protocol-contracts/contracts/Revert.sol";
import {CallOptions} from "@zetachain/protocol-contracts/contracts/zevm/interfaces/IGatewayZEVM.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {UniversalContract, MessageContext} from "@zetachain/protocol-contracts/contracts/zevm/interfaces/UniversalContract.sol";

contract MockGatewayZEVM {
    event WithdrawnAndCalled(
        address indexed sender,
        uint256 indexed chainId,
        bytes receiver,
        address zrc20,
        uint256 value,
        uint256 gasfee,
        uint256 protocolFlatFee,
        bytes message,
        CallOptions callOptions,
        RevertOptions revertOptions
    );

    event ErrorString(string reason);
    event ErrorBytes(bytes reason);

    function simulateOnCall(
        address target,
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external {
        if (zrc20 != address(0)) {
            // Need the test script to fund this contract first
            IERC20(zrc20).transfer(target, amount);
        }
        try UniversalContract(target).onCall(context, zrc20, amount, message) {
        } catch Error(string memory reason) {
            emit ErrorString(reason);
        } catch (bytes memory reason) {
            emit ErrorBytes(reason);
        }
    }

    function withdrawAndCall(
        bytes memory receiver,
        uint256 amount,
        address zrc20,
        bytes calldata message,
        CallOptions calldata callOptions,
        RevertOptions calldata revertOptions
    ) external {
        IERC20(zrc20).transferFrom(msg.sender, address(this), amount);
        // Chain ID is usually inferred, but here we'll just emit an event
        emit WithdrawnAndCalled(
            msg.sender,
            0,
            receiver,
            zrc20,
            amount,
            0,
            0,
            message,
            callOptions,
            revertOptions
        );
    }

    function withdrawAndCall(
        bytes memory receiver,
        uint256 amount,
        uint256 chainId,
        bytes calldata message,
        CallOptions calldata callOptions,
        RevertOptions calldata revertOptions
    ) external {
        emit WithdrawnAndCalled(
            msg.sender,
            chainId,
            receiver,
            address(0), // native zeta
            amount,
            0,
            0,
            message,
            callOptions,
            revertOptions
        );
    }
}
