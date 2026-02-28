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
import { useRef } from "react";
import { NETWORK_CONFIG } from "../utils/constants";

interface Web3State {
  account: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  balance: string;
  provider: ethers.BrowserProvider | null;
  isLoading: boolean;
  error: string | null;
  manuallyDisconnected?: boolean;
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
    manuallyDisconnected: false,
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

  const providerRef = useRef<ethers.BrowserProvider | null>(null);
  const manualDisconnectRef = useRef(false);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const provider = await connectWallet();

      if (!provider) {
        throw new Error("Failed to connect wallet");
      }

      providerRef.current = provider;
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
        manuallyDisconnected: false,
      }));
      manualDisconnectRef.current = false;
      
      // attach wallet event listeners
      if (typeof window !== "undefined" && (window as any).ethereum && (window as any).ethereum.on) {
        const eth = (window as any).ethereum;

        const handleAccountsChanged = async (accounts: string[]) => {
          if (!accounts || accounts.length === 0) {
            // disconnected
            disconnect();
            return;
          }
          const newAccount = accounts[0];
          setState((prev) => ({ ...prev, account: newAccount, isConnected: true }));
          try {
            await updateBalance(newAccount, providerRef.current as any);
          } catch (e) {
            console.error(e);
          }
        };

        const handleChainChanged = async (_chainId: string) => {
          // reload balances and network status
          const correct = await isConnectedToCorrectNetwork();
          setState((prev) => ({ ...prev, isCorrectNetwork: correct }));
          if (state.account) {
            try {
              await updateBalance(state.account, providerRef.current as any);
            } catch (e) {
              console.error(e);
            }
          }
        };

        eth.on("accountsChanged", handleAccountsChanged);
        eth.on("chainChanged", handleChainChanged);

        // keep a ref to cleanup listeners on disconnect/unmount
        (providerRef as any)._listeners = { handleAccountsChanged, handleChainChanged };
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to connect",
        isLoading: false,
      }));
    }
  }, [updateBalance]);

  const disconnect = useCallback(() => {
    // remove event listeners if present
    try {
      const eth = (window as any).ethereum;
      const listeners = (providerRef as any)._listeners;
      if (eth && listeners) {
        if (listeners.handleAccountsChanged) eth.removeListener("accountsChanged", listeners.handleAccountsChanged);
        if (listeners.handleChainChanged) eth.removeListener("chainChanged", listeners.handleChainChanged);
      }
    } catch (e) {
      // ignore
    }

    providerRef.current = null;
    manualDisconnectRef.current = true;

    setState({
      account: null,
      isConnected: false,
      isCorrectNetwork: false,
      balance: "0",
      provider: null,
      isLoading: false,
      error: null,
      manuallyDisconnected: true,
    });
  }, []);

  useEffect(() => {
    // Check if already connected on mount
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            if (manualDisconnectRef.current) return;
            // Do NOT auto-prompt the user. If accounts are already available
            // set a minimal connected state (no network switching or prompts).
            const acct = accounts[0];
            setState((prev) => ({ ...prev, account: acct, isConnected: true }));
            try {
              const provider = await connectWallet();
              providerRef.current = provider;
              await updateBalance(acct, provider);
            } catch (e) {
              // ignore — we won't force prompts on mount
            }
          }
        } catch (e) {
          console.warn("Error checking existing accounts:", e);
        }
      }
    };

    checkConnection();

    return () => {
      // cleanup listeners on unmount
      try {
        const eth = (window as any).ethereum;
        const listeners = (providerRef as any)._listeners;
        if (eth && listeners) {
          if (listeners.handleAccountsChanged) eth.removeListener("accountsChanged", listeners.handleAccountsChanged);
          if (listeners.handleChainChanged) eth.removeListener("chainChanged", listeners.handleChainChanged);
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    updateBalance,
  };
}
