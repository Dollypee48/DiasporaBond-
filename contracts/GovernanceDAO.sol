// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GovernanceDAO
 * @dev Manages voting on project milestones and governance proposals
 * Implements quorum-based voting with time-lock execution
 */
contract GovernanceDAO is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}
    enum ProposalStatus {
        Pending,
        Active,
        Passed,
        Failed,
        Executed
    }

    struct Proposal {
        uint256 id;
        uint256 projectId;
        uint256 milestoneIndex;
        string title;
        string description;
        address proposer;
        uint256 createdAt;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalStatus status;
        address releaseTarget; // Municipality address
        uint256 releaseAmount; // Amount to release
        bool executed;
    }

    // State variables
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted; // proposalId => voter => voted
    mapping(uint256 => mapping(address => uint8)) public voteType; // 0 = no, 1 = yes, 2 = abstain

    uint256 public proposalCounter;

    // Governance parameters
    uint256 public votingPeriod = 3 days;
    uint256 public executionDelay = 1 days;
    uint256 public quorumPercentage = 5000; // 50% (basis points)
    address public projectRegistry;
    address public milestoneEscrow;
    address public bondToken;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed projectId,
        uint256 milestoneIndex,
        address indexed proposer
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 voteType,
        uint256 weight
    );
    event ProposalPassed(uint256 indexed proposalId);
    event ProposalFailed(uint256 indexed proposalId);
    event ProposalExecuted(uint256 indexed proposalId);
    event QuorumUpdated(uint256 newQuorum);

    /**
     * @dev Initialize DAO with contract addresses
     * @param projectRegistry_ ProjectRegistry contract address
     * @param milestoneEscrow_ MilestoneEscrow contract address
     * @param bondToken_ BondToken contract address
     */
    function initialize(
        address projectRegistry_,
        address milestoneEscrow_,
        address bondToken_
    ) public onlyOwner {
        require(projectRegistry_ != address(0), "Invalid project registry");
        require(milestoneEscrow_ != address(0), "Invalid milestone escrow");
        require(bondToken_ != address(0), "Invalid bond token");

        projectRegistry = projectRegistry_;
        milestoneEscrow = milestoneEscrow_;
        bondToken = bondToken_;
    }

    /**
     * @dev Create a new proposal for milestone approval
     * @param projectId_ Project ID
     * @param milestoneIndex_ Milestone index
     * @param title_ Proposal title
     * @param description_ Proposal description
     * @param releaseTarget_ Municipality address
     * @param releaseAmount_ Amount to release
     */
    function createProposal(
        uint256 projectId_,
        uint256 milestoneIndex_,
        string memory title_,
        string memory description_,
        address releaseTarget_,
        uint256 releaseAmount_
    ) public nonReentrant returns (uint256) {
        uint256 proposalId = proposalCounter++;

        proposals[proposalId] = Proposal({
            id: proposalId,
            projectId: projectId_,
            milestoneIndex: milestoneIndex_,
            title: title_,
            description: description_,
            proposer: msg.sender,
            createdAt: block.timestamp,
            startTime: block.timestamp,
            endTime: block.timestamp + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            status: ProposalStatus.Active,
            releaseTarget: releaseTarget_,
            releaseAmount: releaseAmount_,
            executed: false
        });

        emit ProposalCreated(proposalId, projectId_, milestoneIndex_, msg.sender);
        return proposalId;
    }

    /**
     * @dev Cast a vote on a proposal
     * @param proposalId_ Proposal ID
     * @param voteType_ 0 = against, 1 = for, 2 = abstain
     */
    function vote(uint256 proposalId_, uint8 voteType_) public nonReentrant {
        require(proposalId_ < proposalCounter, "Invalid proposal ID");
        require(!hasVoted[proposalId_][msg.sender], "Already voted");
        require(voteType_ <= 2, "Invalid vote type");

        Proposal storage proposal = proposals[proposalId_];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");

        // Get voter's bond token balance (voting weight)
        uint256 weight = IERC20(bondToken).balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        hasVoted[proposalId_][msg.sender] = true;
        voteType[proposalId_][msg.sender] = voteType_;

        if (voteType_ == 0) {
            proposal.againstVotes += weight;
        } else if (voteType_ == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        emit VoteCast(proposalId_, msg.sender, voteType_, weight);
    }

    /**
     * @dev Finalize a proposal (check if passed)
     * @param proposalId_ Proposal ID
     */
    function finalizeProposal(uint256 proposalId_) public nonReentrant {
        require(proposalId_ < proposalCounter, "Invalid proposal ID");

        Proposal storage proposal = proposals[proposalId_];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(proposal.status == ProposalStatus.Active, "Proposal already finalized");

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        require(totalVotes > 0, "No votes cast");

        // Check quorum
        uint256 quorumRequired = (IERC20(bondToken).totalSupply() * quorumPercentage) / 10000;

        if (totalVotes >= quorumRequired && proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.Passed;
            emit ProposalPassed(proposalId_);
        } else {
            proposal.status = ProposalStatus.Failed;
            emit ProposalFailed(proposalId_);
        }
    }

    /**
     * @dev Execute a passed proposal (after time-lock)
     * @param proposalId_ Proposal ID
     */
    function executeProposal(uint256 proposalId_) public onlyOwner nonReentrant {
        require(proposalId_ < proposalCounter, "Invalid proposal ID");

        Proposal storage proposal = proposals[proposalId_];
        require(proposal.status == ProposalStatus.Passed, "Proposal not passed");
        require(!proposal.executed, "Already executed");
        require(block.timestamp >= proposal.endTime + executionDelay, "Time-lock not expired");

        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;

        emit ProposalExecuted(proposalId_);
    }

    /**
     * @dev Update quorum percentage
     * @param newQuorum_ New quorum (basis points)
     */
    function updateQuorum(uint256 newQuorum_) public onlyOwner {
        require(newQuorum_ <= 10000, "Invalid quorum");
        quorumPercentage = newQuorum_;
        emit QuorumUpdated(newQuorum_);
    }

    /**
     * @dev Update voting period
     * @param newPeriod_ New voting period in seconds
     */
    function updateVotingPeriod(uint256 newPeriod_) public onlyOwner {
        require(newPeriod_ > 0, "Period must be > 0");
        votingPeriod = newPeriod_;
    }

    // View functions

    /**
     * @dev Get proposal details
     * @param proposalId_ Proposal ID
     * @return Proposal struct
     */
    function getProposal(uint256 proposalId_) public view returns (Proposal memory) {
        require(proposalId_ < proposalCounter, "Invalid proposal ID");
        return proposals[proposalId_];
    }

    /**
     * @dev Get voting weight for an address
     * @param voter_ Voter address
     * @return Voting weight (bond token balance)
     */
    function getVotingWeight(address voter_) public view returns (uint256) {
        return IERC20(bondToken).balanceOf(voter_);
    }

    /**
     * @dev Check if proposal passed (simple majority)
     * @param proposalId_ Proposal ID
     * @return Boolean indicating if proposal passed
     */
    function didProposalPass(uint256 proposalId_) public view returns (bool) {
        require(proposalId_ < proposalCounter, "Invalid proposal ID");
        Proposal memory proposal = proposals[proposalId_];

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        require(totalVotes > 0, "No votes");

        uint256 quorumRequired = (IERC20(bondToken).totalSupply() * quorumPercentage) / 10000;

        return totalVotes >= quorumRequired && proposal.forVotes > proposal.againstVotes;
    }

    /**
     * @dev Get total proposals
     * @return Proposal count
     */
    function getTotalProposals() public view returns (uint256) {
        return proposalCounter;
    }
}
