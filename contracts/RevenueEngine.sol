// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RevenueEngine
 * @dev Collects and manages fees (issuance, servicing) and treasury distributions
 * Provides revenue model for platform sustainability
 */
contract RevenueEngine is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}
    struct FeeRecord {
        uint256 projectId;
        string feeType; // "Issuance" or "Servicing"
        uint256 amount;
        uint256 timestamp;
    }

    // State variables
    uint256 public totalIssuanceFees;
    uint256 public totalServicingFees;
    uint256 public treasury;

    uint256 public issuanceFeePercentage = 200; // 2% (basis points)
    uint256 public servicingFeePercentage = 100; // 1% (basis points)

    mapping(uint256 => FeeRecord[]) public projectFeeRecords;
    mapping(address => uint256) public daoRewards; // Rewards for DAO participants

    address public governanceDAO;

    // Events
    event IssuanceFeeCollected(uint256 indexed projectId, uint256 amount);
    event ServicingFeeCollected(uint256 indexed projectId, uint256 amount);
    event TreasuryWithdrawal(address indexed recipient, uint256 amount);
    event FeePercentageUpdated(string feeType, uint256 newPercentage);
    event DAORewardDistributed(address indexed recipient, uint256 amount);

    /**
     * @dev Initialize revenue engine
     * @param governanceDAO_ GovernanceDAO contract address
     */
    function initialize(address governanceDAO_) public onlyOwner {
        require(governanceDAO_ != address(0), "Invalid DAO address");
        governanceDAO = governanceDAO_;
    }

    /**
     * @dev Collect issuance fee
     * @param projectId_ Project ID
     * @param amount_ Amount to charge fee on
     */
    function collectIssuanceFee(uint256 projectId_, uint256 amount_) public onlyOwner nonReentrant {
        require(amount_ > 0, "Amount must be > 0");

        uint256 fee = (amount_ * issuanceFeePercentage) / 10000;
        require(fee > 0, "Fee is zero");

        treasury += fee;
        totalIssuanceFees += fee;

        FeeRecord memory record = FeeRecord({
            projectId: projectId_,
            feeType: "Issuance",
            amount: fee,
            timestamp: block.timestamp
        });

        projectFeeRecords[projectId_].push(record);

        emit IssuanceFeeCollected(projectId_, fee);
    }

    /**
     * @dev Collect servicing fee (from repayments)
     * @param projectId_ Project ID
     * @param repaymentAmount_ Repayment amount to charge fee on
     */
    function collectServicingFee(uint256 projectId_, uint256 repaymentAmount_)
        public
        onlyOwner
        nonReentrant
    {
        require(repaymentAmount_ > 0, "Amount must be > 0");

        uint256 fee = (repaymentAmount_ * servicingFeePercentage) / 10000;
        require(fee > 0, "Fee is zero");

        treasury += fee;
        totalServicingFees += fee;

        FeeRecord memory record = FeeRecord({
            projectId: projectId_,
            feeType: "Servicing",
            amount: fee,
            timestamp: block.timestamp
        });

        projectFeeRecords[projectId_].push(record);

        emit ServicingFeeCollected(projectId_, fee);
    }

    /**
     * @dev Withdraw from treasury
     * @param amount_ Amount to withdraw
     */
    function withdrawTreasury(uint256 amount_) public onlyOwner nonReentrant {
        require(amount_ > 0, "Amount must be > 0");
        require(amount_ <= treasury, "Insufficient treasury balance");

        treasury -= amount_;

        emit TreasuryWithdrawal(msg.sender, amount_);
    }

    /**
     * @dev Update issuance fee percentage
     * @param newPercentage_ New percentage (basis points)
     */
    function updateIssuanceFeePercentage(uint256 newPercentage_) public onlyOwner {
        require(newPercentage_ <= 10000, "Percentage cannot exceed 100%");
        issuanceFeePercentage = newPercentage_;
        emit FeePercentageUpdated("Issuance", newPercentage_);
    }

    /**
     * @dev Update servicing fee percentage
     * @param newPercentage_ New percentage (basis points)
     */
    function updateServicingFeePercentage(uint256 newPercentage_) public onlyOwner {
        require(newPercentage_ <= 10000, "Percentage cannot exceed 100%");
        servicingFeePercentage = newPercentage_;
        emit FeePercentageUpdated("Servicing", newPercentage_);
    }

    /**
     * @dev Distribute DAO rewards to governance participants
     * @param recipient_ Recipient address
     * @param amount_ Reward amount
     */
    function distributeDAOReward(address recipient_, uint256 amount_) public onlyOwner nonReentrant {
        require(recipient_ != address(0), "Invalid recipient");
        require(amount_ > 0, "Amount must be > 0");
        require(amount_ <= treasury, "Insufficient treasury balance");

        daoRewards[recipient_] += amount_;
        treasury -= amount_;

        emit DAORewardDistributed(recipient_, amount_);
    }

    // View functions

    /**
     * @dev Get treasury balance
     * @return Current treasury balance
     */
    function getTreasuryBalance() public view returns (uint256) {
        return treasury;
    }

    /**
     * @dev Get total fees collected
     * @return Total of all fees
     */
    function getTotalFeesCollected() public view returns (uint256) {
        return totalIssuanceFees + totalServicingFees;
    }

    /**
     * @dev Get project fee records
     * @param projectId_ Project ID
     * @return Array of FeeRecord structs
     */
    function getProjectFeeRecords(uint256 projectId_) public view returns (FeeRecord[] memory) {
        return projectFeeRecords[projectId_];
    }

    /**
     * @dev Get DAO rewards for an address
     * @param recipient_ Recipient address
     * @return Reward amount
     */
    function getDAORewards(address recipient_) public view returns (uint256) {
        return daoRewards[recipient_];
    }

    /**
     * @dev Calculate fee on an amount
     * @param amount_ Amount to calculate fee on
     * @param feeType_ "Issuance" or "Servicing"
     * @return Calculated fee
     */
    function calculateFee(uint256 amount_, string memory feeType_) public view returns (uint256) {
        uint256 percentage = keccak256(abi.encodePacked(feeType_)) == keccak256(abi.encodePacked("Issuance"))
            ? issuanceFeePercentage
            : servicingFeePercentage;

        return (amount_ * percentage) / 10000;
    }
}
