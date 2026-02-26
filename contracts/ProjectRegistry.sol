// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProjectRegistry
 * @dev Manages the registration and tracking of municipal bond projects
 * Stores project metadata, milestones, and IPFS references
 */
contract ProjectRegistry is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}
    // Project status enum
    enum ProjectStatus {
        Pending,
        Active,
        FundsRaised,
        InProgress,
        Completed,
        Defaulted
    }

    // Milestone struct
    struct Milestone {
        string title;
        string description;
        uint256 targetDate;
        uint256 fundAmount; // Amount to be released at this milestone
        bool completed;
        bool approved;
        uint256 completionDate;
    }

    // Project struct
    struct Project {
        uint256 id;
        string name;
        string description;
        address municipality;
        string location;
        uint256 targetAmount; // Target amount to raise
        uint256 raisedAmount;
        uint256 yieldPercentage; // Annual yield (basis points)
        uint256 duration; // Duration in seconds
        uint256 createDate;
        ProjectStatus status;
        string ipfsHash; // IPFS hash for project documents
        address bondTokenAddress;
        uint256 totalMilestones;
        bool insuranceRequired;
    }

    // State variables
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone[]) public projectMilestones;
    mapping(address => uint256[]) public municipalityProjects;

    uint256 public projectCounter;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed municipality,
        string name,
        uint256 targetAmount
    );
    event MilestoneAdded(uint256 indexed projectId, uint256 milestoneIndex);
    event MilestoneCompleted(uint256 indexed projectId, uint256 milestoneIndex);
    event MilestoneApproved(uint256 indexed projectId, uint256 milestoneIndex);
    event ProjectStatusUpdated(uint256 indexed projectId, ProjectStatus newStatus);
    event FundsRaised(uint256 indexed projectId, uint256 amount);
    event IPFSHashUpdated(uint256 indexed projectId, string newHash);

    /**
     * @dev Create a new project (callable by municipality)
     * @param name_ Project name
     * @param description_ Project description
     * @param location_ Project location
     * @param targetAmount_ Amount to raise
     * @param yieldPercentage_ Annual yield (basis points)
     * @param duration_ Project duration in seconds
     * @param ipfsHash_ IPFS hash for documents
     * @param bondTokenAddress_ Address of the bond token contract
     * @param insuranceRequired_ Whether insurance is required
     */
    function createProject(
        string memory name_,
        string memory description_,
        string memory location_,
        uint256 targetAmount_,
        uint256 yieldPercentage_,
        uint256 duration_,
        string memory ipfsHash_,
        address bondTokenAddress_,
        bool insuranceRequired_
    ) public nonReentrant returns (uint256) {
        require(targetAmount_ > 0, "Target amount must be greater than 0");
        require(yieldPercentage_ <= 10000, "Yield cannot exceed 100%");
        require(duration_ > 0, "Duration must be greater than 0");
        require(bondTokenAddress_ != address(0), "Invalid bond token address");

        uint256 projectId = projectCounter++;

        projects[projectId] = Project({
            id: projectId,
            name: name_,
            description: description_,
            municipality: msg.sender,
            location: location_,
            targetAmount: targetAmount_,
            raisedAmount: 0,
            yieldPercentage: yieldPercentage_,
            duration: duration_,
            createDate: block.timestamp,
            status: ProjectStatus.Pending,
            ipfsHash: ipfsHash_,
            bondTokenAddress: bondTokenAddress_,
            totalMilestones: 0,
            insuranceRequired: insuranceRequired_
        });

        municipalityProjects[msg.sender].push(projectId);

        emit ProjectCreated(projectId, msg.sender, name_, targetAmount_);
        return projectId;
    }

    /**
     * @dev Add a milestone to a project
     * @param projectId_ Project ID
     * @param title_ Milestone title
     * @param description_ Milestone description
     * @param targetDate_ Target completion date (Unix timestamp)
     * @param fundAmount_ Amount to release at this milestone
     */
    function addMilestone(
        uint256 projectId_,
        string memory title_,
        string memory description_,
        uint256 targetDate_,
        uint256 fundAmount_
    ) public nonReentrant {
        require(projectExists(projectId_), "Project does not exist");
        require(projects[projectId_].municipality == msg.sender, "Only municipality can add milestones");
        require(targetDate_ > block.timestamp, "Target date must be in the future");
        require(fundAmount_ > 0, "Fund amount must be greater than 0");

        Milestone memory newMilestone = Milestone({
            title: title_,
            description: description_,
            targetDate: targetDate_,
            fundAmount: fundAmount_,
            completed: false,
            approved: false,
            completionDate: 0
        });

        projectMilestones[projectId_].push(newMilestone);
        projects[projectId_].totalMilestones++;

        emit MilestoneAdded(projectId_, projects[projectId_].totalMilestones - 1);
    }

    /**
     * @dev Mark a milestone as completed
     * @param projectId_ Project ID
     * @param milestoneIndex_ Milestone index
     */
    function completeMilestone(uint256 projectId_, uint256 milestoneIndex_) public nonReentrant {
        require(projectExists(projectId_), "Project does not exist");
        require(projects[projectId_].municipality == msg.sender, "Only municipality can complete milestones");
        require(milestoneIndex_ < projectMilestones[projectId_].length, "Invalid milestone index");
        require(!projectMilestones[projectId_][milestoneIndex_].completed, "Milestone already completed");

        projectMilestones[projectId_][milestoneIndex_].completed = true;
        projectMilestones[projectId_][milestoneIndex_].completionDate = block.timestamp;

        emit MilestoneCompleted(projectId_, milestoneIndex_);
    }

    /**
     * @dev Approve a completed milestone (callable by governance)
     * @param projectId_ Project ID
     * @param milestoneIndex_ Milestone index
     */
    function approveMilestone(uint256 projectId_, uint256 milestoneIndex_) public onlyOwner nonReentrant {
        require(projectExists(projectId_), "Project does not exist");
        require(milestoneIndex_ < projectMilestones[projectId_].length, "Invalid milestone index");
        require(projectMilestones[projectId_][milestoneIndex_].completed, "Milestone not yet completed");
        require(!projectMilestones[projectId_][milestoneIndex_].approved, "Milestone already approved");

        projectMilestones[projectId_][milestoneIndex_].approved = true;

        emit MilestoneApproved(projectId_, milestoneIndex_);
    }

    /**
     * @dev Update project status
     * @param projectId_ Project ID
     * @param newStatus_ New project status
     */
    function updateProjectStatus(uint256 projectId_, ProjectStatus newStatus_) public onlyOwner nonReentrant {
        require(projectExists(projectId_), "Project does not exist");
        projects[projectId_].status = newStatus_;
        emit ProjectStatusUpdated(projectId_, newStatus_);
    }

    /**
     * @dev Record funds raised for a project
     * @param projectId_ Project ID
     * @param amount_ Amount raised
     */
    function recordFundsRaised(uint256 projectId_, uint256 amount_) public onlyOwner nonReentrant {
        require(projectExists(projectId_), "Project does not exist");
        require(amount_ > 0, "Amount must be greater than 0");

        projects[projectId_].raisedAmount += amount_;

        if (projects[projectId_].raisedAmount >= projects[projectId_].targetAmount) {
            updateProjectStatus(projectId_, ProjectStatus.FundsRaised);
        }

        emit FundsRaised(projectId_, amount_);
    }

    /**
     * @dev Update IPFS hash for project documents
     * @param projectId_ Project ID
     * @param newHash_ New IPFS hash
     */
    function updateIPFSHash(uint256 projectId_, string memory newHash_) public nonReentrant {
        require(projectExists(projectId_), "Project does not exist");
        require(projects[projectId_].municipality == msg.sender, "Only municipality can update IPFS hash");
        require(bytes(newHash_).length > 0, "IPFS hash cannot be empty");

        projects[projectId_].ipfsHash = newHash_;
        emit IPFSHashUpdated(projectId_, newHash_);
    }

    // View functions

    /**
     * @dev Check if a project exists
     * @param projectId_ Project ID
     * @return Boolean indicating if project exists
     */
    function projectExists(uint256 projectId_) public view returns (bool) {
        return projectId_ < projectCounter;
    }

    /**
     * @dev Get project details
     * @param projectId_ Project ID
     * @return Project struct
     */
    function getProject(uint256 projectId_) public view returns (Project memory) {
        require(projectExists(projectId_), "Project does not exist");
        return projects[projectId_];
    }

    /**
     * @dev Get milestone details
     * @param projectId_ Project ID
     * @param milestoneIndex_ Milestone index
     * @return Milestone struct
     */
    function getMilestone(uint256 projectId_, uint256 milestoneIndex_)
        public
        view
        returns (Milestone memory)
    {
        require(projectExists(projectId_), "Project does not exist");
        require(milestoneIndex_ < projectMilestones[projectId_].length, "Invalid milestone index");
        return projectMilestones[projectId_][milestoneIndex_];
    }

    /**
     * @dev Get all milestones for a project
     * @param projectId_ Project ID
     * @return Array of Milestone structs
     */
    function getProjectMilestones(uint256 projectId_) public view returns (Milestone[] memory) {
        require(projectExists(projectId_), "Project does not exist");
        return projectMilestones[projectId_];
    }

    /**
     * @dev Get projects by municipality
     * @param municipality_ Municipality address
     * @return Array of project IDs
     */
    function getMunicipalityProjects(address municipality_) public view returns (uint256[] memory) {
        return municipalityProjects[municipality_];
    }

    /**
     * @dev Get total number of projects
     * @return Total project count
     */
    function getTotalProjects() public view returns (uint256) {
        return projectCounter;
    }

    /**
     * @dev Check if all milestones are approved
     * @param projectId_ Project ID
     * @return Boolean indicating if all milestones are approved
     */
    function allMilestonesApproved(uint256 projectId_) public view returns (bool) {
        require(projectExists(projectId_), "Project does not exist");

        Milestone[] memory milestones = projectMilestones[projectId_];
        for (uint256 i = 0; i < milestones.length; i++) {
            if (!milestones[i].approved) {
                return false;
            }
        }
        return true;
    }
}
