import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";

dotenvConfig();

const DEFAULT_API_URL = "https://zetachain-athens.blockpi.network/lcd/v1/public";

type CrossChainTx = {
  cctx_status: {
    status: string;
    status_message: string;
    error_message?: string;
    error_message_abort?: string;
    error_message_revert?: string;
    isAbortRefunded?: boolean;
  };
  inbound_params: {
    sender_chain_id: string;
    observed_hash: string;
    sender: string;
    amount: string;
    asset: string;
    coin_type: string;
  };
  outbound_params: Array<{
    hash: string;
    receiver_chainId: string;
    receiver: string;
    amount: string;
  }>;
  index: string;
  relayed_message?: string;
};

function requireHash(value: string | undefined): string {
  if (!value) {
    throw new Error("CCTX hash is required");
  }

  const hash = value.trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    throw new Error(`CCTX hash must be a 0x-prefixed 32-byte hash, got: ${value}`);
  }

  return hash;
}

function parseTimeout(value: string | undefined): number {
  if (!value) {
    return 180;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`TIMEOUT_SECONDS must be a non-negative number, got: ${value}`);
  }

  return parsed;
}

async function fetchJson<T>(url: string): Promise<{ ok: boolean; status: number; data?: T }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const text = await response.text();
    let data: T | undefined;
    if (text) {
      data = JSON.parse(text) as T;
    }
    return { ok: response.ok, status: response.status, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCctxByHash(apiUrl: string, hash: string): Promise<CrossChainTx | undefined> {
  const result = await fetchJson<{ CrossChainTx?: CrossChainTx }>(`${apiUrl}/zeta-chain/crosschain/cctx/${hash}`);
  if (result.ok && result.data?.CrossChainTx) {
    return result.data.CrossChainTx;
  }
  return undefined;
}

async function fetchCctxByInboundHash(
  apiUrl: string,
  hash: string
): Promise<CrossChainTx[]> {
  const result = await fetchJson<{ CrossChainTxs?: CrossChainTx[] }>(
    `${apiUrl}/zeta-chain/crosschain/inboundHashToCctxData/${hash}`
  );

  if (result.ok && Array.isArray(result.data?.CrossChainTxs)) {
    return result.data.CrossChainTxs;
  }

  return [];
}

function printCctx(cctx: CrossChainTx): void {
  console.log(`CCTX ${cctx.index}`);
  console.log(`  status: ${cctx.cctx_status.status}`);
  console.log(`  status_message: ${cctx.cctx_status.status_message || "-"}`);
  console.log(`  sender_chain_id: ${cctx.inbound_params.sender_chain_id}`);
  console.log(`  receiver_chainId: ${cctx.outbound_params[0]?.receiver_chainId ?? "-"}`);
  console.log(`  outbound_tx_hash: ${cctx.outbound_params[0]?.hash || "pending"}`);
  console.log(`  sender: ${cctx.inbound_params.sender}`);
  console.log(`  recipient: ${cctx.outbound_params[0]?.receiver ?? "-"}`);
  console.log(`  amount: ${cctx.inbound_params.amount} ${cctx.inbound_params.coin_type}`);
  if (cctx.cctx_status.error_message) {
    console.log(`  error_message:`);
    console.log(cctx.cctx_status.error_message);
  }
  if (cctx.cctx_status.error_message_revert) {
    console.log(`  error_message_revert:`);
    console.log(cctx.cctx_status.error_message_revert);
  }
  if (cctx.cctx_status.error_message_abort) {
    console.log(`  error_message_abort:`);
    console.log(cctx.cctx_status.error_message_abort);
  }
}

async function main() {
  const hash = requireHash(process.argv[2] ?? process.env.CCTX_HASH ?? process.env.TX_HASH);
  const timeoutSeconds = parseTimeout(process.env.TIMEOUT_SECONDS);
  const apiUrl = (process.env.ZETA_API_URL ?? process.env.ZETA_CCTX_API_URL ?? DEFAULT_API_URL).trim();

  if (!apiUrl) {
    throw new Error("API URL is required");
  }

  console.log("Tracking CCTX");
  console.log(`  hash: ${hash}`);
  console.log(`  timeoutSeconds: ${timeoutSeconds}`);
  console.log(`  apiUrl: ${apiUrl}`);

  const deadline = Date.now() + timeoutSeconds * 1000;
  let discovered: CrossChainTx[] = [];

  while (Date.now() < deadline) {
    const direct = await fetchCctxByHash(apiUrl, hash);
    if (direct) {
      discovered = [direct];
      break;
    }

    const inbound = await fetchCctxByInboundHash(apiUrl, hash);
    if (inbound.length > 0) {
      discovered = inbound;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  if (discovered.length === 0) {
    console.log("No CCTX data was returned before timeout.");
    return;
  }

  console.log(`Discovered ${discovered.length} CCTX entr${discovered.length === 1 ? "y" : "ies"}.`);
  for (const cctx of discovered) {
    printCctx(cctx);

    const rpcZeta = (process.env.RPC_ZETACHAIN ?? process.env.ZETA_RPC_URL ?? "").trim();
    if (rpcZeta && ethers.isAddress(cctx.inbound_params.sender)) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcZeta);
        const balance = await provider.getBalance(cctx.inbound_params.sender);
        console.log(`  source_native_zeta_balance: ${ethers.formatEther(balance)} ZETA`);
      } catch (error) {
        console.log(`  source_native_zeta_balance: unavailable (${error instanceof Error ? error.message : error})`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
