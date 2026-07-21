import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import nextConfig from '../next.config.mjs';
import { POST as sendAnalyticsEvent } from '../src/app/umami/api/send/route.js';

const readSource = path => readFile(new URL(path, import.meta.url), 'utf8');

test('disables the vulnerable self-hosted Next image optimizer', () => {
  assert.equal(nextConfig.images?.unoptimized, true);
});

test('does not configure external Next rewrites', () => {
  assert.equal(nextConfig.rewrites, undefined);
});

test('middleware redirects are explicitly non-cacheable', async () => {
  const source = await readSource('../src/middleware.js');
  assert.match(source, /Cache-Control', 'private, no-store'/u);
  assert.match(source, /Vary', 'x-nextjs-data'/u);
  assert.doesNotMatch(source, /NextResponse\.redirect\(/u, 'redirects must use the no-store helper');
});

test('analytics event proxy rejects unsupported content types', async () => {
  const response = await sendAnalyticsEvent(new Request('https://example.test/umami/api/send', {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: 'not json',
  }));
  assert.equal(response.status, 415);
});

test('analytics event proxy rejects oversized bodies before forwarding', async () => {
  const body = JSON.stringify({ payload: 'x'.repeat(70 * 1024) });
  const response = await sendAnalyticsEvent(new Request('https://example.test/umami/api/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(body)),
    },
    body,
  }));
  assert.equal(response.status, 413);
});

test('analytics proxies use fixed upstream destinations', async () => {
  const scriptSource = await readSource('../src/app/umami/script.js/route.js');
  const eventSource = await readSource('../src/app/umami/api/send/route.js');
  assert.match(scriptSource, /https:\/\/cloud\.umami\.is\/script\.js/u);
  assert.match(eventSource, /https:\/\/cloud\.umami\.is\/api\/send/u);
  assert.doesNotMatch(scriptSource, /new URL\(request\.url/u);
  assert.doesNotMatch(eventSource, /new URL\(request\.url/u);
});
