// Frontend Constants and Configuration

export const CONTRACT_ADDRESSES = {
  BondToken: import.meta.env.VITE_BOND_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  ProjectRegistry: import.meta.env.VITE_PROJECT_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000",
  MilestoneEscrow: import.meta.env.VITE_MILESTONE_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000",
  GovernanceDAO: import.meta.env.VITE_GOVERNANCE_DAO_ADDRESS || "0x0000000000000000000000000000000000000000",
  RepaymentManager: import.meta.env.VITE_REPAYMENT_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000",
  RevenueEngine: import.meta.env.VITE_REVENUE_ENGINE_ADDRESS || "0x0000000000000000000000000000000000000000",
  InsurancePool: import.meta.env.VITE_INSURANCE_POOL_ADDRESS || "0x0000000000000000000000000000000000000000",
};

export const NETWORK_CONFIG = {
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || "102031"),
  rpcUrl: import.meta.env.VITE_CREDITCOIN_RPC || "https://rpc.cc3-testnet.creditcoin.network",
  networkName: import.meta.env.VITE_NETWORK_NAME || "Creditcoin Testnet",
};

export const IPFS_CONFIG = {
  gateway: import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud",
  api: import.meta.env.VITE_IPFS_API || "https://api.pinata.cloud",
};

export const PROJECT_STATUS = {
  0: "Pending",
  1: "Active",
  2: "Funds Raised",
  3: "In Progress",
  4: "Completed",
  5: "Defaulted",
};

export const PROPOSAL_STATUS = {
  0: "Pending",
  1: "Active",
  2: "Passed",
  3: "Failed",
  4: "Executed",
};

export const MILESTONE_STATUS = {
  pending: "Not Started",
  inProgress: "In Progress",
  completed: "Completed",
  approved: "Approved",
};

export const FEE_PERCENTAGES = {
  issuance: 200, // 2% (basis points)
  servicing: 100, // 1% (basis points)
  insurance: 150, // 1.5% (basis points)
};

export const UI_CONFIG = {
  enableInsurance: import.meta.env.VITE_ENABLE_INSURANCE === "true",
  enableDAO: import.meta.env.VITE_ENABLE_DAO_VOTING === "true",
  enableRepayments: import.meta.env.VITE_ENABLE_REPAYMENTS === "true",
};

// Common formatting constants
export const DECIMALS = 18;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Time constants (in seconds)
export const TIME_CONSTANTS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000, // 30 days
  YEAR: 31536000, // 365 days
};

// Default parameters
export const DEFAULTS = {
  QUORUM_PERCENTAGE: 5000, // 50%
  VOTING_PERIOD: 3 * TIME_CONSTANTS.DAY,
  EXECUTION_DELAY: TIME_CONSTANTS.DAY,
};
