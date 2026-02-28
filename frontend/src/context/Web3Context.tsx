import React, { createContext, useContext } from "react";
import { useWeb3 } from "../hooks/useWeb3";

type Web3ContextValue = ReturnType<typeof useWeb3>;

const Web3Context = createContext<Web3ContextValue | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const web3 = useWeb3();
  return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>;
};

export const useWeb3Context = (): Web3ContextValue => {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error("useWeb3Context must be used within a Web3Provider");
  }
  return ctx;
};

