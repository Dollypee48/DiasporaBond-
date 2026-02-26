import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useWeb3 } from './hooks/useWeb3';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Investor from './pages/Investor';
import Municipality from './pages/Municipality';
import Governance from './pages/Governance';
import WalletConnect from './components/WalletConnect';
import './App.css';

function App() {
  const { account, isConnected, balance, connect, disconnect } = useWeb3();

  return (
    <Router>
      <div className="app-wrapper">
        {/* Header Navigation */}
        <header className="navbar">
          <div className="navbar-container">
            <div className="navbar-brand">
              <h1>💚 DiasporaBond</h1>
              <p className="tagline">Tokenized Infrastructure for Africa</p>
            </div>

            <nav className="nav-links">
              <a href="/" className="nav-link">Home</a>
              <a href="/projects" className="nav-link">Projects</a>
              <a href="/investor" className="nav-link">Investor</a>
              <a href="/municipality" className="nav-link">Municipality</a>
              <a href="/governance" className="nav-link">Governance</a>
            </nav>

            <div className="navbar-actions">
              {isConnected ? (
                <div className="wallet-info">
                  <span className="account">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                  <span className="balance">
                    {parseFloat(balance).toFixed(2)} CTC
                  </span>
                  <button className="btn btn-secondary" onClick={disconnect}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={connect}>
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/investor" element={<Investor />} />
            <Route path="/municipality" element={<Municipality />} />
            <Route path="/governance" element={<Governance />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2024 DiasporaBond - Tokenized Municipal Bonds on Creditcoin</p>
            <p>Building infrastructure through blockchain transparency</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
