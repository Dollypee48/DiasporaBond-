// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BondToken
 * @dev ERC-20 token representing tokenized municipal bonds
 * Allows minting of bonds when investors contribute capital
 * Allows burning of bonds upon redemption or default
 */
contract BondToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    // Bond metadata
    string public bondDescription;
    uint256 public yieldPercentage; // Annual yield (e.g., 1000 = 10%)
    uint256 public maturityTimestamp;

    // Events
    event BondsMinted(address indexed to, uint256 amount);
    event BondsBurned(address indexed from, uint256 amount);
    event YieldUpdated(uint256 newYield);

    /**
     * @dev Initialize the BondToken
     * @param name_ Token name (e.g., "Lagos Water Bond 2024")
     * @param symbol_ Token symbol (e.g., "LWB24")
     * @param description_ Bond description
     * @param yield_ Annual yield percentage (in basis points, e.g., 1000 = 10%)
     * @param maturity_ Maturity timestamp (Unix timestamp in seconds)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory description_,
        uint256 yield_,
        uint256 maturity_
    ) ERC20(name_, symbol_) {
        require(yield_ <= 10000, "Yield cannot exceed 100%");
        require(maturity_ > block.timestamp, "Maturity must be in the future");

        bondDescription = description_;
        yieldPercentage = yield_;
        maturityTimestamp = maturity_;
    }

    /**
     * @dev Mint new bonds (callable only by project owner/contract)
     * @param to Address receiving the bonds
     * @param amount Amount of bonds to mint
     */
    function mint(address to, uint256 amount) public onlyOwner nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Mint amount must be greater than 0");

        _mint(to, amount);
        emit BondsMinted(to, amount);
    }

    /**
     * @dev Burn bonds (callable by owner - removes from circulation)
     * @param amount Amount of bonds to burn
     */
    function burnBonds(uint256 amount) public onlyOwner nonReentrant {
        require(amount > 0, "Burn amount must be greater than 0");
        _burn(msg.sender, amount);
        emit BondsBurned(msg.sender, amount);
    }

    /**
     * @dev Update the yield percentage
     * @param newYield New annual yield (in basis points)
     */
    function updateYield(uint256 newYield) public onlyOwner {
        require(newYield <= 10000, "Yield cannot exceed 100%");
        yieldPercentage = newYield;
        emit YieldUpdated(newYield);
    }

    /**
     * @dev Check if the bond has matured
     * @return Boolean indicating if maturity date has passed
     */
    function hasMatured() public view returns (bool) {
        return block.timestamp >= maturityTimestamp;
    }

    /**
     * @dev Get remaining time until maturity
     * @return Seconds until maturity (0 if matured)
     */
    function timeToMaturity() public view returns (uint256) {
        if (block.timestamp >= maturityTimestamp) {
            return 0;
        }
        return maturityTimestamp - block.timestamp;
    }

    /**
     * @dev Calculate accrued yield for a given amount and duration
     * @param principal Bond amount held
     * @param startTime Start timestamp of holding period
     * @param endTime End timestamp of holding period
     * @return Calculated yield amount
     */
    function calculateYield(
        uint256 principal,
        uint256 startTime,
        uint256 endTime
    ) public view returns (uint256) {
        require(endTime >= startTime, "End time must be >= start time");

        uint256 duration = endTime - startTime;
        uint256 secondsPerYear = 365 days;

        // Formula: principal * (yieldPercentage / 10000) * (duration / secondsPerYear)
        return (principal * yieldPercentage * duration) / (10000 * secondsPerYear);
    }

    /**
     * @dev Get bond metadata
     * @return name Bond name
     * @return symbol Bond symbol
     * @return description Bond description
     * @return yield Annual yield percentage
     * @return maturity Maturity timestamp
     */
    function getBondMetadata()
        public
        view
        returns (
            string memory name,
            string memory symbol,
            string memory description,
            uint256 yield,
            uint256 maturity
        )
    {
        return (
            name(),
            symbol(),
            bondDescription,
            yieldPercentage,
            maturityTimestamp
        );
    }

    // Override _update to ensure proper token accounting
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._update(from, to, amount);
    }
}
