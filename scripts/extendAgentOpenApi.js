import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const path = join(process.cwd(), 'public/openapi.json');
const schema = JSON.parse(readFileSync(path, 'utf8'));

const jsonResponse = description => ({
  description,
  content: { 'application/json': { schema: { type: 'object' } } },
});

const textParameter = (name, description, maxLength) => ({
  name,
  in: 'query',
  required: false,
  description,
  schema: { type: 'string', maxLength },
});

const booleanParameter = (name, description) => ({
  name,
  in: 'query',
  required: false,
  description,
  schema: { type: 'boolean' },
});

schema.info.version = '1.1.0';
schema.info.description += ' The API also provides Cloudflare Edge endpoints designed for tool-using AI agents.';
schema.paths['/api/resources'] = {
  get: {
    summary: 'Search and filter catalogue resources',
    operationId: 'searchResources',
    description: 'Returns a paginated list. Invalid, duplicated, oversized, or ambiguous query parameters return HTTP 400.',
    security: [],
    parameters: [
      textParameter('q', 'Full-text search across selected resource metadata', 256),
      textParameter('country', 'Exact country label', 128),
      textParameter('dataType', 'Exact data-type label', 128),
      textParameter('compensation', 'Exact compensation type', 128),
      textParameter('category', 'Exact entity category', 128),
      booleanParameter('activelyRecruiting', 'Filter by known recruitment status; unknown values do not match false'),
      booleanParameter('openData', 'Filter by known open-data status; unknown values do not match false'),
      booleanParameter('hasApi', 'Filter by known API availability; unknown values do not match false'),
      {
        name: 'limit',
        in: 'query',
        required: false,
        description: 'Page size',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
      },
      {
        name: 'offset',
        in: 'query',
        required: false,
        description: 'Zero-based pagination offset',
        schema: { type: 'integer', minimum: 0, maximum: 1000000, default: 0 },
      },
      {
        name: 'view',
        in: 'query',
        required: false,
        description: 'Response representation',
        schema: { type: 'string', enum: ['summary', 'full'], default: 'summary' },
      },
    ],
    responses: {
      200: jsonResponse('Paginated resource results'),
      400: jsonResponse('Invalid request parameters'),
      429: jsonResponse('Rate limit exceeded by Cloudflare'),
      503: jsonResponse('Dataset temporarily unavailable'),
    },
  },
};
schema.paths['/api/resources/{id}'] = {
  get: {
    summary: 'Get one resource by stable ID or slug',
    operationId: 'getResource',
    security: [],
    parameters: [{
      name: 'id',
      in: 'path',
      required: true,
      description: 'UUID or URL-safe slug',
      schema: { type: 'string', minLength: 1, maxLength: 160, pattern: '^[A-Za-z0-9][A-Za-z0-9._~-]*$' },
    }],
    responses: {
      200: jsonResponse('Complete resource record'),
      400: jsonResponse('Invalid resource identifier'),
      404: jsonResponse('Resource not found'),
      429: jsonResponse('Rate limit exceeded by Cloudflare'),
      503: jsonResponse('Dataset temporarily unavailable'),
    },
  },
};
schema.paths['/api/facets'] = {
  get: {
    summary: 'Get available filter facets and counts',
    operationId: 'getFacets',
    security: [],
    responses: {
      200: jsonResponse('Facet values and counts'),
      429: jsonResponse('Rate limit exceeded by Cloudflare'),
      503: jsonResponse('Dataset temporarily unavailable'),
    },
  },
};
schema.paths['/api/health'] = {
  get: {
    summary: 'Check edge API and dataset health',
    operationId: 'getApiHealth',
    security: [],
    responses: {
      200: jsonResponse('Service healthy'),
      429: jsonResponse('Rate limit exceeded by Cloudflare'),
      503: jsonResponse('Service degraded'),
    },
  },
};
schema.paths['/.well-known/agent-card.json'] = {
  get: {
    summary: 'Get agent discovery metadata',
    operationId: 'getAgentCard',
    security: [],
    responses: { 200: jsonResponse('Agent card') },
  },
};

writeFileSync(path, JSON.stringify(schema, null, 2), 'utf8');
console.log('Extended openapi.json with validated agent endpoints');
