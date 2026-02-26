# DiasporaBond: Tokenized Municipal Bonds on Creditcoin

![DiasporaBond](https://img.shields.io/badge/Hackathon-BUIDL%20CTC-blue) ![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🌍 Overview

**DiasporaBond** is a DeFi platform that tokenizes municipal infrastructure bonds on the Creditcoin blockchain, enabling **diaspora investors** to fund real-world infrastructure projects in emerging markets.

### Problem
- Infrastructure in African and emerging market cities faces severe funding gaps
- Traditional bond markets are inaccessible to diaspora communities
- Lack of transparency and trust in municipal lending

### Solution
- **Tokenized Bonds**: Municipal bonds as ERC-20 tokens on-chain
- **DAO Governance**: Community oversight of fund releases via voting
- **Milestone-Based Escrow**: Funds released only upon completion verification
- **Transparent Repayments**: On-chain yield distribution to investors
- **Optional Insurance**: Coverage pool for default protection

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Investor Wallet                           │
│                  (MetaMask / Web3Modal)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Frontend (React + TypeScript)                   │
│  - Home, Projects, Investor Dashboard, DAO Governance       │
│  - IPFS Document Upload & Display                           │
│  - Real-time Portfolio Tracking                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│        Smart Contracts (Creditcoin Testnet)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ BondToken              │ ProjectRegistry             │   │
│  │ - ERC20 bond token     │ - Project metadata          │   │
│  │ - Yield tracking       │ - Milestones               │   │
│  │ - Maturity checks      │ - IPFS references          │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ MilestoneEscrow        │ GovernanceDAO              │   │
│  │ - Fund holding         │ - Proposal creation        │   │
│  │ - Milestone release    │ - Voting mechanism         │   │
│  │ - Refund management    │ - Quorum enforcement       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ RepaymentManager       │ RevenueEngine              │   │
│  │ - Repayment schedules  │ - Issuance fees (2%)       │   │
│  │ - Yield distribution   │ - Servicing fees (1%)      │   │
│  │ - Default detection    │ - Treasury management      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ InsurancePool (Optional)                             │   │
│  │ - Premium collection (1.5%)                          │   │
│  │ - Claim management & payouts                         │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│    IPFS (Pinata / Web3.Storage)                             │
│    - Project documents & proofs                             │
│    - Milestone evidence                                     │
│    - Audit reports                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MetaMask or compatible Web3 wallet
- Creditcoin testnet (CTC) tokens for gas fees
- (Optional) Pinata account for IPFS

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/diaspora-bond.git
cd diaspora-bond
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
CREDITCOIN_RPC_URL=https://testnet-rpc.creditcoin.network/rpc
PRIVATE_KEY=your_private_key_here
```

### 4. Compile Contracts
```bash
npm run compile
```

### 5. Deploy to Creditcoin Testnet
```bash
npm run deploy
```

**Output:** `deployments.json` with all contract addresses

### 6. Update Frontend Configuration
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` with addresses from `deployments.json`:
```env
VITE_BOND_TOKEN_ADDRESS=0x...
VITE_PROJECT_REGISTRY_ADDRESS=0x...
# ... add other contract addresses
```

###7. Install Frontend Dependencies & Start Dev Server
```bash
npm install
npm run dev
```

Server runs at `http://localhost:5173`

---

## 📋 Smart Contracts

### 1. **BondToken.sol** (ERC-20)
- Represents tokenized municipal bonds
- Tracks yield percentage and maturity date
- Functions:
  - `mint(address, amount)`: Mint bonds for investors
  - `calculateYield(principal, startTime, endTime)`: Calculate accrued interest
  - `updateYield(newYield)`: Update annual yield

### 2. **ProjectRegistry.sol**
- Registers and tracks infrastructure projects
- Manages project metadata and IPFS references
- Stores milestone definitions and status
- Functions:
  - `createProject(...)`: Register new project
  - `addMilestone(...)`: Add project milestone
  - `completeMilestone(projectId, index)`: Mark milestone complete
  - `approveMilestone(projectId, index)`: DAO approves milestone

### 3. **MilestoneEscrow.sol**
- Holds investor funds in escrow
- Releases funds upon milestone approval
- Manages investor holdings and refunds
- Functions:
  - `depositFunds(projectId, amount)`: Investor buys bonds (deducts 2% fee)
  - `releaseFunds(projectId, milestoneIndex, amount)`: Release escrow to municipality

### 4. **GovernanceDAO.sol**
- DAO voting on milestone approvals
- Proposals created for each milestone completion
- Voting weight = bond token balance
- Functions:
  - `createProposal(...)`: Create milestone approval proposal
  - `vote(proposalId, voteType)`: Cast vote (0=against, 1=for, 2=abstain)
  - `finalizeProposal(proposalId)`: Check if passed (quorum + majority)
  - `executeProposal(proposalId)`: Execute after timelock

### 5. **RepaymentManager.sol**
- Manages repayment schedules (principal + interest)
- Distributes payments to bondholders proportionally
- Tracks defaults and overdue status
- Functions:
  - `createRepaymentSchedule(...)`: Setup monthly/yearly payments
  - `recordPayment(projectId, amount)`: Record municipality payment
  - `checkDefault(projectId)`: Detect project default
  - `getRepaymentProgress(projectId)`: Get completion %

### 6. **RevenueEngine.sol**
- Collects platform fees
- Manages treasury and DAO rewards
- Functions:
  - `collectIssuanceFee(projectId, amount)`: 2% on bond purchase
  - `collectServicingFee(projectId, amount)`: 1% on repayment
  - `withdrawTreasury(amount)`: Treasury withdrawal
  - `distributeDAOReward(recipient, amount)`: Reward governance participants

### 7. **InsurancePool.sol** (Optional)
- Optional default insurance coverage
- Covers up to 50% of bond value
- Functions:
  - `enableCoverage(projectId, coverageAmount)`: Enable insurance
  - `depositPremium(projectId, amount)`: Fund insurance (1.5% of coverage)
  - `fileClaim(projectId, amount, reason)`: File insurance claim
  - `approveClaim(claimId, amount)`: Approve payout

---

## 💰 Revenue Model

| Fee Type | Rate | On | Recipient |
|----------|------|-----|-----------|
| **Issuance** | 2% | Bond purchase | Treasury |
| **Servicing** | 1% | Repayments | Treasury |
| **Insurance** | 1.5% | Coverage premium | Insurance Pool |

**Example**: $100k project
- Issuance: $2,000 → Treasury
- Monthly repayment: $10k principal + $833 interest
- Servicing: $108 → Treasury
- Insurance (if enabled): $750 → Pool

---

## 🎯 Example Scenario: Lagos Water Bond

**Project ID**: 0
**Name**: Lagos Water Infrastructure Bond 2024
**Target**: 100 tokens ($100k USD equivalent)
**Yield**: 10% annual
**Duration**: 12 months

### Milestones
1. **Design & Planning** (30 days) → 25% of funds
2. **Build Infrastructure** (90 days) → 50% of funds
3. **Operations Launch** (120 days) → 25% of funds

### Flow
```
Day 1:   Investor A deposits 100 tokens
         - Bond amount: 98 tokens (2% issuance fee)
         - Treasury: +2 tokens
         - Escrow balance: 98 tokens

Day 30:  Municipality marks Milestone 1 complete
         - DAO proposal created
         - Investors vote for 5 days
         - Quorum reached, 75% approve
         - 25 tokens released to municipality
         - Repayment 1/12 recorded: ~$10k + interest

Day 60:  Investor A yields start accruing
         - Yield at 30 days: ~$833

Day 365: Final repayment
         - Investor A receives full principal + yield
         - Insurance claim (if needed) processed
```

---

## 🔧 Running Tests

```bash
npm run test
```

Tests cover:
- ✅ BondToken minting, burning, yield calculation
- ✅ ProjectRegistry creation and milestones
- ✅ MilestoneEscrow deposits and fund release
- ✅ GovernanceDAO proposals and voting
- ✅ RepaymentManager schedules and distributions
- ✅ RevenueEngine fee collection
- ✅ InsurancePool coverage and claims
- ✅ Full end-to-end integration flow

---

## 📚 API Documentation

See `docs/API.md` for complete smart contract function reference.

---

## 📖 Documentation

- **[Technical Whitepaper](./docs/WHITEPAPER.md)** - Deep dive into architecture, governance, risk analysis
- **[Example Scenario](./docs/EXAMPLE_SCENARIO.md)** - Step-by-step walkthrough of complete platform flow
- **[API Reference](./docs/API.md)** - Complete contract function signatures

---

## 🏠 Frontend Pages

### Pages
- **Home** (`/`) - Landing page, project highlights, call-to-action
- **Projects** (`/projects`) - Browse all available bond projects
- **Investor Dashboard** (`/investor`) - Portfolio, yield tracking, holdings
- **Municipality Dashboard** (`/municipality`) - Project management, milestone tracking
- **Governance** (`/governance`) - DAO proposals, voting, results

### Key Features
- Real-time Web3 wallet connection (MetaMask)
- Live project filtering & search
- Portfolio analytics with charts
- Instant yield calculations
- Proposal voting interface
- IPFS document preview (PDFs, images)
- Transaction status tracking
- Gas estimation before submission

---

## 🔐 Security Considerations

- **ReentrancyGuard**: All state-changing functions protected
- **Access Control**: Ownable patterns for admin functions
- **Input Validation**: All user inputs validated
- **Time-lock**: Proposals execute after delay period
- **Quorum Requirements**: Majority voting for spending

### Audit Recommendations
- Professional security audit before mainnet
- Formal verification of yield calculations
- Insurance pool solvency stress testing

---

## 🚢 Deployment Checklist

- [ ] All 7 contracts compile without errors
- [ ] Test suite passes (100% coverage)
- [ ] Deploy to Creditcoin testnet
- [ ] Verify addresses in block explorer
- [ ] Test wallet connection on frontend
- [ ] Create example project manually
- [ ] Run through full investment flow
- [ ] Test DAO voting/proposal flow
- [ ] Verify fee collection in treasury
- [ ] Test insurance claim (if enabled)
- [ ] Generate `deployments.json`
- [ ] Update frontend `.env.local`
- [ ] Test frontend with real contracts
- [ ] Take screenshots for demo

---

## 📁 Project Structure

```
diaspora-bond/
├── contracts/
│   ├── BondToken.sol
│   ├── ProjectRegistry.sol
│   ├── MilestoneEscrow.sol
│   ├── GovernanceDAO.sol
│   ├── RepaymentManager.sol
│   ├── RevenueEngine.sol
│   └── InsurancePool.sol
├── test/
│   └── DiasporaBond.test.js
├── scripts/
│   ├── deploy.js
│   └── generateABIs.js (optional)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Investor.tsx
│   │   │   ├── Municipality.tsx
│   │   │   └── Governance.tsx
│   │   ├── components/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── MilestoneCard.tsx
│   │   ├── hooks/
│   │   │   ├── useWeb3.ts
│   │   │   ├── useContract.ts
│   │   │   ├── useBalance.ts
│   │   │   └── useProjects.ts
│   │   ├── utils/
│   │   │   ├── contractABIs.ts
│   │   │   ├── ethersHelper.ts
│   │   │   ├── formatters.ts
│   │   │   └── constants.ts
│   │   ├── contracts/
│   │   │   └── (ABI files)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── WHITEPAPER.md
│   ├── API.md
│   └── EXAMPLE_SCENARIO.md
├── deployments.json (generated after deploy)
├── hardhat.config.js
├── package.json
├── .env.example
└── README.md
```

---

## 🛠️ Troubleshooting

### "No contract found" error
- Verify addresses in `.env.local` match `deployments.json`
- Check network is set to Creditcoin Testnet (Chain ID: 12391)

### MetaMask connection fails
- Ensure MetaMask is installed
- Check that network is properly configured in MetaMask
- Try refreshing page and connecting again

### Tests fail
- Clear cache: `npm run clean`
- Recompile: `npm run compile`
- Run again: `npm run test`

### Deployment fails
- Verify `.env` has valid `PRIVATE_KEY` and `CREDITCOIN_RPC_URL`
- Ensure account has CTC tokens for gas
- Check that `artifacts/` folder exists

---

## 📞 Support & Feedback

- GitHub Issues: Report bugs and feature requests
- Discussions: Questions and community support
- Email: team@diasporabond.io

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🏆 Credits

**Team**: DiasporaBond
**Hackathon**: BUIDL CTC 2024
**Blockchain**: Creditcoin Testnet
**Built With**: Solidity, React, TypeScript, Hardhat, Ethers.js

---

**Ready to Invest in African Infrastructure? Let's Build Together! 🌍💪**
