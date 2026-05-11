// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IZRC20 is IERC20 {
    function withdrawGasFeeWithGasLimit(uint256 gasLimit) external view returns (uint256, uint256);
}
