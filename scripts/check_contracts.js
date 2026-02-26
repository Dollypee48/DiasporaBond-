const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

async function main(){
  const rpc = process.env.CREDITCOIN_RPC_URL || process.env.VITE_CREDITCOIN_RPC || 'https://rpc.cc3-testnet.creditcoin.network';
  const deploymentsPath = path.join(__dirname, '..', 'deployments.json');
  if(!fs.existsSync(deploymentsPath)){
    console.error('deployments.json not found');
    process.exit(1);
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
  const contracts = deployments.contracts || {};

  const provider = new ethers.JsonRpcProvider(rpc);

  // Load ABI from artifacts if available
  const bondArtifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'BondToken.sol', 'BondToken.json');
  const projectArtifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'ProjectRegistry.sol', 'ProjectRegistry.json');

  if(!fs.existsSync(bondArtifactPath) || !fs.existsSync(projectArtifactPath)){
    console.error('Compiled artifacts not found in artifacts/. Please run `npx hardhat compile` first.');
    process.exit(1);
  }

  const bondAbi = JSON.parse(fs.readFileSync(bondArtifactPath, 'utf8')).abi;
  const projectAbi = JSON.parse(fs.readFileSync(projectArtifactPath, 'utf8')).abi;

  const bondAddr = contracts.BondToken;
  const projectAddr = contracts.ProjectRegistry;

  const bond = new ethers.Contract(bondAddr, bondAbi, provider);
  const project = new ethers.Contract(projectAddr, projectAbi, provider);

  try{
    const meta = await bond.getBondMetadata();
    console.log('Bond metadata:', {
      name: meta[0] || meta.name,
      symbol: meta[1] || meta.symbol,
      description: meta[2] || meta.description,
      yield: meta[3] || meta.yield,
      maturity: meta[4] || meta.maturity,
    });
  }catch(e){
    console.error('Failed to read bond metadata:', e.message || e);
  }

  try{
    const total = await project.getTotalProjects();
    console.log('Total projects:', total.toString ? total.toString() : total);
  }catch(e){
    console.error('Failed to read total projects:', e.message || e);
  }
}

main().catch((e)=>{console.error(e); process.exit(1);});
