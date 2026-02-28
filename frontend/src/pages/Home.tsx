import React from 'react';
import { useProjects } from '../hooks/useProjects';
import { formatUSD, formatNumber } from '../utils/formatters';
import '../styles/pages.css';

const Home: React.FC = () => {
  const { projects, totalProjects } = useProjects();

  const totalRaised = projects.reduce((sum, p) => {
    const raised = typeof p.raisedAmount === 'string'
      ? parseFloat(p.raisedAmount)
      : Number(p.raisedAmount);
    return sum + raised;
  }, 0);

  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Fund African Infrastructure Through Blockchain</h1>
          <p>
            DiasporaBond connects diaspora communities and global investors to
            real-world infrastructure projects in emerging markets. Transparent,
            secure, and profitable.
          </p>
          <div className="hero-buttons">
            <a href="/projects" className="btn btn-primary btn-lg">
              📊 Explore Projects
            </a>
            <a href="/investor" className="btn btn-secondary btn-lg">
              💼 My Portfolio
            </a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <h3>{formatNumber(totalProjects)}</h3>
            <p>Active Projects</p>
          </div>
          <div className="stat-card">
            <h3>{formatUSD(totalRaised)}</h3>
            <p>Capital Raised</p>
          </div>
          <div className="stat-card">
            <h3>10%</h3>
            <p>Average Yield</p>
          </div>
          <div className="stat-card">
            <h3>150+</h3>
            <p>Global Investors</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Choose a Project</h3>
            <p>Browse tokenized municipal bonds financing real infrastructure in Africa.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Invest & Earn</h3>
            <p>Purchase bond tokens. Earn yield as municipalities repay capital + interest.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>DAO Governance</h3>
            <p>Vote on milestone approvals. Ensure funds are released only upon completion.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Transparent Tracking</h3>
            <p>Real-time IPFS-based proof of construction progress and repayment status.</p>
          </div>
        </div>
      </section>

      {/* Featured Projects CTA */}
      <section className="featured-projects">
        <h2>Live Infrastructure Opportunities</h2>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>Projects will appear here once municipalities launch bond offerings on-chain.</p>
            <a href="/projects" className="btn btn-primary btn-lg">
              View Projects
            </a>
          </div>
        ) : (
          <div className="empty-state">
            <p>Browse all active bond offerings and deep-dive into project details.</p>
            <a href="/projects" className="btn btn-primary btn-lg">
              View Projects
            </a>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why DiasporaBond?</h2>
        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">🔐</span>
            <h3>Secure by Design</h3>
            <p>Smart contracts audited, multi-signature controls, insurance pool for defaults.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🌍</span>
            <h3>Global Accessibility</h3>
            <p>Invest from anywhere with a Web3 wallet. No geographic restrictions.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">💰</span>
            <h3>Real Returns</h3>
            <p>10% annual yields backed by productive infrastructure, not speculation.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Full Transparency</h3>
            <p>Track every dollar on-chain. IPFS proofs of construction and repayment.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🏛️</span>
            <h3>Community Governance</h3>
            <p>DAO voting controls fund release. Your voice matters in every project.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">💚</span>
            <h3>Real Impact</h3>
            <p>Build water systems, roads, electricity for millions. Invest in Africa's future.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Start investing in African infrastructure today—secured by blockchain and governance.</p>
          <a href="/projects" className="btn btn-primary btn-lg">
            Start Investing
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
