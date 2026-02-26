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
 * Connect to wallet and return signer
 */
export async function connectWallet(): Promise<ethers.BrowserProvider | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    console.error("MetaMask not found");
    return null;
  }

  try {
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Get provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return null;
  }
}

/**
 * Get current connected account address
 */
export async function getCurrentAccount(): Promise<string | null> {
  const provider = await connectWallet();
  if (!provider) return null;

  try {
    const signer = await provider.getSigner();
    return signer.address;
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
  return network?.chainId === NETWORK_CONFIG.chainId;
}

/**
 * Switch network (MetaMask)
 */
export async function switchNetwork(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
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
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
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
