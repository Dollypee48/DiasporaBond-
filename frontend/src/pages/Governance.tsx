import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { formatDate, formatTimeRemaining } from '../utils/formatters';
import '../styles/pages.css';

const Governance: React.FC = () => {
  const { isConnected, account } = useWeb3();
  const [activeTab, setActiveTab] = useState<'active' | 'passed' | 'failed'>('active');

  // Proposals will be fetched from on-chain governance contracts via a hook.
  const mockProposals = { active: [], passed: [], failed: [] };

  if (!isConnected) {
    return (
      <div className="page governance-page">
        <div className="empty-state">
          <h2>🏛️ DAO Governance</h2>
          <p>Connect your wallet to participate in governance voting.</p>
          <button className="btn btn-primary">Connect Wallet</button>
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

      <div className="governance-tabs">
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Proposals ({mockProposals.active.length})
        </button>
        <button
          className={`tab ${activeTab === 'passed' ? 'active' : ''}`}
          onClick={() => setActiveTab('passed')}
        >
          Passed ({mockProposals.passed.length})
        </button>
        <button
          className={`tab ${activeTab === 'failed' ? 'active' : ''}`}
          onClick={() => setActiveTab('failed')}
        >
          Failed ({mockProposals.failed.length})
        </button>
      </div>

      <div className="proposals-list">
        {activeTab === 'active' && (
          <>
            {mockProposals.active.length === 0 ? (
              <div className="empty-state">
                <p>No active proposals found. Connect your wallet to load governance proposals.</p>
              </div>
            ) : (
              mockProposals.active.map((proposal) => (
                <div key={proposal.id} className="proposal-card">
                  {/* placeholder for on-chain proposal rendering */}
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'passed' && (
          <>
            {mockProposals.passed.map((proposal) => (
              <div key={proposal.id} className="proposal-card passed">
                <div className="proposal-header">
                  <h3>{proposal.title}</h3>
                  <span className="status-badge passed">✓ Passed</span>
                </div>

                <p className="proposal-description">{proposal.description}</p>
                <p className="proposal-project">📌 {proposal.projectName}</p>

                <div className="voting-summary">
                  <span className="vote-result">
                    {proposal.forVotes} For, {proposal.againstVotes} Against
                  </span>
                  {proposal.executed && (
                    <span className="executed-badge">✓ Executed</span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'failed' && (
          <>
            {mockProposals.failed.map((proposal) => (
              <div key={proposal.id} className="proposal-card failed">
                <div className="proposal-header">
                  <h3>{proposal.title}</h3>
                  <span className="status-badge failed">✗ Failed</span>
                </div>

                <p className="proposal-description">{proposal.description}</p>
                <p className="proposal-project">📌 {proposal.projectName}</p>

                <div className="voting-summary">
                  <span className="vote-result">
                    {proposal.forVotes} For, {proposal.againstVotes} Against
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
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
