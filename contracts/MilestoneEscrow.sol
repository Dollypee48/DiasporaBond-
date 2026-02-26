// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MilestoneEscrow
 * @dev Holds investor funds in escrow until milestone completion
 * Releases funds to municipality upon milestone approval
 * Allows refunds if project fails
 */
contract MilestoneEscrow is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}
    // Escrow struct
    struct EscrowAccount {
        uint256 projectId;
        uint256 bondAmount;
        uint256 fundAmount; // Amount invested
        address investor;
        bool refunded;
        uint256 releaseAmount; // Amount to be released
    }

    // State variables
    mapping(bytes32 => EscrowAccount) public escrowAccounts;
    mapping(uint256 => uint256) public projectEscrowBalance;
    mapping(uint256 => address[]) public projectInvestors;
    mapping(uint256 => mapping(address => uint256)) public investorHoldings; // Project ID => Investor => Bond Amount

    address public revenueEngine;
    address public bondTokenAddress;

    uint256 public issuanceFeePercentage = 200; // 2% (basis points)

    // Events
    event FundsDeposited(
        bytes32 indexed escrowId,
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount,
        uint256 bondsMinted
    );
    event FundsReleased(
        bytes32 indexed escrowId,
        uint256 indexed projectId,
        uint256 amount,
        uint256 milestoneIndex
    );
    event FundsRefunded(
        bytes32 indexed escrowId,
        address indexed investor,
        uint256 amount
    );
    event ProjectEscrowVoid(uint256 indexed projectId);

    /**
     * @dev Initialize escrow with contract addresses
     * @param bondTokenAddress_ Bond token contract address
     * @param revenueEngine_ Revenue engine contract address
     */
    function initialize(address bondTokenAddress_, address revenueEngine_) public onlyOwner {
        require(bondTokenAddress_ != address(0), "Invalid bond token address");
        require(revenueEngine_ != address(0), "Invalid revenue engine address");

        bondTokenAddress = bondTokenAddress_;
        revenueEngine = revenueEngine_;
    }

    /**
     * @dev Deposit funds into escrow (investor buys bonds)
     * @param projectId_ Project ID
     * @param amount_ Amount to invest
     */
    function depositFunds(uint256 projectId_, uint256 amount_) public nonReentrant {
        require(amount_ > 0, "Amount must be greater than 0");

        // Calculate fee
        uint256 fee = (amount_ * issuanceFeePercentage) / 10000;
        uint256 bondAmount = amount_ - fee;

        // Create escrow ID
        bytes32 escrowId = keccak256(abi.encodePacked(projectId_, msg.sender, block.timestamp));

        // Record escrow
        escrowAccounts[escrowId] = EscrowAccount({
            projectId: projectId_,
            bondAmount: bondAmount,
            fundAmount: amount_,
            investor: msg.sender,
            refunded: false,
            releaseAmount: 0
        });

        // Track holdings
        investorHoldings[projectId_][msg.sender] += bondAmount;
        projectEscrowBalance[projectId_] += bondAmount;

        // Add investor to list if new
        if (investorHoldings[projectId_][msg.sender] == bondAmount) {
            projectInvestors[projectId_].push(msg.sender);
        }

        emit FundsDeposited(escrowId, projectId_, msg.sender, amount_, bondAmount);
    }

    /**
     * @dev Release funds to municipality upon milestone approval
     * @param projectId_ Project ID
     * @param milestoneIndex_ Milestone index
     * @param fundAmount_ Amount to release
     */
    function releaseFunds(
        uint256 projectId_,
        uint256 milestoneIndex_,
        uint256 fundAmount_
    ) public onlyOwner nonReentrant {
        require(fundAmount_ > 0, "Fund amount must be greater than 0");
        require(projectEscrowBalance[projectId_] >= fundAmount_, "Insufficient escrowed funds");

        projectEscrowBalance[projectId_] -= fundAmount_;

        // Here, actual fund transfer would happen
        emit FundsReleased(keccak256(abi.encodePacked(projectId_, milestoneIndex_)), projectId_, fundAmount_, milestoneIndex_);
    }

    /**
     * @dev Refund investor if project fails
     * @param escrowId_ Escrow ID
     */
    function refundInvestor(bytes32 escrowId_) public onlyOwner nonReentrant {
        EscrowAccount storage escrow = escrowAccounts[escrowId_];

        require(escrow.investor != address(0), "Invalid escrow ID");
        require(!escrow.refunded, "Already refunded");

        escrow.refunded = true;
        projectEscrowBalance[escrow.projectId] -= escrow.bondAmount;

        emit FundsRefunded(escrowId_, escrow.investor, escrow.bondAmount);
    }

    /**
     * @dev Void all escrowed funds for a project (project cancelled)
     * @param projectId_ Project ID
     */
    function voidProjectEscrow(uint256 projectId_) public onlyOwner nonReentrant {
        projectEscrowBalance[projectId_] = 0;
        emit ProjectEscrowVoid(projectId_);
    }

    /**
     * @dev Get escrow balance for a project
     * @param projectId_ Project ID
     * @return Current escrow balance
     */
    function getProjectEscrowBalance(uint256 projectId_) public view returns (uint256) {
        return projectEscrowBalance[projectId_];
    }

    /**
     * @dev Get investor holdings in a project
     * @param projectId_ Project ID
     * @param investor_ Investor address
     * @return Bond amount held
     */
    function getInvestorHoldings(uint256 projectId_, address investor_) public view returns (uint256) {
        return investorHoldings[projectId_][investor_];
    }

    /**
     * @dev Get list of investors for a project
     * @param projectId_ Project ID
     * @return Array of investor addresses
     */
    function getProjectInvestors(uint256 projectId_) public view returns (address[] memory) {
        return projectInvestors[projectId_];
    }

    /**
     * @dev Get escrow details
     * @param escrowId_ Escrow ID
     * @return EscrowAccount struct
     */
    function getEscrowDetails(bytes32 escrowId_) public view returns (EscrowAccount memory) {
        return escrowAccounts[escrowId_];
    }
}
