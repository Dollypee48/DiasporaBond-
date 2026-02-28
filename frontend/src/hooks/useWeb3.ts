// useWeb3 Hook - Web3 Wallet Connection and State Management
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  connectWallet,
  isConnectedToCorrectNetwork,
  switchNetwork,
  getBalance,
  formatEther,
  getEthereumProvider,
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

  const updateBalance = useCallback(async (account: string) => {
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
        throw new Error("No Web3 wallet found. Install MetaMask or another Web3 wallet.");
      }

      providerRef.current = provider;
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

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

      await updateBalance(account);

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
      
      // attach wallet event listeners on the provider we connected with
      const rawProvider = (provider as any)._rawProvider;
      if (rawProvider && typeof rawProvider.on === "function") {
        const handleAccountsChanged = async (accounts: string[]) => {
          if (!accounts || accounts.length === 0) {
            // disconnected
            disconnect();
            return;
          }
          const newAccount = accounts[0];
          setState((prev) => ({ ...prev, account: newAccount, isConnected: true }));
          try {
            await updateBalance(newAccount);
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
              await updateBalance(state.account);
            } catch (e) {
              console.error(e);
            }
          }
        };

        rawProvider.on("accountsChanged", handleAccountsChanged);
        rawProvider.on("chainChanged", handleChainChanged);

        // keep a ref to cleanup listeners on disconnect/unmount
        (providerRef as any)._rawProvider = rawProvider;
        (providerRef as any)._listeners = { handleAccountsChanged, handleChainChanged };
      }
    } catch (error: any) {
      let message = "Failed to connect wallet";
      if (error?.code === 4001) {
        message = "Connection was rejected";
      } else if (error?.message?.toLowerCase().includes("metamask") || error?.message?.toLowerCase().includes("wallet")) {
        message = error.message;
      } else if (error?.message) {
        message = error.message;
      }
      setState((prev) => ({
        ...prev,
        error: message,
        isLoading: false,
      }));
    }
  }, [updateBalance]);

  const disconnect = useCallback(() => {
    // remove event listeners if present
    try {
      const rawProvider = (providerRef as any)._rawProvider;
      const listeners = (providerRef as any)._listeners;
      if (rawProvider && listeners && typeof rawProvider.removeListener === "function") {
        if (listeners.handleAccountsChanged) rawProvider.removeListener("accountsChanged", listeners.handleAccountsChanged);
        if (listeners.handleChainChanged) rawProvider.removeListener("chainChanged", listeners.handleChainChanged);
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
      const eth = getEthereumProvider();
      if (eth) {
        try {
          const accounts = await (eth as any).request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            if (manualDisconnectRef.current) return;
            // Do NOT auto-prompt the user. If accounts are already available
            // set a minimal connected state (no network switching or prompts).
            const acct = accounts[0];
            setState((prev) => ({ ...prev, account: acct, isConnected: true }));
            try {
              const provider = new ethers.BrowserProvider(eth as any);
              providerRef.current = provider;
              await updateBalance(acct);
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
        const rawProvider = (providerRef as any)._rawProvider;
        const listeners = (providerRef as any)._listeners;
        if (rawProvider && listeners && typeof rawProvider.removeListener === "function") {
          if (listeners.handleAccountsChanged) rawProvider.removeListener("accountsChanged", listeners.handleAccountsChanged);
          if (listeners.handleChainChanged) rawProvider.removeListener("chainChanged", listeners.handleChainChanged);
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
