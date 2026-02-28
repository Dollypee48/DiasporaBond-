// Ethers.js Helper Functions

import { ethers } from "ethers";
import { NETWORK_CONFIG, DECIMALS } from "./constants";

/**
 * Get the provider for the current network
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
}

/**
 * Get the EIP-1193 provider (handles multiple injected wallets)
 * When multiple wallets are installed, window.ethereum is often an aggregator
 * that delegates to the user's chosen wallet. Use it directly when it has request().
 */
export function getEthereumProvider(): unknown {
  if (typeof window === "undefined") return null;
  const w = window as any;
  let eth = w.ethereum;
  if (!eth) return null;
  // When multiple wallets inject, eth.providers is an array. The parent (eth) is
  // usually the aggregator with request() - prefer it. Only use a child provider
  // if the parent lacks request (e.g. old injection pattern).
  if (typeof (eth as any).request === "function") {
    return eth;
  }
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    // Try each provider until one has request()
    for (const p of eth.providers) {
      if (p && typeof p.request === "function") return p;
    }
  }
  return eth;
}

/**
 * Try to connect using a specific provider. Returns { provider, rawProvider } on success.
 */
async function tryConnectWithProvider(eth: any): Promise<{ provider: ethers.BrowserProvider; rawProvider: any } | null> {
  if (!eth || typeof eth.request !== "function") return null;
  try {
    await eth.request({ method: "eth_requestAccounts" });
    return { provider: new ethers.BrowserProvider(eth), rawProvider: eth };
  } catch (err: any) {
    // User rejected - don't try other providers
    if (err?.code === 4001) throw err;
    return null;
  }
}

/**
 * Connect to wallet and return provider.
 * Tries the main provider first, then each provider in the providers array
 * when multiple wallets are installed.
 */
export async function connectWallet(): Promise<ethers.BrowserProvider | null> {
  const w = window as any;
  const eth = w.ethereum;
  if (!eth) {
    console.error("No Web3 wallet found. Install MetaMask or another Web3 wallet.");
    return null;
  }

  // Try main provider first (aggregator or single wallet)
  let result = await tryConnectWithProvider(eth);
  if (result) {
    (result.provider as any)._rawProvider = result.rawProvider;
    return result.provider;
  }

  // Try each provider in the array when multiple wallets are installed
  if (Array.isArray(eth.providers)) {
    for (const p of eth.providers) {
      result = await tryConnectWithProvider(p);
      if (result) {
        (result.provider as any)._rawProvider = result.rawProvider;
        return result.provider;
      }
    }
  }

  // Last attempt with getEthereumProvider's selection
  const fallback = getEthereumProvider();
  result = await tryConnectWithProvider(fallback);
  if (result) {
    (result.provider as any)._rawProvider = result.rawProvider;
    return result.provider;
  }

  throw new Error(
    "Could not connect to any wallet. Try refreshing the page or ensuring your wallet extension is unlocked."
  );
}

/**
 * Get current connected account address
 */
export async function getCurrentAccount(): Promise<string | null> {
  try {
    const eth = getEthereumProvider();
    if (!eth) return null;
    const accounts: string[] = await (eth as any).request({ method: "eth_accounts" });
    if (!accounts || accounts.length === 0) return null;
    return accounts[0];
  } catch {
    return null;
  }
}

/**
 * Get balance of an account
 */
export async function getBalance(address: string): Promise<bigint> {
  const provider = getProvider();
  return provider.getBalance(address);
}

/**
 * Format Wei to Ether with custom decimals
 */
export function formatEther(value: string | bigint, decimals = DECIMALS): string {
  try {
    return ethers.formatUnits(value, decimals);
  } catch {
    return "0";
  }
}

/**
 * Parse Ether to Wei
 */
export function parseEther(value: string, decimals = DECIMALS): bigint {
  try {
    return ethers.parseUnits(value, decimals);
  } catch {
    return BigInt(0);
  }
}

/**
 * Shorten Ethereum address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Check if address is valid
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Wait for transaction to be mined
 */
export async function waitForTransaction(hash: string, confirmations = 1): Promise<ethers.TransactionReceipt | null> {
  const provider = getProvider();
  try {
    return await provider.waitForTransaction(hash, confirmations);
  } catch {
    return null;
  }
}

/**
 * Get contract instance
 */
export async function getContract(
  address: string,
  abi: ethers.InterfaceAbi,
  rpcOnly = true
): Promise<ethers.Contract> {
  if (rpcOnly) {
    const provider = getProvider();
    return new ethers.Contract(address, abi, provider);
  } else {
    const provider = await connectWallet();
    if (!provider) throw new Error("No wallet connected");

    const signer = await provider.getSigner();
    return new ethers.Contract(address, abi, signer);
  }
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  contract: ethers.Contract,
  method: string,
  args: any[]
): Promise<bigint | null> {
  try {
    return await contract[method].estimateGas(...args);
  } catch {
    return null;
  }
}

/**
 * Convert basis points to percentage
 */
export function basisPointsToPercentage(basisPoints: number): string {
  return (basisPoints / 100).toFixed(2);
}

/**
 * Convert percentage to basis points
 */
export function percentageToBasisPoints(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Calculate percentage of amount
 */
export function calculatePercentage(amount: bigint | string, percentage: number): bigint {
  const amountBig = typeof amount === "string" ? BigInt(amount) : amount;
  return (amountBig * BigInt(Math.round(percentage * 100))) / BigInt(10000);
}

/**
 * Get human readable error message
 */
export function getErrorMessage(error: any): string {
  if (error.reason) return error.reason;
  if (error.message) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

/**
 * Validate transaction response
 */
export async function validateTransaction(tx: ethers.TransactionResponse): Promise<boolean> {
  if (!tx) return false;
  const receipt = await tx.wait();
  return receipt?.status === 1;
}

/**
 * Get network details
 */
export async function getNetworkDetails(): Promise<ethers.Network | null> {
  const provider = getProvider();
  try {
    return await provider.getNetwork();
  } catch {
    return null;
  }
}

/**
 * Check if connected to correct network
 */
export async function isConnectedToCorrectNetwork(): Promise<boolean> {
  const network = await getNetworkDetails();
  if (!network) return false;
  return network.chainId === BigInt(NETWORK_CONFIG.chainId);
}

/**
 * Switch network (MetaMask)
 */
export async function switchNetwork(): Promise<boolean> {
  const eth = getEthereumProvider();
  if (!eth) return false;

  try {
    await (eth as any).request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
    });
    return true;
  } catch {
    // Network not added, try to add it
    return addNetworkToWallet();
  }
}

/**
 * Add network to MetaMask
 */
export async function addNetworkToWallet(): Promise<boolean> {
  const eth = getEthereumProvider();
  if (!eth) return false;

  try {
    await (eth as any).request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
          chainName: NETWORK_CONFIG.networkName,
          rpcUrls: [NETWORK_CONFIG.rpcUrl],
          nativeCurrency: {
            name: "Creditcoin",
            symbol: "CTC",
            decimals: 18,
          },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}
