import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { formatDate, formatTimeRemaining } from '../utils/formatters';
import '../styles/pages.css';

const Governance: React.FC = () => {
  const { isConnected, account } = useWeb3();
  const [activeTab, setActiveTab] = useState<'active' | 'passed' | 'failed'>('active');

  // Mock data - will be replaced with real contract data
  const mockProposals = {
    active: [
      {
        id: 0,
        title: 'Approve Lagos Water Milestone 1: Design Complete',
        description: 'All deliverables met: design documents, permits, contractor bids',
        projectName: 'Lagos Water Infrastructure',
        endTime: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60,
        forVotes: 75,
        againstVotes: 20,
        abstainVotes: 5,
        totalVotes: 100,
        quorum: 50,
      },
      {
        id: 1,
        title: 'Approve Accra Solar Phase 2 Funds Release',
        description: 'Construction 50% complete with photographic evidence',
        projectName: 'Accra Solar Power',
        endTime: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60,
        forVotes: 120,
        againstVotes: 10,
        abstainVotes: 15,
        totalVotes: 145,
        quorum: 80,
      },
    ],
    passed: [
      {
        id: 2,
        title: 'Approve Lagos Water Milestone 1: Design Complete',
        description: 'Approved on 2024-02-15',
        projectName: 'Lagos Water Infrastructure',
        executed: true,
        forVotes: 95,
        againstVotes: 5,
        totalVotes: 100,
      },
    ],
    failed: [
      {
        id: 3,
        title: 'Reject Nairobi Water Project - Insufficient Safety Certifications',
        description: 'Community vote rejected project due to missing safety docs',
        projectName: 'Nairobi Water Network',
        forVotes: 45,
        againstVotes: 110,
        totalVotes: 155,
      },
    ],
  };

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
            {mockProposals.active.map((proposal) => (
              <div key={proposal.id} className="proposal-card">
                <div className="proposal-header">
                  <h3>{proposal.title}</h3>
                  <span className="voting-status">
                    {formatTimeRemaining(proposal.endTime)}
                  </span>
                </div>

                <p className="proposal-description">{proposal.description}</p>
                <p className="proposal-project">📌 {proposal.projectName}</p>

                <div className="voting-section">
                  <div className="votes-display">
                    <div className="vote-item">
                      <span className="vote-label">For</span>
                      <div className="vote-bar for-votes">
                        <div
                          className="vote-fill"
                          style={{
                            width: `${(proposal.forVotes / proposal.totalVotes) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="vote-count">
                        {proposal.forVotes} ({Math.round((proposal.forVotes / proposal.totalVotes) * 100)}%)
                      </span>
                    </div>

                    <div className="vote-item">
                      <span className="vote-label">Against</span>
                      <div className="vote-bar against-votes">
                        <div
                          className="vote-fill"
                          style={{
                            width: `${(proposal.againstVotes / proposal.totalVotes) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="vote-count">
                        {proposal.againstVotes} ({Math.round((proposal.againstVotes / proposal.totalVotes) * 100)}%)
                      </span>
                    </div>

                    {proposal.abstainVotes > 0 && (
                      <div className="vote-item">
                        <span className="vote-label">Abstain</span>
                        <span className="vote-count">{proposal.abstainVotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="quorum-info">
                    <p>Quorum: {proposal.totalVotes} / {proposal.quorum} ({Math.round((proposal.totalVotes / proposal.quorum) * 100)}%)</p>
                  </div>
                </div>

                <div className="voting-actions">
                  <button className="btn btn-success">✓ Vote For</button>
                  <button className="btn btn-danger">✗ Vote Against</button>
                  <button className="btn btn-secondary">⊝ Abstain</button>
                </div>
              </div>
            ))}
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
