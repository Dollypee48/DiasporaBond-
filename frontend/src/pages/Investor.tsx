import React from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { formatUSD, formatPercentage, formatDate } from '../utils/formatters';
import '../styles/pages.css';

const Investor: React.FC = () => {
  const { isConnected, account } = useWeb3();

  // Mock data - will be replaced with real contract data
  const mockPortfolio = {
    totalInvested: 50000,
    currentValue: 54000,
    totalYield: 4000,
    activeProjects: 3,
    completedProjects: 1,
    holdings: [
      {
        id: 0,
        projectName: 'Lagos Water Infrastructure',
        amount: 10000,
        yieldEarned: 1000,
        status: 'In Progress',
        expectedReturn: 11000,
      },
      {
        id: 1,
        projectName: 'Accra Solar Power',
        amount: 15000,
        yieldEarned: 1200,
        status: 'In Progress',
        expectedReturn: 16200,
      },
      {
        id: 2,
        projectName: 'Cairo Sanitation System',
        amount: 12000,
        yieldEarned: 800,
        status: 'Completed',
        expectedReturn: 12800,
      },
      {
        id: 3,
        projectName: 'Kigali Transportation Network',
        amount: 13000,
        yieldEarned: 1000,
        status: 'In Progress',
        expectedReturn: 14000,
      },
    ],
  };

  if (!isConnected) {
    return (
      <div className="page investor-page">
        <div className="empty-state">
          <h2>💼 Investor Dashboard</h2>
          <p>Connect your wallet to view your portfolio and investments.</p>
          <button className="btn btn-primary">Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page investor-page">
      <div className="page-header">
        <h1>💼 My Investor Dashboard</h1>
        <p>Track your investments, yield, and returns across all projects</p>
      </div>

      <div className="portfolio-overview">
        <div className="overview-card">
          <h3>Total Invested</h3>
          <p className="value">{formatUSD(mockPortfolio.totalInvested)}</p>
          <p className="detail">Across {mockPortfolio.activeProjects + mockPortfolio.completedProjects} projects</p>
        </div>
        <div className="overview-card">
          <h3>Current Value</h3>
          <p className="value">{formatUSD(mockPortfolio.currentValue)}</p>
          <p className="detail">+{formatUSD(mockPortfolio.currentValue - mockPortfolio.totalInvested)}</p>
        </div>
        <div className="overview-card">
          <h3>Total Yield Earned</h3>
          <p className="value">{formatUSD(mockPortfolio.totalYield)}</p>
          <p className="detail">{formatPercentage((mockPortfolio.totalYield / mockPortfolio.totalInvested) * 100)}</p>
        </div>
        <div className="overview-card">
          <h3>Active Projects</h3>
          <p className="value">{mockPortfolio.activeProjects}</p>
          <p className="detail">{mockPortfolio.completedProjects} completed</p>
        </div>
      </div>

      <section className="holdings-section">
        <h2>Your Bond Holdings</h2>
        <div className="holdings-table">
          <div className="table-header">
            <div>Project</div>
            <div>Amount</div>
            <div>Yield Earned</div>
            <div>Status</div>
            <div>Expected Return</div>
          </div>
          {mockPortfolio.holdings.map((holding) => (
            <div key={holding.id} className="table-row">
              <div className="project-cell">
                <h4>{holding.projectName}</h4>
              </div>
              <div>{formatUSD(holding.amount)}</div>
              <div className="yield-cell">
                <span className="yield-value">{formatUSD(holding.yieldEarned)}</span>
              </div>
              <div>
                <span className={`status-pill status-${holding.status.toLowerCase()}`}>
                  {holding.status}
                </span>
              </div>
              <div>
                <strong>{formatUSD(holding.expectedReturn)}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="yield-tracker">
        <h2>Yield Projection</h2>
        <p>Based on 10% annual yield on active projects</p>
        <div className="projection-grid">
          <div className="projection-card">
            <h4>3 Months</h4>
            <p>{formatUSD(mockPortfolio.totalInvested * 0.1 * 0.25)}</p>
          </div>
          <div className="projection-card">
            <h4>6 Months</h4>
            <p>{formatUSD(mockPortfolio.totalInvested * 0.1 * 0.5)}</p>
          </div>
          <div className="projection-card">
            <h4>12 Months</h4>
            <p>{formatUSD(mockPortfolio.totalInvested * 0.1)}</p>
          </div>
        </div>
      </section>

      <cta className="investor-cta">
        <h3>Ready to Invest More?</h3>
        <a href="/projects" className="btn btn-primary">
          🔍 Browse More Projects
        </a>
      </cta>
    </div>
  );
};

export default Investor;
