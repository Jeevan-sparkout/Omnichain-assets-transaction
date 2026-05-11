// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {
    ZetaChainUniversalToken as ExampleZetaChainUniversalToken
} from "@zetachain/standard-contracts/contracts/token/contracts/example/ZetaChainUniversalToken.sol";
import {RevertOptions} from "@zetachain/protocol-contracts/contracts/Revert.sol";
import {CallOptions} from "@zetachain/protocol-contracts/contracts/zevm/interfaces/IGatewayZEVM.sol";
import {IZRC20} from "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import {SwapHelperLib} from "@zetachain/toolkit/contracts/SwapHelperLib.sol";

interface IWZETA9 {
    function deposit() external payable;
    function withdraw(uint256 wad) external;
    function approve(address guy, uint256 wad) external returns (bool);
}

/**
 * @title ZetaChainUniversalTokenV2
 * @dev UUPS upgrade fixing two address-decoding bugs in UniversalTokenCore:
 *
 *  Bug 1 – uniswapRouter stored as corrupted address (leading zeros).
 *           Fixed with setUniswapRouter() owner setter.
 *
 *  Bug 2 – WZETA address decoded incorrectly via bytes20() from a 32-byte
 *           ABI-encoded registry return value.
 *           Fixed with setWZETA() owner setter and abi.decode() fallback.
 *
 * Storage layout is compatible with V1; all balances and state are preserved.
 */
contract ZetaChainUniversalTokenV2 is ExampleZetaChainUniversalToken {
    /// @notice Correct WZETA address, set by owner after upgrade.
    address public fixedWZETA;

    event UniswapRouterUpdated(address indexed newRouter);
    event WZETAUpdated(address indexed newWZETA);

    /// @notice Fix the corrupted Uniswap V2 router address.
    function setUniswapRouter(address newRouter) external onlyOwner {
        require(newRouter != address(0), "V2: zero router");
        uniswapRouter = newRouter;
        emit UniswapRouterUpdated(newRouter);
    }

    /// @notice Store the correct WZETA address to bypass the broken registry decode.
    function setWZETA(address newWZETA) external onlyOwner {
        require(newWZETA != address(0), "V2: zero WZETA");
        fixedWZETA = newWZETA;
        emit WZETAUpdated(newWZETA);
    }

    /**
     * @dev Overrides the broken _transferCrossChainCommon from UniversalTokenCore.
     *      Identical logic except WZETA resolution uses abi.decode() instead of bytes20().
     *      NOTE: nonReentrant is inherited from the parent; do not re-apply here.
     */
    function _transferCrossChainCommon(
        address destination,
        address receiver,
        uint256 amount,
        bytes memory extraMessage
    ) internal override {
        if (msg.value == 0) revert ZeroMsgValue();
        if (receiver == address(0)) revert InvalidAddress();

        bytes memory payload = abi.encode(receiver, amount, 0, msg.sender, extraMessage);

        _burn(msg.sender, amount);
        emit TokenTransfer(destination, receiver, amount);

        (address gasZRC20, uint256 gasFee) = IZRC20(destination)
            .withdrawGasFeeWithGasLimit(gasLimitAmount);
        if (destination != gasZRC20) revert InvalidAddress();

        // FIX: use owner-set address; fall back to correctly decoded registry value
        address wzeta = fixedWZETA;
        if (wzeta == address(0)) {
            (, bytes memory zetaBytes) = registry.getContractInfo(block.chainid, "zetaToken");
            wzeta = abi.decode(zetaBytes, (address));
        }

        IWZETA9(wzeta).deposit{value: msg.value}();
        if (!IWZETA9(wzeta).approve(uniswapRouter, msg.value)) revert ApproveFailed();

        uint256 swapped = SwapHelperLib.swapTokensForExactTokens(
            uniswapRouter,
            wzeta,
            gasFee,
            gasZRC20,
            msg.value
        );

        uint256 remaining = msg.value - swapped;
        if (remaining > 0) {
            IWZETA9(wzeta).withdraw(remaining);
            (bool ok, ) = msg.sender.call{value: remaining}("");
            if (!ok) revert TransferFailed();
        }

        if (!IZRC20(gasZRC20).approve(address(gateway), gasFee)) revert ApproveFailed();

        gateway.call(
            connected[destination],
            destination,
            payload,
            CallOptions({gasLimit: gasLimitAmount, isArbitraryCall: false}),
            RevertOptions({
                revertAddress: address(this),
                callOnRevert: true,
                abortAddress: address(this),
                revertMessage: abi.encode(receiver, amount, msg.sender),
                onRevertGasLimit: gasLimitAmount
            })
        );
    }
}
