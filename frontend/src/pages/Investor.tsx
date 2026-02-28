import React from 'react';
import { useWeb3Context } from '../context/Web3Context';
import { useProjects } from '../hooks/useProjects';
import { getContract } from '../utils/ethersHelper';
import { CONTRACT_ABIS } from '../contracts/contractABIs';
import { formatUSD, formatPercentage } from '../utils/formatters';
import '../styles/pages.css';

const Investor: React.FC = () => {
  const { isConnected: web3Connected, account, connect } = useWeb3Context();
  const { projects } = useProjects();

  const [portfolio, setPortfolio] = React.useState<any>({
    totalInvested: 0,
    currentValue: 0,
    totalYield: 0,
    activeProjects: 0,
    completedProjects: 0,
    holdings: [],
  });

  React.useEffect(() => {
    async function buildPortfolio() {
      if (!account || !projects) return;

      let totalInvested = 0;
      let currentValue = 0;
      let totalYield = 0;
      const holdings: any[] = [];

      for (const p of projects) {
        try {
          // For each project try to read the bond token balance for the current account
          const bondAddress = p.bondTokenAddress;
          if (!bondAddress) {
            holdings.push({ id: p.id, projectName: p.name, amount: 0, yieldEarned: 0, status: 'N/A', expectedReturn: 0 });
            continue;
          }

          const bondContract = await getContract(bondAddress, CONTRACT_ABIS.BondToken, true);
          const balance = await bondContract.balanceOf(account);
          const invested = Number(balance ?? 0);

          // naive currentValue / yield estimates — replace with accurate calculations as needed
          const expectedReturn = invested * (1 + (p.yieldPercentage || 0) / 100);
          const yieldEarned = expectedReturn - invested;

          totalInvested += invested;
          currentValue += expectedReturn;
          totalYield += yieldEarned;

          holdings.push({
            id: p.id,
            projectName: p.name,
            amount: invested,
            yieldEarned,
            status: p.status === 0 ? 'In Progress' : 'Completed',
            expectedReturn,
          });
        } catch (err) {
          holdings.push({ id: p.id, projectName: p.name, amount: 0, yieldEarned: 0, status: 'N/A', expectedReturn: 0 });
        }
      }

      const activeProjects = holdings.filter((h) => h.status === 'In Progress').length;
      const completedProjects = holdings.filter((h) => h.status === 'Completed').length;

      setPortfolio({ totalInvested, currentValue, totalYield, activeProjects, completedProjects, holdings });
    }

    buildPortfolio();
  }, [account, projects]);

  if (!web3Connected) {
    return (
      <div className="page investor-page">
        <div className="empty-state">
          <h2>Investor Dashboard</h2>
          <p>Connect your wallet to view your on-chain bond holdings, yield, and total portfolio value.</p>
          <button className="btn btn-primary" onClick={connect}>
            Connect Wallet
          </button>
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
          <p className="value">{formatUSD(portfolio.totalInvested)}</p>
          <p className="detail">Across {portfolio.activeProjects + portfolio.completedProjects} projects</p>
        </div>
        <div className="overview-card">
          <h3>Current Value</h3>
          <p className="value">{formatUSD(portfolio.currentValue)}</p>
          <p className="detail">+{formatUSD(portfolio.currentValue - portfolio.totalInvested)}</p>
        </div>
        <div className="overview-card">
          <h3>Total Yield Earned</h3>
          <p className="value">{formatUSD(portfolio.totalYield)}</p>
          <p className="detail">{portfolio.totalInvested ? formatPercentage((portfolio.totalYield / portfolio.totalInvested) * 100) : '—'}</p>
        </div>
        <div className="overview-card">
          <h3>Active Projects</h3>
          <p className="value">{portfolio.activeProjects}</p>
          <p className="detail">{portfolio.completedProjects} completed</p>
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
          {portfolio.holdings.map((holding: any) => (
            <div key={holding.id} className="table-row">
              <div className="project-cell">
                <h4>{holding.projectName}</h4>
              </div>
              <div>{formatUSD(holding.amount)}</div>
              <div className="yield-cell">
                <span className="yield-value">{formatUSD(holding.yieldEarned)}</span>
              </div>
              <div>
                <span className={`status-pill status-${String(holding.status).toLowerCase()}`}>
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
            <p>{formatUSD((portfolio.totalInvested || 0) * 0.1 * 0.25)}</p>
          </div>
          <div className="projection-card">
            <h4>6 Months</h4>
            <p>{formatUSD((portfolio.totalInvested || 0) * 0.1 * 0.5)}</p>
          </div>
          <div className="projection-card">
            <h4>12 Months</h4>
            <p>{formatUSD((portfolio.totalInvested || 0) * 0.1)}</p>
          </div>
        </div>
      </section>

      <section className="investor-cta">
        <h3>Ready to Invest More?</h3>
        <a href="/projects" className="btn btn-primary">
          🔍 Browse More Projects
        </a>
      </section>
    </div>
  );
};

export default Investor;
