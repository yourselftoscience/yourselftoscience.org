import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const endpoint = process.env.MCP_TEST_URL;
const decode = result => JSON.parse(result.content.find(c => c.type === 'text').text);

test('legacy MCP catalogue tools and session lifecycle remain compatible', { skip: !endpoint, timeout: 60000 }, async () => {
  const expected = await (await fetch('https://yourselftoscience.org/resources.json')).json();
  const client = new Client({ name: 'catalogue-regression', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  await client.connect(transport);
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(t => t.name).sort(), [
      'search_resources', 'get_resource', 'list_data_types', 'list_countries',
      'list_categories', 'list_macro_categories', 'list_compensation_types',
      'list_organizations', 'get_stats', 'search', 'fetch'
    ].sort());
    assert.ok(tools.every(t => t.annotations?.readOnlyHint === true));
    const call = async (name, args = {}) => decode(await client.callTool({ name, arguments: args }));
    assert.equal((await call('get_stats')).totalResources, expected.length);
    const first = expected.find(r => r.id && r.slug);
    assert.equal((await call('get_resource', { idOrSlug: first.id })).id, first.id);
    assert.equal((await call('get_resource', { idOrSlug: first.slug })).id, first.id);
    assert.equal((await call('get_resource', { idOrSlug: 'not-a-resource' })).error, 'not_found');
    const page = await call('search_resources', { limit: 1, offset: 1 });
    assert.equal(page.count, 1);
    assert.equal(page.offset, 1);
    assert.equal(page.totalCount, expected.length);
    assert.equal(page.results[0].id, expected[1].id);
    const defaults = await call('search_resources');
    assert.equal(defaults.count, Math.min(20, expected.length));
    for (const name of ['list_data_types', 'list_countries', 'list_categories', 'list_macro_categories', 'list_compensation_types', 'list_organizations']) {
      const result = await call(name);
      assert.ok(Array.isArray(result.results), name);
      assert.ok(result.results.every(r => typeof r.name === 'string' && r.count > 0), name);
    }
    const search = await call('search', { query: first.title });
    assert.ok(search.results.some(r => r.id === first.id));
    const document = await call('fetch', { id: first.id });
    assert.equal(document.id, first.id);
    assert.equal(document.title, first.title);
    assert.ok(document.text.includes(first.title));
    assert.equal(document.url, first.permalink ?? first.link);
    const invalid = await client.callTool({ name: 'search_resources', arguments: { limit: -1 } });
    assert.equal(invalid.isError, true);
    assert.ok(transport.sessionId);
    const oldSession = transport.sessionId;
    await transport.terminateSession();
    const terminated = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-session-id': oldSession, 'mcp-protocol-version': '2025-03-26' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 100, method: 'tools/list', params: {} })
    });
    assert.equal(terminated.status, 404);
  } finally {
    await client.close();
  }
});
