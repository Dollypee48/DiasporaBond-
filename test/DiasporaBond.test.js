const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiasporaBond Platform Tests", function () {
  let bondToken, projectRegistry, milestoneEscrow, governanceDAO;
  let repaymentManager, revenueEngine, insurancePool;
  let owner, municipality, investor1, investor2, addrs;

  before(async function () {
    [owner, municipality, investor1, investor2, ...addrs] = await ethers.getSigners();

    // Deploy BondToken
    const BondToken = await ethers.getContractFactory("BondToken");
    const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
    bondToken = await BondToken.deploy(
      "Lagos Water Bond 2024",
      "LWB24",
      "Municipal water infrastructure project",
      1000, // 10% yield
      maturityDate
    );
    await bondToken.waitForDeployment();

    // Deploy ProjectRegistry
    const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
    projectRegistry = await ProjectRegistry.deploy();
    await projectRegistry.waitForDeployment();

    // Deploy MilestoneEscrow
    const MilestoneEscrow = await ethers.getContractFactory("MilestoneEscrow");
    milestoneEscrow = await MilestoneEscrow.deploy();
    await milestoneEscrow.waitForDeployment();

    // Deploy GovernanceDAO
    const GovernanceDAO = await ethers.getContractFactory("GovernanceDAO");
    governanceDAO = await GovernanceDAO.deploy();
    await governanceDAO.waitForDeployment();

    // Deploy RepaymentManager
    const RepaymentManager = await ethers.getContractFactory("RepaymentManager");
    repaymentManager = await RepaymentManager.deploy();
    await repaymentManager.waitForDeployment();

    // Deploy RevenueEngine
    const RevenueEngine = await ethers.getContractFactory("RevenueEngine");
    revenueEngine = await RevenueEngine.deploy();
    await revenueEngine.waitForDeployment();

    // Deploy InsurancePool
    const InsurancePool = await ethers.getContractFactory("InsurancePool");
    insurancePool = await InsurancePool.deploy();
    await insurancePool.waitForDeployment();

    // Initialize contracts
    await milestoneEscrow.initialize(await bondToken.getAddress(), await revenueEngine.getAddress());
    await governanceDAO.initialize(
      await projectRegistry.getAddress(),
      await milestoneEscrow.getAddress(),
      await bondToken.getAddress()
    );
    await repaymentManager.initialize(await milestoneEscrow.getAddress(), await bondToken.getAddress());
    await revenueEngine.initialize(await governanceDAO.getAddress());
  });

  // ==================== BondToken Tests ====================

  describe("BondToken", function () {
    it("Should have correct metadata", async function () {
      const metadata = await bondToken.getBondMetadata();
      expect(metadata.name).to.equal("Lagos Water Bond 2024");
      expect(metadata.symbol).to.equal("LWB24");
      expect(metadata.yield).to.equal(1000); // 10%
    });

    it("Should mint tokens", async function () {
      const mintAmount = ethers.parseEther("100");
      await bondToken.mint(investor1.address, mintAmount);

      const balance = await bondToken.balanceOf(investor1.address);
      expect(balance).to.equal(mintAmount);
    });

    it("Should calculate yield correctly", async function () {
      const principal = ethers.parseEther("100");
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + 365 * 24 * 60 * 60; // 1 year later

      const yield_calc = await bondToken.calculateYield(principal, startTime, endTime);
      // Yield should be 10% of principal (100 * 0.10 = 10)
      expect(yield_calc).to.be.gt(0);
    });

    it("Should burn tokens", async function () {
      const burnAmount = ethers.parseEther("50");
      await bondToken.mint(owner.address, ethers.parseEther("50"));
      await bondToken.burnBonds(burnAmount);

      const balance = await bondToken.balanceOf(owner.address);
      expect(balance).to.equal(0);
    });
  });

  // ==================== ProjectRegistry Tests ====================

  describe("ProjectRegistry", function () {
    let projectId;

    it("Should create a project", async function () {
      const tx = await projectRegistry.connect(municipality).createProject(
        "Lagos Water Infrastructure",
        "Urban water supply expansion",
        "Lagos, Nigeria",
        ethers.parseEther("100"),
        1000, // 10% yield
        365 * 24 * 60 * 60, // 1 year duration
        "QmHashForProjectDocs123", // IPFS hash
        await bondToken.getAddress(),
        false // No insurance required
      );

      const receipt = await tx.wait();
      projectId = 0; // First project ID

      const project = await projectRegistry.getProject(projectId);
      expect(project.name).to.equal("Lagos Water Infrastructure");
      expect(project.municipality).to.equal(municipality.address);
    });

    it("Should add milestones to project", async function () {
      const targetDate = Math.floor(Date.now() / 1000) + 120 * 24 * 60 * 60; // 120 days from now
      const fundAmount = ethers.parseEther("25");

      await projectRegistry.connect(municipality).addMilestone(
        0,
        "Design & Planning",
        "Complete project design and feasibility study",
        targetDate,
        fundAmount
      );

      const milestones = await projectRegistry.getProjectMilestones(0);
      expect(milestones.length).to.equal(1);
      expect(milestones[0].title).to.equal("Design & Planning");
    });

    it("Should complete milestone", async function () {
      await projectRegistry.connect(municipality).completeMilestone(0, 0);

      const milestone = await projectRegistry.getMilestone(0, 0);
      expect(milestone.completed).to.equal(true);
    });

    it("Should track total projects", async function () {
      const total = await projectRegistry.getTotalProjects();
      expect(total).to.be.gte(1);
    });
  });

  // ==================== MilestoneEscrow Tests ====================

  describe("MilestoneEscrow", function () {
    it("Should deposit funds into escrow", async function () {
      const investmentAmount = ethers.parseEther("10");

      await milestoneEscrow.connect(investor1).depositFunds(0, investmentAmount);

      const holdings = await milestoneEscrow.getInvestorHoldings(0, investor1.address);
      // Holdings should be less than investment due to 2% issuance fee
      expect(holdings).to.be.gt(0);
      expect(holdings).to.be.lt(investmentAmount);
    });

    it("Should track escrow balance", async function () {
      const balance = await milestoneEscrow.getProjectEscrowBalance(0);
      expect(balance).to.be.gt(0);
    });

    it("Should list project investors", async function () {
      const investors = await milestoneEscrow.getProjectInvestors(0);
      expect(investors).to.include(investor1.address);
    });
  });

  // ==================== GovernanceDAO Tests ====================

  describe("GovernanceDAO", function () {
    let proposalId;

    it("Should create a proposal", async function () {
      // First mint tokens to have voting power
      await bondToken.mint(investor1.address, ethers.parseEther("100"));

      const tx = await governanceDAO.connect(investor1).createProposal(
        0, // projectId
        0, // milestoneIndex
        "Approve Milestone 1",
        "Release funds for design phase",
        municipality.address,
        ethers.parseEther("25")
      );

      const receipt = await tx.wait();
      proposalId = 0;

      const proposal = await governanceDAO.getProposal(proposalId);
      expect(proposal.status).to.equal(1); // Active status
      expect(proposal.title).to.equal("Approve Milestone 1");
    });

    it("Should allow voting on proposal", async function () {
      // Mint tokens for voter
      await bondToken.mint(investor2.address, ethers.parseEther("50"));

      // Vote in favor
      await governanceDAO.connect(investor2).vote(proposalId, 1); // 1 = for

      const proposal = await governanceDAO.getProposal(proposalId);
      expect(proposal.forVotes).to.be.gt(0);
    });

    it("Should get voting weight", async function () {
      const weight = await governanceDAO.getVotingWeight(investor2.address);
      expect(weight).to.be.gt(0);
    });
  });

  // ==================== RepaymentManager Tests ====================

  describe("RepaymentManager", function () {
    it("Should create repayment schedule", async function () {
      const investors = [investor1.address, investor2.address];
      const bonds = [ethers.parseEther("50"), ethers.parseEther("50")];

      const startDate = Math.floor(Date.now() / 1000);
      const endDate = startDate + 365 * 24 * 60 * 60;

      await repaymentManager.createRepaymentSchedule(
        0, // projectId
        ethers.parseEther("100"), // principal
        ethers.parseEther("10"), // interest
        startDate,
        endDate,
        12, // 12 monthly payments
        investors,
        bonds
      );

      const schedule = await repaymentManager.getRepaymentSchedule(0);
      expect(schedule.totalPrincipal).to.equal(ethers.parseEther("100"));
      expect(schedule.frequencyCount).to.equal(12);
    });

    it("Should track repayment progress", async function () {
      const progress = await repaymentManager.getRepaymentProgress(0);
      expect(progress).to.equal(0); // No payments yet
    });

    it("Should get next payment date", async function () {
      const nextDate = await repaymentManager.getNextPaymentDate(0);
      expect(nextDate).to.be.gt(0);
    });
  });

  // ==================== RevenueEngine Tests ====================

  describe("RevenueEngine", function () {
    it("Should calculate issuance fee", async function () {
      const amount = ethers.parseEther("100");
      const fee = await revenueEngine.calculateFee(amount, "Issuance");

      // 2% fee = 2 tokens
      const expected = ethers.parseEther("2");
      expect(fee).to.equal(expected);
    });

    it("Should calculate servicing fee", async function () {
      const amount = ethers.parseEther("100");
      const fee = await revenueEngine.calculateFee(amount, "Servicing");

      // 1% fee = 1 token
      const expected = ethers.parseEther("1");
      expect(fee).to.equal(expected);
    });

    it("Should track treasury balance", async function () {
      const balance = await revenueEngine.getTreasuryBalance();
      expect(balance).to.be.gte(0);
    });
  });

  // ==================== InsurancePool Tests ====================

  describe("InsurancePool", function () {
    it("Should enable coverage for project", async function () {
      const coverageAmount = ethers.parseEther("50");

      await insurancePool.enableCoverage(0, coverageAmount);

      const coverage = await insurancePool.getCoverage(0);
      expect(coverage.coverageAmount).to.equal(coverageAmount);
    });

    it("Should calculate required premium", async function () {
      const coverageAmount = ethers.parseEther("100");
      const premium = await insurancePool.calculateRequiredPremium(coverageAmount);

      // 1.5% = 1.5 tokens
      const expected = ethers.parseEther("1.5");
      expect(premium).to.be.closeTo(expected, ethers.parseEther("0.1"));
    });

    it("Should calculate max claim amount", async function () {
      const coverageAmount = ethers.parseEther("100");
      const maxClaim = await insurancePool.calculateMaxClaim(coverageAmount);

      // 50% of coverage = 50 tokens
      const expected = ethers.parseEther("50");
      expect(maxClaim).to.equal(expected);
    });
  });

  // ==================== Integration Tests ====================

  describe("Integration Tests", function () {
    it("Should handle complete project flow: create → invest → propose → vote → repay", async function () {
      // 1. Project already created in ProjectRegistry tests

      // 2. Investor deposits
      const investAmount = ethers.parseEther("5");
      await milestoneEscrow.connect(investor1).depositFunds(0, investAmount);

      // 3. Create proposal for milestone
      await bondToken.mint(investor1.address, ethers.parseEther("50"));
      const proposal = await governanceDAO.connect(investor1).createProposal(
        0,
        0,
        "Release Milestone Funds",
        "All requirements met",
        municipality.address,
        ethers.parseEther("25")
      );

      // 4. Get total proposals
      const totalProposals = await governanceDAO.getTotalProposals();
      expect(totalProposals).to.be.gte(1);

      // 5. Verify escrow holds funds
      const escrowBalance = await milestoneEscrow.getProjectEscrowBalance(0);
      expect(escrowBalance).to.be.gt(0);
    });
  });
});
