import React, { useState } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { switchNetwork } from '../utils/ethersHelper';
import '../styles/components.css';

const WalletConnect: React.FC = () => {
  const { account, isConnected, isCorrectNetwork, balance, connect, disconnect, isLoading, error } = useWeb3Context();
  const [showMenu, setShowMenu] = useState(false);

  if (!isConnected) {
    return (
      <div className="wallet-connect-cta">
        <button
          className="btn btn-primary"
          onClick={connect}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error && (
          <p className="wallet-connect-error">{error}</p>
        )}
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="network-warning">
        <p>⚠️ Wrong Network</p>
        <button
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            try {
              await switchNetwork();
            } catch {
              // swallow, error will be reflected via hook if needed
            }
          }}
        >
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
