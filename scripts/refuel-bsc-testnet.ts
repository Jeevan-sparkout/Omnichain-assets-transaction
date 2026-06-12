import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY is not set in .env");

    const rpcZeta = process.env.RPC_ZETACHAIN || "https://zetachain-athens.g.allthatnode.com/archive/evm";
    const provider = new ethers.JsonRpcProvider(rpcZeta);
    const wallet = new ethers.Wallet(privateKey, provider);

    const routerAddress = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
    const wzetaAddress = "0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf";
    const bnbZrc20Address = "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891";

    const wzetaAbi = [
        "function deposit() external payable",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function balanceOf(address) external view returns (uint256)"
    ];

    const routerAbi = [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ];

    const zrc20Abi = [
        "function withdraw(bytes calldata to, uint256 amount) external returns (bool)",
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function withdrawGasFee() view returns (uint256, uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)"
    ];

    const wzeta = new ethers.Contract(wzetaAddress, wzetaAbi, wallet);
    const router = new ethers.Contract(routerAddress, routerAbi, wallet);
    const zrc20 = new ethers.Contract(bnbZrc20Address, zrc20Abi, wallet);

    console.log("=========================================");
    console.log("🔄 Swapping 8 ZETA to BNB & Withdrawing to BSC Testnet");
    console.log(`Wallet: ${wallet.address}`);
    console.log("=========================================");

    const swapAmount = ethers.parseEther("8.0");
    const path = [wzetaAddress, bnbZrc20Address];

    // Wrap ZETA
    console.log("\nStep 1: Wrapping 8 ZETA to WZETA...");
    const depositTx = await wzeta.deposit({ value: swapAmount });
    console.log(`Deposit tx sent: ${depositTx.hash}`);
    await depositTx.wait();
    console.log("Wrapped ZETA successfully.");

    // Approve Router
    console.log("\nStep 2: Approving Uniswap Router...");
    const approveTx = await wzeta.approve(routerAddress, swapAmount);
    console.log(`Approve tx sent: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("Approved router.");

    // Swap
    console.log("\nStep 3: Swapping WZETA to ZRC-20 BNB...");
    const deadline = Math.floor(Date.now() / 1000) + 600;
    const swapTx = await router.swapExactTokensForTokens(
        swapAmount,
        0,
        path,
        wallet.address,
        deadline,
        { gasLimit: 500000 }
    );
    console.log(`Swap tx sent: ${swapTx.hash}`);
    await swapTx.wait();
    console.log("Swapped to BNB ZRC-20.");

    // Check BNB ZRC-20 Balance
    const bnbBalance = await zrc20.balanceOf(wallet.address);
    console.log(`Current ZRC-20 BNB Balance: ${ethers.formatEther(bnbBalance)} BNB`);

    // Fetch Gas Fee
    const [gasLimit, gasFee] = await zrc20.withdrawGasFee();
    console.log(`Withdraw Gas Fee required: ${ethers.formatEther(gasFee)} BNB`);

    if (bnbBalance <= gasFee) {
        console.log(`❌ Balance is less than gas fee.`);
        return;
    }

    const withdrawAmount = bnbBalance - gasFee;
    console.log(`Net withdraw amount: ${ethers.formatEther(withdrawAmount)} BNB`);

    // Approve ZRC20 for gas fee
    console.log("\nStep 4: Approving ZRC-20 contract for its own gas fee...");
    const approveZrcTx = await zrc20.approve(bnbZrc20Address, gasFee);
    console.log(`Approve tx: ${approveZrcTx.hash}`);
    await approveZrcTx.wait();
    console.log("Approved gas fee.");

    // Withdraw to BSC Testnet
    console.log(`\nStep 5: Withdrawing ${ethers.formatEther(withdrawAmount)} BNB to BSC Testnet...`);
    const toAddressBytes = ethers.zeroPadValue(wallet.address, 32);
    const withdrawTx = await zrc20.withdraw(ethers.getBytes(toAddressBytes), withdrawAmount, { gasLimit: 500000 });
    console.log(`Withdraw transaction sent: ${withdrawTx.hash}`);
    console.log("Waiting for confirmation...");
    await withdrawTx.wait();
    console.log(`\n🎉 Withdrawal initiated! Track it here: https://testnet.zetachain.com/cc/tx/${withdrawTx.hash}`);
}

main().catch(console.error);
