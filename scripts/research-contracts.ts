import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const rpcZeta = "https://zetachain-athens.g.allthatnode.com/archive/evm";
  const rpcBsc = "https://bsc-testnet-rpc.publicnode.com";
  const rpcEth = "https://ethereum-sepolia-rpc.publicnode.com";

  const data = {
    zeta: { proxy: "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe" },
    bsc: { proxy: "0x4F528A41a17b8e9d49b1eE3DF66f5C28b6fDC7Fe" },
    ethereum: { proxy: "0x6B644A9Ed78f135A6c4C75A0788d8D02a58e335D" }
  };

  const providers = {
    zeta: new ethers.JsonRpcProvider(rpcZeta),
    bsc: new ethers.JsonRpcProvider(rpcBsc),
    ethereum: new ethers.JsonRpcProvider(rpcEth)
  };

  console.log("--- Contract Research ---");

  for (const [name, info] of Object.entries(data)) {
    try {
      const provider = (providers as any)[name];
      const code = await provider.getCode(info.proxy);
      console.log(`[${name}] Proxy: ${info.proxy}`);
      if (code === "0x") {
        console.log(`  Status: NOT DEPLOYED (No code)`);
      } else {
        console.log(`  Status: DEPLOYED (Code size: ${code.length / 2 - 1} bytes)`);
        
        // Try to call universal() or connected() to see what kind of contract it is
        const contract = new ethers.Contract(info.proxy, [
          "function universal() view returns (address)",
          "function name() view returns (string)",
          "function owner() view returns (address)"
        ], provider);

        try {
          const owner = await contract.owner();
          console.log(`  Owner:  ${owner}`);
        } catch {}

        try {
          const tokenName = await contract.name();
          console.log(`  Name:   ${tokenName}`);
        } catch {}

        try {
          const univ = await contract.universal();
          console.log(`  Universal: ${univ} (Likely EVMUniversalToken)`);
        } catch {
          console.log(`  Universal: Not found (Likely ZetaChainUniversalToken)`);
        }
      }
    } catch (e: any) {
      console.log(`[${name}] Error: ${e.message.split('\n')[0]}`);
    }
    console.log("");
  }
}

main().catch(console.error);
