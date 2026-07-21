import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const readText = relativePath => readFileSync(join(root, relativePath), 'utf8');
const readJson = relativePath => JSON.parse(readText(relativePath));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const resources = readJson('public/resources.json');
  assert(Array.isArray(resources) && resources.length > 0, 'public/resources.json must contain a non-empty array');
  assert(resources.every(resource => resource.id && resource.slug), 'Every resource must contain id and slug');

  const openApi = readJson('public/openapi.json');
  assert(openApi.openapi === '3.1.0', 'public/openapi.json must use OpenAPI 3.1.0');
  for (const path of [
    '/api/resources',
    '/api/resources/{id}',
    '/api/facets',
    '/api/health',
    '/.well-known/agent-card.json',
  ]) {
    assert(openApi.paths?.[path]?.get, `OpenAPI path missing: ${path}`);
  }

  const agentCard = readJson('public/.well-known/agent-card.json');
  assert(agentCard.url === 'https://yourselftoscience.org', 'Agent card URL is invalid');
  assert(agentCard.endpoints?.openapi === 'https://yourselftoscience.org/openapi.json', 'Agent card OpenAPI endpoint is invalid');
  assert(agentCard.endpoints?.resources === 'https://yourselftoscience.org/api/resources', 'Agent card resources endpoint is invalid');

  for (const file of ['public/llms.txt', 'public/llms-full.txt']) {
    assert(readText(file).trim().length > 100, `${file} is missing or unexpectedly short`);
  }

  console.log('Validated generated AI and agent artifacts');
} catch (error) {
  console.error('Agent artifact validation failed:', error);
  process.exit(1);
}
