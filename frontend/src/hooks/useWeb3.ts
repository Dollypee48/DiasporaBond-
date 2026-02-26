// useWeb3 Hook - Web3 Wallet Connection and State Management
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  connectWallet,
  getCurrentAccount,
  isConnectedToCorrectNetwork,
  switchNetwork,
  getBalance,
  formatEther,
} from "../utils/ethersHelper";
import { NETWORK_CONFIG } from "../utils/constants";

interface Web3State {
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  balance: string;
  provider: ethers.BrowserProvider | null;
  isLoading: boolean;
  error: string | null;
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    account: null,
    isConnected: false,
    isCorrectNetwork: false,
    balance: "0",
    provider: null,
    isLoading: false,
    error: null,
  });

  const updateBalance = useCallback(async (account: string, provider: ethers.BrowserProvider) => {
    try {
      const balance = await getBalance(account);
      setState((prev) => ({
        ...prev,
        balance: formatEther(balance),
      }));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const provider = await connectWallet();

      if (!provider) {
        throw new Error("Failed to connect wallet");
      }

      const account = await getCurrentAccount();

      if (!account) {
        throw new Error("No account found");
      }

      const isCorrect = await isConnectedToCorrectNetwork();

      if (!isCorrect) {
        const switched = await switchNetwork();
        if (!switched) {
          throw new Error(`Please switch to ${NETWORK_CONFIG.networkName}`);
        }
      }

      await updateBalance(account, provider);

      setState((prev) => ({
        ...prev,
        account,
        isConnected: true,
        isCorrectNetwork: true,
        provider,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to connect",
        isLoading: false,
      }));
    }
  }, [updateBalance]);

  const disconnect = useCallback(() => {
    setState({
      account: null,
      isConnected: false,
      isCorrectNetwork: false,
      balance: "0",
      provider: null,
      isLoading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    // Check if already connected on mount
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts && accounts.length > 0) {
          await connect();
        }
      }
    };

    checkConnection();
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    updateBalance,
  };
}
