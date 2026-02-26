# 🚀 DiasporaBond - Complete Deployment & Testing Guide

## **BEFORE YOU START**

Ensure you have:
- ✅ Node.js 16+ installed
- ✅ MetaMask browser extension
- ✅ Creditcoin testnet CTC tokens for gas fees
- ✅ Git for version control
- ✅ A code editor (VS Code recommended)

---

## **STEP 1: Clone & Setup Root Project**

```bash
# Navigate to project
cd diaspora-bond

# Install root dependencies (Hardhat, ethers)
npm install

# Verify compilation works
npm run compile
```

**Expected Output:**
```
Compiled successfully!
```

---

## **STEP 2: Configure Environment**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your details
nano .env  # or use your editor
```

**Fill in:**
```env
# Your Creditcoin testnet RPC (provided by hackathon)
CREDITCOIN_RPC_URL=https://testnet-rpc.creditcoin.network/rpc

# Your private key (from MetaMask export)
# ⚠️ SECURITY: Use a testnet-only account, NEVER mainnet keys!
PRIVATE_KEY=0x0000...  # Get from MetaMask: Settings > Security & Privacy > Export Private Key
```

**To get PRIVATE_KEY from MetaMask:**
1. Open MetaMask
2. Click account menu (top right)
3. Settings → Security & Privacy
4. Show Private Key → Enter password
5. Copy the key (starts with 0x)
6. Save in `.env` file

---

## **STEP 3: Deploy Smart Contracts to Creditcoin Testnet**

```bash
# From root directory
npm run deploy

# Output will show:
# ✅ BondToken deployed at: 0x...
# ✅ ProjectRegistry deployed at: 0x...
# ✅ MilestoneEscrow deployed at: 0x...
# ... (7 contracts total)
# ✅ Example project created with ID: 0
# ✅ Lagos Water Infrastructure Bond ready!
```

**This creates `deployments.json` with all contract addresses**

---

## **STEP 4: Run Smart Contract Tests**

```bash
# Run full test suite
npm run test

# Expected: All 45+ tests pass ✅
# Output shows:
# ✅ BondToken Tests (8 tests)
# ✅ ProjectRegistry Tests (6 tests)
# ✅ MilestoneEscrow Tests (5 tests)
# ✅ GovernanceDAO Tests (6 tests)
# ✅ RepaymentManager Tests (6 tests)
# ✅ RevenueEngine Tests (5 tests)
# ✅ InsurancePool Tests (5 tests)
# ✅ Integration Tests (2 tests)
```

---

## **STEP 5: Setup Frontend**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit with deployed contract addresses
nano .env.local
```

**Fill in from `deployments.json`:**
```env
# From deployments.json contracts section
VITE_BOND_TOKEN_ADDRESS=0x...
VITE_PROJECT_REGISTRY_ADDRESS=0x...
VITE_MILESTONE_ESCROW_ADDRESS=0x...
VITE_GOVERNANCE_DAO_ADDRESS=0x...
VITE_REPAYMENT_MANAGER_ADDRESS=0x...
VITE_REVENUE_ENGINE_ADDRESS=0x...
VITE_INSURANCE_POOL_ADDRESS=0x...

# Network settings (already configured)
VITE_CREDITCOIN_RPC=https://testnet-rpc.creditcoin.network/rpc
VITE_CHAIN_ID=12391
```

---

## **STEP 6: Start Frontend Development Server**

```bash
# Still in frontend/ directory
npm run dev

# Output:
#
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

**Open browser at `http://localhost:5173`**

---

## **STEP 7: Connect MetaMask & Test**

### **Switch MetaMask to Creditcoin Testnet:**

1. Open MetaMask
2. Click Network dropdown (top left)
3. Click "Add Network" or look for Creditcoin
4. Enter:
   - **Network Name**: Creditcoin Testnet
   - **RPC URL**: https://testnet-rpc.creditcoin.network/rpc
   - **Chain ID**: 12391
   - **Currency Symbol**: CTC
5. Click "Add Network"

### **Test the Platform:**

1. **Home Page** (`http://localhost:5173/`)
   - ✅ See hero section with project stats
   - ✅ View 4 featured projects

2. **Projects Page** (`/projects`)
   - ✅ Filter projects by status
   - ✅ Search by name/location
   - ✅ See project details cards

3. **Connect Wallet** (top right button)
   - ✅ Click "Connect Wallet"
   - ✅ Approve MetaMask popup
   - ✅ See account address and CTC balance

4. **Investor Dashboard** (`/investor`)
   - ✅ View mock portfolio data
   - ✅ See holdings table
   - ✅ Check yield projections

5. **Municipality Dashboard** (`/municipality`)
   - ✅ See project creation form
   - ✅ Fill out form (no submission yet - that's integration)

6. **Governance Page** (`/governance`)
   - ✅ View active proposals
   - ✅ See voting interface
   - ✅ View voting history

---

## **STEP 8: Verify Contracts on Block Explorer**

1. Go to Creditcoin testnet block explorer
2. Paste contract address from `deployments.json`
3. Verify:
   - ✅ Contract deployed successfully
   - ✅ Contract bytecode visible
   - ✅ Transaction history shows deployment

**Example URL:**
```
https://testnet.creditcoin.network/address/0x...
```

---

## **STEP 9: Run Linting & Build**

```bash
# From frontend/ directory

# Check code quality
npm run lint

# Build for production (test only, don't deploy yet)
npm run build

# Output: dist/ folder with optimized build
```

---

## **STEP 10: Test the Full Flow (Manual)**

### **Simulate Complete Workflow:**

```
1. Home Page
   ↓
2. Browse Projects (/projects)
   ↓
3. Connect MetaMask wallet
   ↓
4. Check Investor Dashboard (/investor)
   ↓
5. Create Project (Municipality page) - Form only
   ↓
6. Review Governance Proposals (/governance)
```

---

## **📋 Checklist: Everything Works?**

- [ ] `npm run compile` - All contracts compile
- [ ] `.env` file created with your PRIVATE_KEY
- [ ] `npm run deploy` - All 7 contracts deployed
- [ ] `npm run test` - All tests pass (45+)
- [ ] `deployments.json` created with contract addresses
- [ ] Frontend `npm install` successful
- [ ] Front end `.env.local` filled with contract addresses
- [ ] `npm run dev` starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] MetaMask connects successfully
- [ ] All 5 pages load and display correctly
- [ ] Navigation works smoothly
- [ ] Forms render properly
- [ ] Responsive design works on mobile

---

## **🔍 Troubleshooting**

### **Issue: "PRIVATE_KEY not found"**
```bash
# Fix: Make sure .env file exists
ls -la .env  # Should show the file

# Verify format
cat .env | grep PRIVATE_KEY  # Should show your key
```

### **Issue: "RPC connection failed"**
```bash
# Check RPC URL is correct
echo $CREDITCOIN_RPC_URL

# Test connection manually
curl https://testnet-rpc.creditcoin.network/rpc
```

### **Issue: Insufficient funds for gas**
```
Solution: Request testnet CTC from faucet:
https://testnet.creditcoin.network/faucet

Or ask hackathon organizers for testnet tokens
```

### **Issue: Frontend won't compile**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Issue: MetaMask rejects transaction**
```
1. Check network is Creditcoin Testnet (Chain ID: 12391)
2. Check account has CTC balance
3. Check contract address is correct in .env.local
4. Increase gas limit in MetaMask settings
```

---

## **📊 Performance Checks**

### **Smart Contracts:**
```bash
# Check contract size
npm run build  # Shows compiled bytecode sizes

# Expected:
# BondToken: ~3.2 KB
# ProjectRegistry: ~4.8 KB
# GovernanceDAO: ~5.2 KB
# (All under Ethereum limit of 24 KB)
```

### **Frontend:**
```bash
# Check bundle size
cd frontend && npm run build

# Expected:
# dist/index.html: ~1 KB
# dist/assets/main.js: ~200 KB (with all dependencies)
# Total: < 500 KB (acceptable for hackathon)
```

---

## **🧪 Testing Scenarios**

### **Scenario 1: Deploy & View Projects**
- [ ] Deploy contracts
- [ ] Check Lagos Water Bond is created (Project ID 0)
- [ ] See it in Projects page with 25/100 tokens raised

### **Scenario 2: Wallet Integration**
- [ ] Connect MetaMask
- [ ] View correct account address
- [ ] View CTC balance
- [ ] Disconnect and reconnect

### **Scenario 3: Portfolio Viewing**
- [ ] Go to Investor Dashboard
- [ ] See mock portfolio ($50k invested)
- [ ] See 4 holdings with yields
- [ ] Check yield projections

### **Scenario 4: Governance**
- [ ] View active proposals (Lagos Water Milestone 1)
- [ ] See voting bars and percentages
- [ ] View passed/failed history

### **Scenario 5: Forms**
- [ ] Municipality page loads form
- [ ] All fields are editable
- [ ] Form validation works (try submitting empty)

---

## **🚀 Next Steps for Implementation**

After verifying everything works, implement these integrations:

1. **Investment Function**
   ```typescript
   // Location: pages/Projects.tsx
   // Add button click handler to call:
   const investInBond = async (projectId: number, amount: string) => {
     const contract = await getContract(BOND_TOKEN, ABI, false);
     return contract.mint(investorAddress, amount);
   }
   ```

2. **Voting Function**
   ```typescript
   // Location: pages/Governance.tsx
   const castVote = async (proposalId: number, voteType: number) => {
     const contract = await getContract(GOVERNANCE_DAO, ABI, false);
     return contract.vote(proposalId, voteType);
   }
   ```

3. **Project Creation**
   ```typescript
   // Location: pages/Municipality.tsx
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

