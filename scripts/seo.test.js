import test from 'node:test';
import assert from 'node:assert/strict';
import resources from '../public/resources_wikidata.json' with { type: 'json' };
import { resourceSeoTitle } from '../src/utils/resourceSeoTitle.js';
import { rorUrl } from '../src/utils/rorUrl.js';

test('resource search titles remain meaningful, distinct and within the rendered title budget', () => {
  const titles = resources.map(resourceSeoTitle);
  assert.equal(new Set(titles).size, titles.length);
  for (const title of titles) {
    assert.ok(title.length > 0);
    assert.ok(`${title} | Yourself to Science`.length <= 70, title);
  }
});

test('ROR links reject matching-control markers and resolve short identifiers on the ROR host', () => {
  assert.equal(rorUrl('IGNORE'), null);
  assert.equal(rorUrl(undefined), null);
  assert.equal(rorUrl('javascript:alert(1)'), null);
  assert.equal(rorUrl('https://example.org/03vek6s52'), null);
  assert.equal(rorUrl('03vek6s52'), 'https://ror.org/03vek6s52');
  assert.equal(rorUrl('https://ror.org/03vek6s52'), 'https://ror.org/03vek6s52');
});

const base = process.env.Y2S_TEST_URL;
test('catalogue identity is available without JavaScript and legacy links resolve correctly', { skip: !base }, async () => {
  for (const path of ['/', '/?resource=23andme', '/clinical-trials', '/organ-body-tissue-donation', '/what-can-i-do-with-my-genetic-data', '/get-involved']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    if (path.startsWith('/?') || path === '/') assert.match(html, /Contribute to Research<\/h1>/);
  }
  const legacy = await fetch(base + '/genetic-data', { redirect: 'manual' });
  assert.equal(legacy.status, 308);
  assert.equal(new URL(legacy.headers.get('location'), base).pathname, '/what-can-i-do-with-my-genetic-data');
  const explorer = await (await fetch(base + '/explore')).text();
  for (const [img] of explorer.matchAll(/<img\b[^>]*>/g)) assert.match(img, /\balt=/);
  assert.ok(!explorer.includes('href="IGNORE"'));
  assert.ok(!explorer.includes('href="03vek6s52"'));
});
