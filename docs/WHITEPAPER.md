# DiasporaBond: Technical Whitepaper (Summary)

This short whitepaper explains the goals, core mechanics, and architecture of DiasporaBond in plain language. It is a practical summary for engineers, product owners, and early reviewers.

## Vision

DiasporaBond makes it easy for diaspora and international investors to fund vetted municipal projects by tokenizing bond issuance, protecting funds with milestone escrow, and letting token holders vote on fund releases.

## How it works (high level)

1. Municipality registers a project and defines milestones with deliverables.
2. Investors deposit funds to buy bond tokens; a small issuance fee is collected.
3. Funds are held in a MilestoneEscrow contract until evidence for a milestone is uploaded to IPFS.
4. A DAO proposal is created to release the milestone funds; token holders vote.
5. If the proposal passes, escrow releases funds to the municipality; repayments and yield distribution are handled by RepaymentManager.
6. Optional InsurancePool can cover part of losses if project defaults.

## Core components

- BondToken (ERC-20): represents investor ownership; tracks yield and maturity.
- ProjectRegistry: stores project metadata and milestone definitions (with IPFS references).
- MilestoneEscrow: holds investor funds and releases them on approved milestones.
- GovernanceDAO: proposal/voting system; voting weight = token balance.
- RepaymentManager: schedules and distributes repayments to token holders.
- RevenueEngine: collects fees (issuance, servicing) and manages treasury.
- InsurancePool (optional): premium collection and claim payouts.

## Economic assumptions & fees

- Issuance fee: 2% (collected on bond purchases)
- Servicing fee: 1% (collected on repayments)
- Insurance premium: 1.5% (if enabled)

These fees fund platform operations and the treasury.

## Governance and safety

- Voting: token-weighted voting for release of milestone funds.
- Quorum and majority thresholds should be configured conservatively (e.g., 30–50% quorum).
- Time-locks delay execution to allow community review.
- All proofs (reports, photos) are stored on IPFS and referenced on-chain.

## Risk considerations

- Off-chain risk: project execution, fraud, regulatory issues — mitigated by rigorous off-chain due diligence and mandatory documentation.
- Smart contract risk: reentrancy, access control, overflow — mitigated via OpenZeppelin patterns and testing. Recommend professional audit prior to mainnet.
- Liquidity risk: tokens may be illiquid until secondary markets form — consider integrating DEX listings or buyback mechanisms.

## Implementation notes

- Solidity 0.8.x with OpenZeppelin libraries used for safety.
- Hardhat is used for compilation, testing, and deployment.
- Frontend: React + Vite + Ethers.js (v6 patterns).
- IPFS used for document storage; pinning service recommended (Pinata/Web3.Storage).

## Next steps (recommended)

1. Formal security audit of all contracts.
2. Add insurance underwriting rules and capital sufficiency checks.
3. Integrate a faucet or testnet onboarding flow for users.
4. Add off-chain oracles for verification where needed (optional).

This summary is intended as a compact reference. For full technical details and API signatures, see the contract sources in `contracts/` and the longer docs in `docs/`.
// Investor deposits 100 tokens for Lagos Water Bond (Project 0)
bondToken.approve(milestoneEscrow, 100);
milestoneEscrow.depositFunds(projectId=0, amount=100);

// Internally:
// 1. Calculate issuance fee: 100 * 2% = 2 tokens
// 2. Bond amount: 100 - 2 = 98 tokens
// 3. revenueEngine.collect IssuanceFee(0, 2) → Treasury
// 4. escrowAccounts[keccak256(0, investor, timestamp)] created
// 5. investorHoldings[0][investor] = 98
// 6. projectEscrowBalance[0] += 98
```

#### Milestone Release Flow
```solidity
// Municipality marks milestone complete
projectRegistry.completeMilestone(projectId=0, milestoneIndex=0);

// Create DAO proposal for fund release
governanceDAO.createProposal(
    projectId=0,
    milestoneIndex=0,
    "Release Design Phase Funds",
    "Design complete, IPFS: QmHash123",
    municipalityAddress,
    25 tokens // Amount to release
);

// Investors vote (3-day period)
governanceDAO.vote(proposalId=0, voteType=1); // 1 = for

// After voting ends, check if passed (quorum + majority)
// If passed and 1 day timelock expired:
governanceDAO.executeProposal(proposalId=0);

// Internally:
// 1. Check: forVotes > againstVotes
// 2. Check: totalVotes >= quorum (50% of totalSupply)
// 3. Release funds: milestoneEscrow.releaseFunds(0, 0, 25)
projectEscrowBalance[0] -= 25
// 4. Servicing fee: revenueEngine.collectServicingFee(0, 25)
//    25 * 1% = 0.25 tokens → Treasury
// 5. Transfer 24.75 to municipality
// 6. Record repayment for yield distribution
```

#### Yield Distribution Flow
```solidity
// After 6 months, investor has earned yield
yieldPercentage = 1000 (10% annual)
principal = 98 tokens
duration = 6 months (180 days)
yield = 98 * (1000/10000) * (180/365) ≈ 4.85 tokens

// When municipality repays:
repaymentManager.recordPayment(projectId=0, principalAmount=49, interestAmount=4.85);

// Internally:
// 1. investorRepayments[0][investor].principalReceived += 49
// 2. investorRepayments[0][investor].interestReceived += 4.85
// 3. Total returned: 49 + 4.85 = 53.85 tokens (54% return on 98)
```

---

## 5. Governance Model

### Voting Mechanism

**Participants**: Anyone holding bonds (including municipalities if they prefer)

**Voting Weight**: Proportional to bond balance
```
Example:
- Investor A: 100 bonds → 100 votes
- Investor B: 30 bonds → 30 votes
- Total: 130 votes

Vote A = A's votes / Total votes = 100/130 = 77%
```

**Proposal Status**: Pending → Active → Passed/Failed → Executed

**Parameters**:
- Voting period: 3 days
- Execution delay: 1 day (time-lock)
- Quorum: 50% of total bond supply must vote
- Majority: >50% of votes must be "for"

**Use Cases**:
1. Milestone approval (fund release)
2. Yield percentage adjustments
3. Emergency default declaration
4. Insurance claim approval (if enabled)

### Checks & Balances

| Risk | Mitigation |
|------|-----------|
| Sybil attack (fake voters) | Voting weight = token balance (costs capital) |
| Tyranny of majority | 50% quorum requirement (prevents 51% control) |
| Governance griefing | Time-lock delay (1 day before execution) |
| Unauthorized fund release | Requires milestone completion + DAO vote |
| Secretary problem | IPFS + community transparency |

---

## 6. Risk Management

### Default Scenarios & Mitigation

#### Scenario 1: Missed Repayment
```
Day 365: Expected repayment
Day 395: 30+ days overdue
→ repaymentManager.checkDefault() called
→ Project marked defaulted
→ Insurance claim filed (if enabled)
→ Up to 50% covered from pool
```

**Mitigation**: Insurance pool + escrow holds collateral

#### Scenario 2: Incomplete Milestone
```
Milestone: "Construct treatment plant"
Due: Day 120
Day 150: Still incomplete, no IPFS proof
→ DAO rejects milestone
→ Fund release blocked
→ Refund decision put to vote
```

**Mitigation**: Proof-of-work (IPFS), DAO oversight

#### Scenario 3: Municipality Shutdown
```
Project defaults, insurance pool insufficient
Remaining loss = (Principal - Insurance Payout) / Total Bonds
```

**Mitigation**:
- Diversify across municipalities
- Diversify across sectors
- Insurance pool as bonus (not guarantee)

### Risk Metrics

**Solvency Ratio** (Insurance):
```
Reserve = Insurance Pool Balance
Exposure = Sum of all active coverages (capped at 50% per project)
Solvency = Reserve / Exposure (target: >1.0)
```

**Default Rate** (Historical):
```
Defaults = Count of projects in "Defaulted" status
Active = Count of projects in "Active" + "InProgress"
Default Rate = Defaults / Active (target: <2%)
```

**Yield vs Risk**:
```
Expected Return = Weighted avg yield across portfolio
Max Loss = (1 - insurance_ratio) * principal
Risk-Adjusted Return = Expected Return - (Default Rate * Max Loss)
```

---

## 7. Revenue Model

### Platform Sustainability

Total 3-Year Revenue Projection (Assumptions):
- Year 1: $5M under management
- Year 2: $20M under management
- Year 3: $50M under management

```
Year 1:
├─ Issuance (2%): $5M * 2% = $100k
├─ Servicing (1%): $5M * 1% / 12 months avg = $4.2k/month = $50k
├─ Insurance (1.5%): $1M coverage * 1.5% = $15k
└─ Total: ~$165k/year

Year 2:
├─ Issuance: $20M * 2% = $400k
├─ Servicing (12 months repayment): $5M (year 1) + $20M (year 2) = avg $12.5M annual = $125k
├─ Insurance: $5M coverage * 1.5% = $75k
└─ Total: ~$600k/year

Year 3:
├─ Issuance: $50M * 2% = $1M
├─ Servicing: (~$35M annual repayment) = $350k
├─ Insurance: $15M coverage * 1.5% = $225k
└─ Total: ~$1.575M/year
```

### Fee Allocation

```
Treasury (Gets 100% initially):
├─ Operations: 40% ($66k Y1 → $630k Y3)
│  └─ Smart contracts audit, maintenance, security
├─ Development: 30% ($49.5k Y1 → $472.5k Y3)
│  └─ New features, UI/UX, integrations
├─ Community: 20% ($33k Y1 → $315k Y3)
│  └─ DAO rewards, grants, education
└─ Reserve: 10% ($16.5k Y1 → $157.5k Y3)
   └─ Insurance buffer, emergency fund

Future: Governance transition to DAO token holder voting
```

---

## 8. Scalability & Future Roadmap

### Phase 1 (Current - MVP)
- ✅ Single bond token contract per project
- ✅ Basic DAO voting
- ✅ Monthly/yearly repayments
- ✅ Single blockchain (Creditcoin)

### Phase 2 (6 months)
- [ ] Multi-currency bonds (USD, EUR, XOF)
- [ ] Secondary market for bond trading
- [ ] More granular milestone voting (quorum per milestone)
- [ ] Dynamic fee adjustments (governance vote)

### Phase 3 (12 months)
- [ ] Multi-chain deployment (Ethereum, Polygon, Solana)
- [ ] Fractional insurance claims
- [ ] Automated repayment verification (oracles)
- [ ] Interoperability with traditional banks

### Phase 4 (18+ months)
- [ ] Tokenized securities regulation (compliance)
- [ ] Central bank integration (wholesale markets)
- [ ] AI-based credit scoring
- [ ] Institutional investor dashboard

---

## 9. Comparison to Alternatives

| Feature | DiasporaBond | Aave | BondEdge | Celsius |
|---------|-------------|------|---------|---------|
| Real-world assets | ✅ Tied to infrastructure | ❌ Crypto-only | ✅ Bonds | ❌ Crypto-only |
| Governance | ✅ Milestone-based | ❌ Centralized | ⚠️ Limited | ❌ Centralized |
| Emerging markets focus | ✅ Africa-first | ❌ Global agnostic | ⚠️ Some | ❌ No |
| Yield model | ✅ Project-backed | ✅ Lending | ✅ Fixed | ⚠️ Variable |
| Insurance | ✅ Built-in optional | ❌ None | ❌ None | ⚠️ Limited |
| Transparency | ✅ IPFS proofs | ❌ Low | ⚠️ Medium | ❌ Low |

---

## 10. Security & Compliance

### Smart Contract Security

**Measures Implemented**:
- ReentrancyGuard on all fund transfers
- Ownable pattern for admin functions
- Input validation on all parameters
- Event logging for audit trail
- ERC-20 standard compliance

**Recommended Audits**:
1. Professional security audit (firm TBD)
2. Formal verification of yield formulas
3. Economic analysis of fee parameters

### Regulatory Approach

**Current**: Experimental/educational on testnet

**Future Considerations**:
- Consult securities lawyers (US, EU, Africa)
- Classify bonds as securities (likely)
- Register with relevant regulators
- Implement KYC/AML if required

### Data Privacy

- No PII stored on-chain
- Addresses are pseudonymous
- IPFS stores documents (community-governed if sensitive)
- Optional off-chain KYC for institutional investors

---

## 11. Conclusion

DiasporaBond solves infrastructure funding in emerging markets through:
1. **Accessibility**: Tokenized bonds with low minimums
2. **Transparency**: On-chain tracking of every rupiah/cedis invested
3. **Accountability**: DAO governance over fund release
4. **Safety**: Milestone-based escrow + optional insurance
5. **Sustainability**: Platform fees ensure long-term operations

By bridging diaspora communities with local infrastructure needs, DiasporaBond enables billions in new investment flowing to where it's needed most.

---

## 12. Appendix: Technical Specifications

### Gas Costs (Mainnet estimates, adjust for testnet)
- Deploy BondToken: ~1.2M gas
- Deploy ProjectRegistry: ~2.8M gas
- Create Project: ~250k gas
- Deposit Bonds: ~180k gas
- Create Proposal: ~200k gas
- Cast Vote: ~120k gas
- Execute Proposal: ~300k gas

### Smart Contract Sizes
- Total: ~16KB Solidity code
- BondToken: ~2.5KB
- ProjectRegistry: ~4.2KB
- Contracts fit in Creditcoin limits

### Dependencies
- OpenZeppelin Contracts 5.0.0 (ERC-20, Ownable, ReentrancyGuard)
- Solidity 0.8.20 (latest security patches)
- Ethers.js 6.x (frontend)

---

**Document Version**: 1.0
**Last Updated**: 2024
**Status**: Hackathon Submission
