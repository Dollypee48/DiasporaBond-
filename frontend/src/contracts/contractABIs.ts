// Contract ABIs - these are imported from compiled artifacts
// After deployment, update these with actual ABIs from build/contracts/*.json

import BondTokenAbi from './abis/BondToken.json';
import ProjectRegistryAbi from './abis/ProjectRegistry.json';
import MilestoneEscrowAbi from './abis/MilestoneEscrow.json';
import GovernanceDAOAbi from './abis/GovernanceDAO.json';
import RepaymentManagerAbi from './abis/RepaymentManager.json';
import RevenueEngineAbi from './abis/RevenueEngine.json';
import InsurancePoolAbi from './abis/InsurancePool.json';

export const CONTRACT_ABIS = {
  BondToken: BondTokenAbi,
  ProjectRegistry: ProjectRegistryAbi,
  MilestoneEscrow: MilestoneEscrowAbi,
  GovernanceDAO: GovernanceDAOAbi,
  RepaymentManager: RepaymentManagerAbi,
  RevenueEngine: RevenueEngineAbi,
  InsurancePool: InsurancePoolAbi,
};
