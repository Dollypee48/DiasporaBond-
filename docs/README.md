**Diaspora Bond** is a small platform for tokenizing municipal infrastructure projects so investors can fund defined project milestones, participate in governance, and receive repayments.

This repository includes smart contracts, deployment scripts, tests, and a React frontend.

Quick start:

- Clone the repo
- Create a local `.env` from `.env.example`
- Install dependencies and compile: `npm install` → `npx hardhat compile`
- Run tests: `npx hardhat test`
- Deploy: `npx hardhat run scripts/deploy.js --network creditcoin`

Repository layout:

- `contracts/` — Solidity sources (BondToken, ProjectRegistry, MilestoneEscrow, GovernanceDAO, RepaymentManager, RevenueEngine, InsurancePool)
- `scripts/` — deployment and utility scripts (deploy, copy ABIs, contract checks)
- `frontend/` — React + Vite app that reads contract ABIs and `deployments.json`
- `test/` — Hardhat tests and integration scenarios
- `docs/` — user guides, whitepaper, and examples

If you want, I can: copy `deployments.json` into the frontend, create a PR, or polish any specific documentation page.

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
