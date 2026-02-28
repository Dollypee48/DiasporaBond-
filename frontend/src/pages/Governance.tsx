import React from 'react';
import { useWeb3Context } from '../context/Web3Context';
import '../styles/pages.css';

const Governance: React.FC = () => {
  const { isConnected, connect } = useWeb3Context();

  if (!isConnected) {
    return (
      <div className="page governance-page">
        <div className="empty-state">
          <h2>DAO Governance</h2>
          <p>Connect your wallet to participate in milestone approvals, fund releases, and protocol upgrades.</p>
          <button className="btn btn-primary" onClick={connect}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page governance-page">
      <div className="page-header">
        <h1>🏛️ DAO Governance</h1>
        <p>Vote on project milestones and fund releases. Your voice matters.</p>
      </div>

      <section className="governance-info">
        <h2>How Governance Works</h2>
        <div className="info-grid">
          <div className="info-card">
            <h4>🗳️ Voting</h4>
            <p>Every bond token = 1 vote. Vote on milestone approvals and fund releases.</p>
          </div>
          <div className="info-card">
            <h4>📊 Quorum</h4>
            <p>50% of all bond tokens must vote for a proposal to be valid.</p>
          </div>
          <div className="info-card">
            <h4>⏱️ Time-Lock</h4>
            <p>Approved proposals execute after 1-day delay for security.</p>
          </div>
          <div className="info-card">
            <h4>💚 Impact</h4>
            <p>Your vote ensures funds are released only when milestones are complete.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Governance;
