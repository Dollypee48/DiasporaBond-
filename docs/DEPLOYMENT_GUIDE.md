 # Quick deployment & development guide

 This document outlines the minimal steps to get DiasporaBond running locally and on the Creditcoin testnet. It focuses on the practical commands and the order to run them.

 ## Prerequisites

 - Node.js v16+ (recommended LTS)
 - Git
 - MetaMask or equivalent wallet (for testing)
 - A Creditcoin testnet account with small CTC balance for gas

 ## 1 — Install and compile

 Clone the repository and install dependencies at the project root:

 ```bash
 git clone <repo-url>
 cd diaspora-bond
 npm install --legacy-peer-deps
 npx hardhat compile
 ```

 If compilation succeeds you'll see artifacts in `artifacts/`.

 ## 2 — Environment

 Copy the example env and edit values locally (do not commit secrets):

 ```bash
 cp .env.example .env
 # edit .env and set CREDITCOIN_RPC_URL and PRIVATE_KEY
 ```

 Use a testnet-only private key. If your key is exposed, rotate it immediately.

 ## 3 — Deploy to Creditcoin testnet

 With `CREDITCOIN_RPC_URL` and `PRIVATE_KEY` in `.env` you can deploy:

 ```bash
 npx hardhat run scripts/deploy.js --network creditcoin
 ```

 The script writes `deployments.json` at the repo root with the deployed addresses.

 ## 4 — Run tests

 Run the unit and integration tests locally:

 ```bash
 npx hardhat test --show-stack-traces
 ```

 Fix any failures before using the deployment on any shared environment.

 ## 5 — Frontend setup

 In a second terminal start the frontend:

 ```bash
 cd frontend
 npm install --legacy-peer-deps
 cp .env.example .env.local
 # Update frontend/.env.local with addresses from deployments.json
 npm run dev
 ```

 Open the app at `http://localhost:5173` (or the port Vite reports).

 ## 6 — Quick checks

 - Use `scripts/check_contracts.js` to read basic contract data from the deployed addresses.
 - Verify `deployments.json` entries are correct and copy them into `frontend/.env.local`.

 ## Notes and troubleshooting

 - Never commit `.env` with private keys. Use `.env.example` for examples only.
 - If you hit compilation errors, make sure `@openzeppelin/contracts` is installed and the Solidity version is set to `0.8.20` in `hardhat.config.js`.
 - If the RPC returns an unexpected chainId, update `hardhat.config.js` to match the network's `chainId`.

 ## Where to look next

 - `contracts/` — solidity sources
 - `scripts/deploy.js` — deployment flow and initialization
 - `frontend/` — React app and env setup

 If you'd like, I can add a short automation script to copy `deployments.json` into the frontend and create a PR with recommended `.env` changes.
   const createProject = async (formData) => {
     const contract = await getContract(PROJECT_REGISTRY, ABI, false);
     return contract.createProject(...formData);
   }
   ```

---

## **📚 File Reference**

| File | Purpose |
|------|---------|
| `.env` | Root environment variables |
| `hardhat.config.js` | Hardhat configuration |
| `package.json` | Root dependencies |
| `contracts/*.sol` | Smart contracts (7 files) |
| `test/DiasporaBond.test.js` | Test suite (45+ tests) |
| `scripts/deploy.js` | Deployment script |
| `deployments.json` | Generated after deploy |
| `frontend/.env.local` | Frontend environment |
| `frontend/package.json` | Frontend dependencies |
| `frontend/src/pages/*.tsx` | Page components (5 pages) |
| `frontend/src/components/*.tsx` | Reusable components |
| `frontend/src/hooks/*.ts` | Custom React hooks |
| `frontend/src/utils/*.ts` | Utility functions |
| `frontend/src/styles/*.css` | Styling (1,500+ lines) |

---

## **💡 Pro Tips**

1. **Keep two terminals open:**
   - Terminal 1: `npm run dev` (frontend)
   - Terminal 2: For git commands, testing, etc.

2. **Use browser DevTools:**
   - F12 to open developer tools
   - Console tab to see errors
   - Network tab to see API calls

3. **MetaMask DevTools:**
   - Use "Test Accounts" for multiple addresses
   - Check transaction history in block explorer
   - Use "Clear Activity Tab" to reset transaction history

4. **Save contract addresses:**
   - Copy from `deployments.json` to a safe place
   - You'll need these for the final submission

5. **Document your deployment:**
   - Copy contract verification links to your README
   - Screenshot: "Projects page with deployed bond"
   - Screenshot: "Investor dashboard with mock data"
   - Screenshot: "Voting interface with proposals"

---

## **✅ Final Validation Checklist**

Before submitting to hackathon:

- [ ] All 7 smart contracts deployed to Creditcoin testnet
- [ ] Contract addresses saved in `deployments.json`
- [ ] All tests passing (45+ tests)
- [ ] Frontend loads without errors
- [ ] All 5 pages working and styled
- [ ] MetaMask connects successfully
- [ ] Contract ABIs updated in frontend
- [ ] Documentation complete (README, Whitepaper, Example)
- [ ] Example project "Lagos Water Bond" deployed
- [ ] Contracts verified on block explorer
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] Git repo ready for submission

---

## **📞 Getting Help**

If something doesn't work:

1. **Check the console:** F12 in browser, look for red errors
2. **Check terminal output:** Look for error messages in npm output
3. **Verify .env files:** Make sure addresses match `deployments.json`
4. **Test individually:** Try just the frontend, just the contracts, etc.
5. **Review logs:** Check deployment output for clues

---

**You're ready to demo DiasporaBond! 🎉**

Go to http://localhost:5173 and explore.

