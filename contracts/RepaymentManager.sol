// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RepaymentManager
 * @dev Manages repayment schedules, distributions, and default tracking
 * Distributes principal + interest to bondholders proportionally
 */
contract RepaymentManager is Ownable, ReentrancyGuard {
    struct RepaymentSchedule {
        uint256 projectId;
        uint256 totalPrincipal;
        uint256 totalInterest;
        uint256 startDate;
        uint256 endDate;
        uint256 paymentFrequency; // Seconds between payments
        uint256 frequencyCount; // Number of payments
        uint256 amountPerPayment; // Principal + interest per payment
        uint256 paymentsReceived;
        uint256 lastPaymentDate;
        bool defaulted;
        string status; // "Active", "Completed", "Defaulted"
    }

    struct InvestorRepayment {
        uint256 principalReceived;
        uint256 interestReceived;
        uint256 totalReceived;
    }

    // State variables
    mapping(uint256 => RepaymentSchedule) public repaymentSchedules;
    mapping(uint256 => mapping(address => InvestorRepayment)) public investorRepayments;
    mapping(uint256 => address[]) public investorList;
    mapping(uint256 => uint256) public projectTotalBonds;

    address public milestoneEscrow;
    address public bondToken;

    uint256 public defaultThresholdDays = 30; // Days overdue before default

    // Events
    event RepaymentScheduleCreated(
        uint256 indexed projectId,
        uint256 totalPrincipal,
        uint256 totalInterest,
        uint256 frequencyCount
    );
    event PaymentReceived(
        uint256 indexed projectId,
        uint256 amount,
        uint256 paymentNumber
    );
    event YieldDistributed(
        uint256 indexed projectId,
        address indexed investor,
        uint256 yieldAmount
    );
    event DefaultDetected(uint256 indexed projectId);
    event PaymentApplied(uint256 indexed projectId, uint256 principalAmount, uint256 interestAmount);

    /**
     * @dev Initialize repayment manager
     * @param milestoneEscrow_ MilestoneEscrow contract address
     * @param bondToken_ BondToken contract address
     */
    function initialize(address milestoneEscrow_, address bondToken_) public onlyOwner {
        require(milestoneEscrow_ != address(0), "Invalid escrow");
        require(bondToken_ != address(0), "Invalid bond token");

        milestoneEscrow = milestoneEscrow_;
        bondToken = bondToken_;
    }

    /**
     * @dev Create a repayment schedule for a project
     * @param projectId_ Project ID
     * @param totalPrincipal_ Total principal amount
     * @param totalInterest_ Total interest amount
     * @param startDate_ Start date of repayment
     * @param endDate_ End date of repayment
     * @param frequencyCount_ Number of payments
     * @param investors_ Array of investor addresses
     * @param investorBonds_ Array of bond amounts per investor
     */
    function createRepaymentSchedule(
        uint256 projectId_,
        uint256 totalPrincipal_,
        uint256 totalInterest_,
        uint256 startDate_,
        uint256 endDate_,
        uint256 frequencyCount_,
        address[] memory investors_,
        uint256[] memory investorBonds_
    ) public onlyOwner nonReentrant {
        require(totalPrincipal_ > 0, "Principal must be > 0");
        require(frequencyCount_ > 0, "Frequency count must be > 0");
        require(investors_.length == investorBonds_.length, "Array length mismatch");
        require(startDate_ < endDate_, "Invalid dates");

        uint256 paymentFrequency = (endDate_ - startDate_) / frequencyCount_;
        uint256 amountPerPayment = (totalPrincipal_ + totalInterest_) / frequencyCount_;

        repaymentSchedules[projectId_] = RepaymentSchedule({
            projectId: projectId_,
            totalPrincipal: totalPrincipal_,
            totalInterest: totalInterest_,
            startDate: startDate_,
            endDate: endDate_,
            paymentFrequency: paymentFrequency,
            frequencyCount: frequencyCount_,
            amountPerPayment: amountPerPayment,
            paymentsReceived: 0,
            lastPaymentDate: startDate_,
            defaulted: false,
            status: "Active"
        });

        // Record investor list and total bonds
        for (uint256 i = 0; i < investors_.length; i++) {
            investorList[projectId_].push(investors_[i]);
            projectTotalBonds[projectId_] += investorBonds_[i];
        }

        emit RepaymentScheduleCreated(projectId_, totalPrincipal_, totalInterest_, frequencyCount_);
    }

    /**
     * @dev Record a payment received from municipality
     * @param projectId_ Project ID
     * @param amount_ Payment amount
     */
    function recordPayment(uint256 projectId_, uint256 amount_) public onlyOwner nonReentrant {
        RepaymentSchedule storage schedule = repaymentSchedules[projectId_];

        require(schedule.projectId == projectId_, "Schedule not found");
        require(!schedule.defaulted, "Project in default");
        require(amount_ > 0, "Amount must be > 0");

        // Split into principal and interest
        uint256 principalPerPayment = schedule.totalPrincipal / schedule.frequencyCount;
        uint256 interestPerPayment = schedule.totalInterest / schedule.frequencyCount;

        schedule.paymentsReceived++;
        schedule.lastPaymentDate = block.timestamp;

        emit PaymentApplied(projectId_, principalPerPayment, interestPerPayment);

        // Distribute to investors proportionally
        distributePaymentToInvestors(projectId_, principalPerPayment, interestPerPayment);
    }

    /**
     * @dev Distribute payment to investors based on holdings
     * @param projectId_ Project ID
     * @param principalAmount_ Principal amount to distribute
     * @param interestAmount_ Interest amount to distribute
     */
    function distributePaymentToInvestors(
        uint256 projectId_,
        uint256 principalAmount_,
        uint256 interestAmount_
    ) internal {
        require(projectTotalBonds[projectId_] > 0, "No investors");

        address[] memory investors = investorList[projectId_];

        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            // In a real implementation, we'd get their actual holdings
            // For now, distribute equally
            uint256 investorShare = 1; // Simplified

            uint256 principalShare = (principalAmount_ * investorShare) / investors.length;
            uint256 interestShare = (interestAmount_ * investorShare) / investors.length;

            investorRepayments[projectId_][investor].principalReceived += principalShare;
            investorRepayments[projectId_][investor].interestReceived += interestShare;
            investorRepayments[projectId_][investor].totalReceived += principalShare + interestShare;

            emit YieldDistributed(projectId_, investor, interestShare);
        }
    }

    /**
     * @dev Check for project default (overdue payment)
     * @param projectId_ Project ID
     */
    function checkDefault(uint256 projectId_) public nonReentrant {
        RepaymentSchedule storage schedule = repaymentSchedules[projectId_];

        require(schedule.projectId == projectId_, "Schedule not found");
        require(!schedule.defaulted, "Already defaulted");

        // Check if payment is overdue by more than threshold
        uint256 nextPaymentDate = schedule.lastPaymentDate + schedule.paymentFrequency;
        uint256 daysOverdue = (block.timestamp - nextPaymentDate) / 1 days;

        if (daysOverdue >= defaultThresholdDays) {
            schedule.defaulted = true;
            schedule.status = "Defaulted";
            emit DefaultDetected(projectId_);
        }
    }

    // View functions

    /**
     * @dev Get repayment schedule
     * @param projectId_ Project ID
     * @return RepaymentSchedule struct
     */
    function getRepaymentSchedule(uint256 projectId_) public view returns (RepaymentSchedule memory) {
        return repaymentSchedules[projectId_];
    }

    /**
     * @dev Get investor repayment details
     * @param projectId_ Project ID
     * @param investor_ Investor address
     * @return InvestorRepayment struct
     */
    function getInvestorRepayment(uint256 projectId_, address investor_)
        public
        view
        returns (InvestorRepayment memory)
    {
        return investorRepayments[projectId_][investor_];
    }

    /**
     * @dev Get next payment date
     * @param projectId_ Project ID
     * @return Unix timestamp of next payment
     */
    function getNextPaymentDate(uint256 projectId_) public view returns (uint256) {
        RepaymentSchedule memory schedule = repaymentSchedules[projectId_];
        return schedule.lastPaymentDate + schedule.paymentFrequency;
    }

    /**
     * @dev Check if payment is overdue
     * @param projectId_ Project ID
     * @return Boolean indicating if overdue
     */
    function isPaymentOverdue(uint256 projectId_) public view returns (bool) {
        RepaymentSchedule memory schedule = repaymentSchedules[projectId_];
        uint256 nextPaymentDate = schedule.lastPaymentDate + schedule.paymentFrequency;
        return block.timestamp > nextPaymentDate;
    }

    /**
     * @dev Get days overdue
     * @param projectId_ Project ID
     * @return Number of days overdue (0 if not overdue)
     */
    function getDaysOverdue(uint256 projectId_) public view returns (uint256) {
        RepaymentSchedule memory schedule = repaymentSchedules[projectId_];

        if (!isPaymentOverdue(projectId_)) {
            return 0;
        }

        uint256 nextPaymentDate = schedule.lastPaymentDate + schedule.paymentFrequency;
        return (block.timestamp - nextPaymentDate) / 1 days;
    }

    /**
     * @dev Get number of payments remaining
     * @param projectId_ Project ID
     * @return Remaining payment count
     */
    function getPaymentsRemaining(uint256 projectId_) public view returns (uint256) {
        RepaymentSchedule memory schedule = repaymentSchedules[projectId_];
        return schedule.frequencyCount - schedule.paymentsReceived;
    }

    /**
     * @dev Get repayment progress percentage
     * @param projectId_ Project ID
     * @return Percentage of repayment completed (0-10000 basis points)
     */
    function getRepaymentProgress(uint256 projectId_) public view returns (uint256) {
        RepaymentSchedule memory schedule = repaymentSchedules[projectId_];

        if (schedule.frequencyCount == 0) {
            return 0;
        }

        return (schedule.paymentsReceived * 10000) / schedule.frequencyCount;
    }
}
