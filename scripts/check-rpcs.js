const axios = require('axios');
require('dotenv').config();

async function checkEVM(url, name) {
    try {
        const res = await axios.post(url, {
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1
        }, { timeout: 5000 });
        if (res.data && res.data.result) {
            console.log(`✅ ${name}: Operational (Block: ${parseInt(res.data.result, 16)})`);
        } else {
            console.log(`❌ ${name}: Returned unexpected response`);
        }
    } catch (e) {
        console.log(`❌ ${name}: Failed to connect - ${e.message}`);
    }
}

async function checkSolana(url, name) {
    try {
        const res = await axios.post(url, {
            jsonrpc: "2.0",
            method: "getSlot",
            params: [],
            id: 1
        }, { timeout: 5000 });
        if (res.data && res.data.result) {
            console.log(`✅ ${name}: Operational (Slot: ${res.data.result})`);
        } else {
            console.log(`❌ ${name}: Returned unexpected response`);
        }
    } catch (e) {
        console.log(`❌ ${name}: Failed to connect - ${e.message}`);
    }
}

async function checkSui(url, name) {
    try {
        const res = await axios.post(url, {
            jsonrpc: "2.0",
            method: "sui_getTotalTransactionBlocks",
            params: [],
            id: 1
        }, { timeout: 5000 });
        if (res.data && res.data.result) {
            console.log(`✅ ${name}: Operational (Total TXs: ${res.data.result})`);
        } else {
            console.log(`❌ ${name}: Returned unexpected response`);
        }
    } catch (e) {
        console.log(`❌ ${name}: Failed to connect - ${e.message}`);
    }
}

async function checkTon(url, name) {
    try {
        // TON api/v2 endpoints usually support GET /getMasterchainInfo
        // Let's try appending /getMasterchainInfo if it doesn't end with it
        let fetchUrl = url;
        if (!fetchUrl.endsWith('/jsonRPC') && !fetchUrl.endsWith('/getMasterchainInfo')) {
            fetchUrl = fetchUrl.replace(/\/$/, '') + '/getMasterchainInfo';
        }
        
        const res = await axios.get(fetchUrl, { timeout: 5000 });
        if (res.data && res.data.ok) {
            console.log(`✅ ${name}: Operational (Last Block Seqno: ${res.data.result.last.seqno})`);
        } else {
            console.log(`❌ ${name}: Returned unexpected response`);
        }
    } catch (e) {
        console.log(`❌ ${name}: Failed to connect - ${e.message}`);
    }
}

async function main() {
    console.log("Checking newly added RPC endpoints...\n");

    const rpcs = {
        "BASE_URL (Base Testnet)": process.env.BASE_URL,
        "AVALANCHFUJI_RPC": process.env.AVALANCHFUJI_RPC,
        "ARBITRUN_TESTNET_RPC": process.env.ARBITRUN_TESTNET_RPC,
        "SOLANA_DEVNET_RPC": process.env.SOLANA_DEVNET_RPC,
        "SUI_TESTNET_RPC": process.env.SUI_TESTNET_RPC,
        "TON_TESTNET_RPC": process.env.TON_TESTNET_RPC
    };

    if (rpcs["BASE_URL (Base Testnet)"]) await checkEVM(rpcs["BASE_URL (Base Testnet)"], "BASE_URL");
    if (rpcs["AVALANCHFUJI_RPC"]) await checkEVM(rpcs["AVALANCHFUJI_RPC"], "AVALANCHFUJI_RPC");
    if (rpcs["ARBITRUN_TESTNET_RPC"]) await checkEVM(rpcs["ARBITRUN_TESTNET_RPC"], "ARBITRUN_TESTNET_RPC");
    
    if (rpcs["SOLANA_DEVNET_RPC"]) await checkSolana(rpcs["SOLANA_DEVNET_RPC"], "SOLANA_DEVNET_RPC");
    if (rpcs["SUI_TESTNET_RPC"]) await checkSui(rpcs["SUI_TESTNET_RPC"], "SUI_TESTNET_RPC");
    if (rpcs["TON_TESTNET_RPC"]) await checkTon(rpcs["TON_TESTNET_RPC"], "TON_TESTNET_RPC");

}

main().catch(console.error);
