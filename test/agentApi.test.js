import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RequestValidationError,
  matches,
  parseLookupKey,
  parseSearchParams,
  serviceUnavailable,
  summarize,
} from '../src/lib/agentApi.js';

const parse = query => parseSearchParams(new URLSearchParams(query));

test('accepts supported query values and applies defaults', () => {
  const filters = parse('q=genome&activelyRecruiting=true&limit=10&view=full');
  assert.equal(filters.q, 'genome');
  assert.equal(filters.activelyRecruiting, true);
  assert.equal(filters.limit, 10);
  assert.equal(filters.offset, 0);
  assert.equal(filters.view, 'full');
});

test('rejects ambiguous, oversized, and malformed parameters', () => {
  assert.throws(() => parse('q=a&q=b'), RequestValidationError);
  assert.throws(() => parse(`q=${'a'.repeat(257)}`), RequestValidationError);
  assert.throws(() => parse('activelyRecruiting=yes'), RequestValidationError);
  assert.throws(() => parse('limit=1.5'), RequestValidationError);
  assert.throws(() => parse('limit=101'), RequestValidationError);
  assert.throws(() => parse('view=everything'), RequestValidationError);
});

test('boolean filtering preserves unknown values instead of coercing them to false', () => {
  const falseFilter = parse('activelyRecruiting=false');
  assert.equal(matches({ isActivelyRecruiting: false }, falseFilter), true);
  assert.equal(matches({ isActivelyRecruiting: null }, falseFilter), false);
  assert.equal(matches({}, falseFilter), false);
});

test('full-text search remains case-insensitive and covers nested metadata', () => {
  const resource = {
    title: 'Example',
    organizations: [{ name: 'Genome Research Institute' }],
  };
  assert.equal(matches(resource, parse('q=GENOME')), true);
  assert.equal(matches(resource, parse('q=unrelated')), false);
});

test('lookup keys allow UUIDs and slugs but reject encoded delimiters and controls', () => {
  assert.equal(parseLookupKey('C20E8F39-D20A-4006-A660-689D1F65B352'), 'c20e8f39-d20a-4006-a660-689d1f65b352');
  assert.equal(parseLookupKey('living-dna-research'), 'living-dna-research');
  assert.throws(() => parseLookupKey('%2Fetc'), RequestValidationError);
  assert.throws(() => parseLookupKey('bad/key'), RequestValidationError);
  assert.throws(() => parseLookupKey('a'.repeat(161)), RequestValidationError);
});

test('summary uses the stable ID permalink shape', () => {
  assert.equal(
    summarize({ id: 'abc', slug: 'example' }).permalink,
    'https://yourselftoscience.org/resource/abc',
  );
});

test('service failures never expose internal exception details', async () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    const response = serviceUnavailable(new Error('secret binding TOKEN=abc'), 'test failure');
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.json();
    assert.deepEqual(body, {
      error: 'dataset_unavailable',
      message: 'The catalogue is temporarily unavailable.',
    });
    assert.equal(JSON.stringify(body).includes('TOKEN'), false);
  } finally {
    console.error = originalConsoleError;
  }
});
