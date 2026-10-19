import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import http from 'node:http';

// Run against the production Worker bundle: Y2S_TEST_URL=http://localhost:8787 npm test
// No valid contact/subscription requests are sent by these tests.
const base = process.env.Y2S_TEST_URL;
const resources = JSON.parse(readFileSync(new URL('../public/resources_wikidata.json', import.meta.url)));
const resource = resources.find(r => r.id && r.slug);
const request = (path, init = {}) => fetch(new URL(path, base), { redirect: 'manual', ...init });
const integration = (name, fn) => test(name, { skip: !base }, fn);

integration('Worker serves catalogue HTML, downloads, and security headers', async () => {
  const page = await request('/data');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  assert.match(page.headers.get('content-security-policy'), /object-src 'none'/);
  assert.match(await page.text(), /Yourself to Science/);
  const data = await request('/resources.json');
  assert.equal(data.status, 200);
  assert.equal(data.headers.get('access-control-allow-origin'), '*');
  assert.equal((await data.json()).length, resources.length);
  const detail = await request(`/resource/${resource.slug}`);
  assert.equal(detail.status, 200);
  assert.match(await detail.text(), /resources\.ttl#dataset/);
  assert.equal((await request('/resource/does-not-exist')).status, 404);
  assert.equal((await request('/data-types/blood')).status, 200);
  const rsc = await request(`/resource/${resource.slug}`, { headers: { rsc: '1' } });
  assert.equal(rsc.status, 200);
  assert.match(rsc.headers.get('content-type'), /text\/x-component/);
});

integration('UUID redirect survives spoofed middleware and RSC headers without polluting HTML', async () => {
  const path = `/resource/${resource.id}`;
  for (const headers of [{}, { 'x-middleware-subrequest': 'src/middleware:src/middleware:src/middleware:src/middleware:src/middleware' }, { rsc: '1', 'next-router-prefetch': '1', 'x-nextjs-data': '1' }]) {
    const response = await request(path, { headers });
    assert.equal(response.status, 308);
    assert.equal(new URL(response.headers.get('location'), base).pathname, `/resource/${resource.slug}`);
  }
  const ordinary = await request(`/resource/${resource.slug}`);
  assert.equal(ordinary.status, 200);
  assert.match(ordinary.headers.get('content-type'), /text\/html/);
});

integration('dynamic badges and API validation keep their response contracts', async () => {
  const badge = await request(`/api/badge/${resource.slug}`);
  assert.equal(badge.status, 200);
  assert.match(badge.headers.get('content-type'), /image\/svg\+xml/);
  assert.match(await badge.text(), /Yourself to Science/);
  assert.equal((await request('/api/badge/does-not-exist')).status, 404);
  assert.equal((await request('/api/fetchMeta?doi=invalid')).status, 400);
  assert.equal((await request('/api/fetchMeta?doi=10.1234%2F..%2Fx')).status, 400);
  assert.equal((await request(`/api/resource/${resource.id}`)).status, 404);
  assert.equal((await request('/api/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'invalid' }) })).status, 400);
  const body = new FormData();
  body.set('honeypot', 'bot');
  const contact = await request('/api/contact', { method: 'POST', body });
  assert.equal(contact.status, 200);
});

integration('agent discovery endpoints serve health, A2A and Markdown negotiation', async () => {
  const health = await request('/api/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');

  const card = await request('/.well-known/agent-card.json');
  assert.equal(card.status, 200);
  assert.equal((await card.json()).supportedInterfaces[0].url, 'https://yourselftoscience.org/api/a2a');

  const a2a = await request('/api/a2a', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'smoke-1',
      method: 'SendMessage',
      params: { message: { parts: [{ text: 'diabetes' }] } },
    }),
  });
  assert.equal(a2a.status, 200);
  const a2aBody = await a2a.json();
  assert.equal(a2aBody.id, 'smoke-1');
  assert.equal(a2aBody.result.message.role, 'ROLE_AGENT');
  assert.match(a2aBody.result.message.parts[0].text, /Found .* catalogue resource/i);

  const markdown = await request('/', { headers: { accept: 'text/markdown' } });
  assert.equal(markdown.status, 200);
  assert.match(markdown.headers.get('content-type'), /text\/markdown/);
  assert.equal(markdown.headers.get('content-location'), '/index.html.md');
  assert.match(await markdown.text(), /^# Yourself to Science/m);
});

// fetch may replace Host; raw HTTP exercises the actual middleware host branch.
integration('identifier host redirects application pages and public exports', async (t) => {
  if (new URL(base).protocol !== 'http:') {
    t.skip('Host override is tested against the local Worker, not shared Cloudflare TLS ingress');
    return;
  }
  for (const path of ['/data', '/resources.json', '/robots.txt']) {
    const response = await new Promise((resolve, reject) => {
      const req = http.get(new URL(path, base), { headers: { host: 'id.yourselftoscience.org' } }, res => {
        res.resume();
        resolve({ status: res.statusCode, location: res.headers.location });
      });
      req.on('error', reject);
    });
    assert.equal(response.status, 308, path);
    assert.equal(response.location, 'https://yourselftoscience.org/', path);
  }
});
