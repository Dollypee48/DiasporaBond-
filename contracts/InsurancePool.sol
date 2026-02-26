// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title InsurancePool
 * @dev Optional insurance pool to cover partial defaults on municipal bonds
 * Municipalities pay premiums; pool covers claims when defaults occur
 */
contract InsurancePool is Ownable, ReentrancyGuard {
    struct InsuranceCoverage {
        uint256 projectId;
        uint256 premiumAmount;
        uint256 coverageAmount; // Max amount that can be claimed
        bool claimed;
        uint256 claimAmount;
        uint256 timestamp;
    }

    struct Claim {
        uint256 projectId;
        uint256 claimAmount;
        uint256 approvedAmount;
        bool approved;
        uint256 timestamp;
        string reason;
    }

    // State variables
    uint256 public poolBalance;
    uint256 public claimsProcessed;
    uint256 public totalClaimed;

    mapping(uint256 => InsuranceCoverage) public coverages;
    mapping(uint256 => Claim) public claims;

    uint256 public projectCoverageCounter;

    // Insurance parameters
    uint256 public premiumPercentage = 150; // 1.5% of coverage amount
    uint256 public maxClaimPercentage = 5000; // 50% of coverage (basis points)
    uint256 public claimApprovalThreshold = 5000; // 50% governance approval

    // Events
    event PremiumDeposited(uint256 indexed projectId, uint256 amount);
    event ClaimFiled(uint256 indexed projectId, uint256 claimAmount);
    event ClaimApproved(uint256 indexed projectId, uint256 approvedAmount);
    event ClaimRejected(uint256 indexed projectId);
    event PayoutDistributed(uint256 indexed projectId, uint256 amount);
    event PoolBalanceUpdated(uint256 newBalance);

    /**
     * @dev Enable insurance coverage for a project
     * @param projectId_ Project ID
     * @param coverageAmount_ Maximum coverage amount
     */
    function enableCoverage(uint256 projectId_, uint256 coverageAmount_) public nonReentrant returns (uint256) {
        require(coverageAmount_ > 0, "Coverage amount must be > 0");

        uint256 requiredPremium = (coverageAmount_ * premiumPercentage) / 10000;

        coverages[projectId_] = InsuranceCoverage({
            projectId: projectId_,
            premiumAmount: requiredPremium,
            coverageAmount: coverageAmount_,
            claimed: false,
            claimAmount: 0,
            timestamp: block.timestamp
        });

        projectCoverageCounter++;

        emit PremiumDeposited(projectId_, requiredPremium);
        return projectCoverageCounter - 1;
    }

    /**
     * @dev Deposit premium for insurance coverage
     * @param projectId_ Project ID
     * @param amount_ Premium amount
     */
    function depositPremium(uint256 projectId_, uint256 amount_) public onlyOwner nonReentrant {
        InsuranceCoverage storage coverage = coverages[projectId_];

        require(coverage.projectId == projectId_, "Coverage not found");
        require(amount_ >= coverage.premiumAmount, "Insufficient premium");

        poolBalance += amount_;

        emit PremiumDeposited(projectId_, amount_);
        emit PoolBalanceUpdated(poolBalance);
    }

    /**
     * @dev File an insurance claim
     * @param projectId_ Project ID
     * @param claimAmount_ Amount being claimed
     * @param reason_ Reason for claim
     */
    function fileClaim(
        uint256 projectId_,
        uint256 claimAmount_,
        string memory reason_
    ) public onlyOwner nonReentrant returns (uint256) {
        InsuranceCoverage storage coverage = coverages[projectId_];

        require(coverage.projectId == projectId_, "Coverage not found");
        require(!coverage.claimed, "Claim already filed");
        require(claimAmount_ > 0, "Claim amount must be > 0");

        uint256 maxClaim = (coverage.coverageAmount * maxClaimPercentage) / 10000;
        require(claimAmount_ <= maxClaim, "Claim exceeds max coverage");

        uint256 claimId = projectId_;
        claims[claimId] = Claim({
            projectId: projectId_,
            claimAmount: claimAmount_,
            approvedAmount: 0,
            approved: false,
            timestamp: block.timestamp,
            reason: reason_
        });

        coverage.claimed = true;
        coverage.claimAmount = claimAmount_;

        emit ClaimFiled(projectId_, claimAmount_);
        return claimId;
    }

    /**
     * @dev Approve a claim
     * @param claimId_ Claim ID (project ID)
     * @param approvalAmount_ Approved amount
     */
    function approveClaim(uint256 claimId_, uint256 approvalAmount_) public onlyOwner nonReentrant {
        Claim storage claim = claims[claimId_];

        require(claim.projectId != 0, "Claim not found");
        require(!claim.approved, "Already approved");
        require(approvalAmount_ > 0, "Approval amount must be > 0");
        require(approvalAmount_ <= claim.claimAmount, "Cannot approve more than claimed");
        require(approvalAmount_ <= poolBalance, "Insufficient pool balance");

        claim.approved = true;
        claim.approvedAmount = approvalAmount_;

        poolBalance -= approvalAmount_;
        claimsProcessed++;
        totalClaimed += approvalAmount_;

        emit ClaimApproved(claimId_, approvalAmount_);
        emit PoolBalanceUpdated(poolBalance);
    }

    /**
     * @dev Reject a claim
     * @param claimId_ Claim ID
     */
    function rejectClaim(uint256 claimId_) public onlyOwner nonReentrant {
        Claim storage claim = claims[claimId_];

        require(claim.projectId != 0, "Claim not found");
        require(!claim.approved, "Already approved");

        // Reset coverage claim status
        coverages[claimId_].claimed = false;
        coverages[claimId_].claimAmount = 0;

        emit ClaimRejected(claimId_);
    }

    /**
     * @dev Distribute approved claim payout
     * @param claimId_ Claim ID
     */
    function distributePayout(uint256 claimId_) public onlyOwner nonReentrant {
        Claim storage claim = claims[claimId_];

        require(claim.projectId != 0, "Claim not found");
        require(claim.approved, "Claim not approved");
        require(claim.approvedAmount > 0, "No approved amount");

        uint256 payoutAmount = claim.approvedAmount;
        claim.approvedAmount = 0; // Prevent double-payment

        emit PayoutDistributed(claimId_, payoutAmount);
    }

    // View functions

    /**
     * @dev Get pool balance
     * @return Current pool balance
     */
    function getPoolBalance() public view returns (uint256) {
        return poolBalance;
    }

    /**
     * @dev Get coverage details
     * @param projectId_ Project ID
     * @return InsuranceCoverage struct
     */
    function getCoverage(uint256 projectId_) public view returns (InsuranceCoverage memory) {
        return coverages[projectId_];
    }

    /**
     * @dev Get claim details
     * @param claimId_ Claim ID
     * @return Claim struct
     */
    function getClaim(uint256 claimId_) public view returns (Claim memory) {
        return claims[claimId_];
    }

    /**
     * @dev Calculate required premium for coverage
     * @param coverageAmount_ Coverage amount
     * @return Required premium
     */
    function calculateRequiredPremium(uint256 coverageAmount_) public view returns (uint256) {
        return (coverageAmount_ * premiumPercentage) / 10000;
    }

    /**
     * @dev Calculate max claimable amount
     * @param coverageAmount_ Coverage amount
     * @return Max claim amount
     */
    function calculateMaxClaim(uint256 coverageAmount_) public view returns (uint256) {
        return (coverageAmount_ * maxClaimPercentage) / 10000;
    }

    /**
     * @dev Update premium percentage
     * @param newPercentage_ New premium percentage (basis points)
     */
    function updatePremiumPercentage(uint256 newPercentage_) public onlyOwner {
        require(newPercentage_ <= 10000, "Percentage cannot exceed 100%");
        premiumPercentage = newPercentage_;
    }

    /**
     * @dev Update max claim percentage
     * @param newPercentage_ New max claim percentage (basis points)
     */
    function updateMaxClaimPercentage(uint256 newPercentage_) public onlyOwner {
        require(newPercentage_ <= 10000, "Percentage cannot exceed 100%");
        maxClaimPercentage = newPercentage_;
    }
}
