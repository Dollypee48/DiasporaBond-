import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import '../styles/components.css';

const WalletConnect: React.FC = () => {
  const { account, isConnected, isCorrectNetwork, balance, connect, disconnect, isLoading, error } = useWeb3();
  const [showMenu, setShowMenu] = useState(false);
  const [availableInjected, setAvailableInjected] = useState<string[]>([]);

  React.useEffect(() => {
    // Detect available injected wallets in browser
    const injected: string[] = [];
    const eth = (window as any).ethereum;
    if (!eth) {
      setAvailableInjected([]);
      return;
    }

    // Some wallets expose `providers` array (multiple injected wallets)
    if (Array.isArray(eth.providers)) {
      for (const p of eth.providers) {
        if (p.isMetaMask) injected.push('MetaMask');
        else if (p.isCoinbaseWallet) injected.push('Coinbase Wallet');
        else if (p.isFrame) injected.push('Frame');
        else injected.push('Injected Wallet');
      }
    } else {
      // single injected provider
      if (eth.isMetaMask) injected.push('MetaMask');
      else if (eth.isCoinbaseWallet) injected.push('Coinbase Wallet');
      else injected.push('Injected Wallet');
    }

    setAvailableInjected(Array.from(new Set(injected)));
  }, []);

  if (!isConnected) {
    return (
      <div className="wallet-connect-cta">
        <div style={{ marginBottom: 8 }}>
          <strong>Connect Wallet</strong>
        </div>
        {availableInjected.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <small>Detected wallets:</small>
            <div>
              {availableInjected.map((w) => (
                <span key={w} className="wallet-badge">{w}</span>
              ))}
            </div>
          </div>
        )}
        <button
          className="btn btn-primary"
          onClick={connect}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Connecting...' : '🔗 Connect Wallet'}
        </button>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="network-warning">
        <p>⚠️ Wrong Network</p>
        <button className="btn btn-secondary btn-sm">
          Switch to Creditcoin
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <div className="wallet-info-display">
        <span className="account-display">
          {account?.slice(0, 6)}...{account?.slice(-4)}
        </span>
        <span className="balance-display">
          {parseFloat(balance).toFixed(2)} CTC
        </span>
      </div>

      <div className="wallet-menu-wrapper">
        <button
          className="wallet-menu-toggle"
          onClick={() => setShowMenu(!showMenu)}
        >
          ⋮
        </button>

        {showMenu && (
          <div className="wallet-dropdown">
            <div className="wallet-details">
              <p><strong>Account:</strong></p>
              <code>{account}</code>
            </div>
            <div className="wallet-details">
              <p><strong>Balance:</strong></p>
              <p>{parseFloat(balance).toFixed(4)} CTC</p>
            </div>
            <button
              className="btn btn-secondary btn-block"
              onClick={() => {
                disconnect();
                setShowMenu(false);
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="wallet-error">
          <p>⚠️ {error}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
