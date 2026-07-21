import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const path = join(process.cwd(), 'public/openapi.json');
const schema = JSON.parse(readFileSync(path, 'utf8'));

const jsonResponse = description => ({
  description,
  content: { 'application/json': { schema: { type: 'object' } } },
});

schema.info.version = '1.1.0';
schema.info.description += ' The API also provides Cloudflare Edge endpoints designed for tool-using AI agents.';
schema.paths['/api/resources'] = {
  get: {
    summary: 'Search and filter catalogue resources',
    operationId: 'searchResources',
    description: 'Returns a paginated list. Boolean query values must be true or false.',
    parameters: [
      ['q', 'Full-text search across the resource record'],
      ['country', 'Exact country label'],
      ['dataType', 'Exact data-type label'],
      ['compensation', 'Exact compensation type'],
      ['category', 'Exact entity category'],
      ['activelyRecruiting', 'Filter by recruitment status', 'boolean'],
      ['openData', 'Filter by open-data status', 'boolean'],
      ['hasApi', 'Filter by API availability', 'boolean'],
      ['limit', 'Page size, from 1 to 100', 'integer'],
      ['offset', 'Zero-based pagination offset', 'integer'],
      ['view', 'Use full for complete records; default is summary'],
    ].map(([name, description, type = 'string']) => ({ name, in: 'query', required: false, description, schema: { type } })),
    responses: { 200: jsonResponse('Paginated resource results'), 503: jsonResponse('Dataset temporarily unavailable') },
  },
};
schema.paths['/api/resources/{id}'] = {
  get: {
    summary: 'Get one resource by stable ID or slug',
    operationId: 'getResource',
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    responses: { 200: jsonResponse('Complete resource record'), 404: jsonResponse('Resource not found'), 503: jsonResponse('Dataset temporarily unavailable') },
  },
};
schema.paths['/api/facets'] = {
  get: {
    summary: 'Get available filter facets and counts',
    operationId: 'getFacets',
    responses: { 200: jsonResponse('Facet values and counts'), 503: jsonResponse('Dataset temporarily unavailable') },
  },
};
schema.paths['/api/health'] = {
  get: {
    summary: 'Check edge API and dataset health',
    operationId: 'getApiHealth',
    responses: { 200: jsonResponse('Service healthy'), 503: jsonResponse('Service degraded') },
  },
};
schema.paths['/.well-known/agent-card.json'] = {
  get: {
    summary: 'Get agent discovery metadata',
    operationId: 'getAgentCard',
    responses: { 200: jsonResponse('Agent card') },
  },
};

writeFileSync(path, JSON.stringify(schema, null, 2), 'utf8');
console.log('Extended openapi.json with agent endpoints');
