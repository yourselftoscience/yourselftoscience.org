import { readFileSync } from 'node:fs';

const [runtimePath, fullPath] = process.argv.slice(2);
if (!runtimePath || !fullPath) {
  console.error('Usage: node scripts/enforceRuntimeAudit.js <runtime-report> <full-report>');
  process.exit(2);
}

const readReport = path => JSON.parse(readFileSync(path, 'utf8'));
const runtime = readReport(runtimePath);
const full = readReport(fullPath);
const runtimeCounts = runtime.metadata?.vulnerabilities || {};
const fullCounts = full.metadata?.vulnerabilities || {};

console.log('Runtime dependency audit:', runtimeCounts);
console.log('Full build-chain audit:', fullCounts);

if ((runtimeCounts.high || 0) > 0 || (runtimeCounts.critical || 0) > 0) {
  console.error('High or critical vulnerabilities remain in runtime dependencies.');
  process.exit(1);
}
