// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IZetaChainGateway {
    struct MessageContext {
        bytes sender;
        address senderEVM;
        uint256 chainID;
    }

    struct CallOptions {
        uint256 gasLimit;
        bool isArbitraryCall;
    }

    struct RevertOptions {
        address revertAddress;
        bool callOnRevert;
        address abortAddress;
        bytes revertMessage;
        uint256 onRevertGasLimit;
    }

    function call(
        bytes calldata receiver,
        address zrc20,
        bytes calldata message,
        CallOptions calldata callOptions,
        RevertOptions calldata revertOptions
    ) external;

    function withdrawAndCall(
        bytes calldata receiver,
        uint256 amount,
        address zrc20,
        bytes calldata message,
        CallOptions calldata callOptions,
        RevertOptions calldata revertOptions
    ) external;
}
