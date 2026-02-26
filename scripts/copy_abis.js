const fs = require('fs');
const path = require('path');

const contracts = [
  'BondToken',
  'ProjectRegistry',
  'MilestoneEscrow',
  'GovernanceDAO',
  'RepaymentManager',
  'RevenueEngine',
  'InsurancePool',
];

const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
const outDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts', 'abis');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

contracts.forEach((name) => {
  // artifact path can be under contracts/<Contract>.sol/<Contract>.json
  const possiblePath = path.join(artifactsDir, `${name}.sol`, `${name}.json`);
  if (!fs.existsSync(possiblePath)) {
    console.error('Artifact not found for', name, possiblePath);
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(possiblePath, 'utf8'));
  const abi = artifact.abi || [];
  const outPath = path.join(outDir, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(abi, null, 2));
  console.log('Wrote', outPath);
});

console.log('ABI copy complete.');
