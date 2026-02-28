const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 DiasporaBond Deployment Script");
  console.log("================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const deployments = {};

  try {
    // 1. Deploy BondToken
    console.log("\n1️⃣  Deploying BondToken...");
    const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now

    const BondToken = await hre.ethers.getContractFactory("BondToken");
    const bondToken = await BondToken.deploy(
      "Diaspora Bond Token",
      "DBT",
      "Tokenized municipal infrastructure bond",
      1000, // 10% annual yield
      maturityDate
    );
    await bondToken.waitForDeployment();
    const bondTokenAddress = await bondToken.getAddress();
    deployments.BondToken = bondTokenAddress;
    console.log("✅ BondToken deployed at:", bondTokenAddress);

    // 2. Deploy ProjectRegistry
    console.log("\n2️⃣  Deploying ProjectRegistry...");
    const ProjectRegistry = await hre.ethers.getContractFactory("ProjectRegistry");
    const projectRegistry = await ProjectRegistry.deploy();
    await projectRegistry.waitForDeployment();
    const projectRegistryAddress = await projectRegistry.getAddress();
    deployments.ProjectRegistry = projectRegistryAddress;
    console.log("✅ ProjectRegistry deployed at:", projectRegistryAddress);

    // 3. Deploy MilestoneEscrow
    console.log("\n3️⃣  Deploying MilestoneEscrow...");
    const MilestoneEscrow = await hre.ethers.getContractFactory("MilestoneEscrow");
    const milestoneEscrow = await MilestoneEscrow.deploy();
    await milestoneEscrow.waitForDeployment();
    const milestoneEscrowAddress = await milestoneEscrow.getAddress();
    deployments.MilestoneEscrow = milestoneEscrowAddress;
    console.log("✅ MilestoneEscrow deployed at:", milestoneEscrowAddress);

    // 4. Deploy GovernanceDAO
    console.log("\n4️⃣  Deploying GovernanceDAO...");
    const GovernanceDAO = await hre.ethers.getContractFactory("GovernanceDAO");
    const governanceDAO = await GovernanceDAO.deploy();
    await governanceDAO.waitForDeployment();
    const governanceDAOAddress = await governanceDAO.getAddress();
    deployments.GovernanceDAO = governanceDAOAddress;
    console.log("✅ GovernanceDAO deployed at:", governanceDAOAddress);

    // 5. Deploy RepaymentManager
    console.log("\n5️⃣  Deploying RepaymentManager...");
    const RepaymentManager = await hre.ethers.getContractFactory("RepaymentManager");
    const repaymentManager = await RepaymentManager.deploy();
    await repaymentManager.waitForDeployment();
    const repaymentManagerAddress = await repaymentManager.getAddress();
    deployments.RepaymentManager = repaymentManagerAddress;
    console.log("✅ RepaymentManager deployed at:", repaymentManagerAddress);

    // 6. Deploy RevenueEngine
    console.log("\n6️⃣  Deploying RevenueEngine...");
    const RevenueEngine = await hre.ethers.getContractFactory("RevenueEngine");
    const revenueEngine = await RevenueEngine.deploy();
    await revenueEngine.waitForDeployment();
    const revenueEngineAddress = await revenueEngine.getAddress();
    deployments.RevenueEngine = revenueEngineAddress;
    console.log("✅ RevenueEngine deployed at:", revenueEngineAddress);

    // 7. Deploy InsurancePool
    console.log("\n7️⃣  Deploying InsurancePool...");
    const InsurancePool = await hre.ethers.getContractFactory("InsurancePool");
    const insurancePool = await InsurancePool.deploy();
    await insurancePool.waitForDeployment();
    const insurancePoolAddress = await insurancePool.getAddress();
    deployments.InsurancePool = insurancePoolAddress;
    console.log("✅ InsurancePool deployed at:", insurancePoolAddress);

    // 8. Initialize contracts
    console.log("\n⚙️  Initializing contracts...");

    console.log("   - Initializing MilestoneEscrow...");
    let tx = await milestoneEscrow.initialize(bondTokenAddress, revenueEngineAddress);
    await tx.wait();

    console.log("   - Initializing GovernanceDAO...");
    tx = await governanceDAO.initialize(projectRegistryAddress, milestoneEscrowAddress, bondTokenAddress);
    await tx.wait();

    console.log("   - Initializing RepaymentManager...");
    tx = await repaymentManager.initialize(milestoneEscrowAddress, bondTokenAddress);
    await tx.wait();

    console.log("   - Initializing RevenueEngine...");
    tx = await revenueEngine.initialize(governanceDAOAddress);
    await tx.wait();

    console.log("✅ All contracts initialized\n");

    // NOTE: Removed demo/example project creation and milestone setup.
    // Projects, milestones and repayment schedules should be created via
    // the application's administrative flows or external scripts that
    // provide real project data. This deploy script now only deploys and
    // initializes contracts.

    // Save deployment details
    const networkInfo = await hre.ethers.provider.getNetwork();
    const deploymentData = {
      network: hre.network.name,
      chainId: networkInfo.chainId.toString(),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      maturityDate: new Date(maturityDate * 1000).toISOString(),
      contracts: deployments,
      // Example project info removed to avoid shipping demo data
    };

    const deploymentPath = path.join(__dirname, "../deployments.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));

    console.log("📁 Deployment Summary Saved to: deployments.json\n");

    // Print summary
    console.log("=" * 60);
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("=" * 60);

    console.log("\n📋 CONTRACT ADDRESSES:");
    console.log("-".repeat(60));
    Object.entries(deployments).forEach(([name, address]) => {
      console.log(`  ${name.padEnd(25)} ${address}`);
    });

    console.log("\n📝 NEXT STEPS:");
    console.log("-".repeat(60));
    console.log("1. Copy deployments.json to frontend/src/contracts/");
    console.log("2. Update .env with these addresses");
    console.log("3. Run tests: npx hardhat test");
    console.log("4. Start frontend: cd frontend && npm run dev");

    console.log("\n🌐 FRONTEND INTEGRATION:");
    console.log("-".repeat(60));
    console.log("Update frontend/.env.local with:");
    Object.entries(deployments).forEach(([name, address]) => {
      const envName = `VITE_${name.toUpperCase()}_ADDRESS`;
      console.log(`  ${envName}=${address}`);
    });

  } catch (error) {
    console.error("\n❌ DEPLOYMENT ERROR:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
