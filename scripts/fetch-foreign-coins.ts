import axios from "axios";

async function main() {
  const urls = [
    "https://zetachain-athens.g.allthatnode.com/archive/rest/zeta-chain/fungible/foreign_coins",
    "https://zetachain-athens.cosmos.directory/zeta-chain/fungible/foreign_coins"
  ];

  console.log("=========================================");
  console.log("🔍 Fetching ZetaChain Athens-3 Foreign Coins");
  console.log("=========================================");

  for (const url of urls) {
    try {
      console.log(`Trying endpoint: ${url}...`);
      const response = await axios.get(url, { timeout: 10000 });
      if (response.data && response.data.foreignCoins) {
        console.log(`\n✅ Success from ${url}!\n`);
        const coins = response.data.foreignCoins;
        for (const coin of coins) {
          // Cosmos REST uses snake_case keys in JSON response:
          const name = coin.name;
          const symbol = coin.symbol;
          const address = coin.zrc20_contract_address || coin.zrc20ContractAddress;
          const decimals = coin.decimals;
          const chainId = coin.foreign_chain_id || coin.foreignChainId;
          const coinType = coin.coin_type || coin.coinType;
          const paused = coin.paused !== undefined ? coin.paused : "unknown";

          console.log(`- Asset:    ${name} (${symbol})`);
          console.log(`  ZRC-20:   ${address}`);
          console.log(`  Decimals: ${decimals}`);
          console.log(`  Chain ID: ${chainId}`);
          console.log(`  Coin Type: ${coinType}`);
          console.log(`  Paused:    ${paused}`);
          console.log("-----------------------------------------");
        }
        return;
      }
    } catch (e: any) {
      console.log(`❌ Failed: ${e.message}`);
    }
  }
  console.log("\nCould not fetch foreign coins from any public rest endpoints.");
}

main().catch(console.error);
