// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUniswapV2Router02 {
    event Swapped(uint amountIn, uint amountOutMin, address[] path, address to);

    // Simple 1:1 swap for testing purposes
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(path.length >= 2, "Invalid path");
        require(block.timestamp <= deadline, "Expired");

        address tokenIn = path[0];
        address tokenOut = path[path.length - 1];

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(to, amountIn); // 1:1 swap rate

        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountIn;

        emit Swapped(amountIn, amountOutMin, path, to);

        return amounts;
    }
}
