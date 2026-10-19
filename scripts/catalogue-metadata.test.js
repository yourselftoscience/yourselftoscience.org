import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCatalogueMetadata, catalogueId, registryUrl, softwareArchiveUrl } from '../src/data/catalogueMetadata.js';

test('live dataset, software archive and registry record have separate identities', () => {
  const d = buildCatalogueMetadata('2026-05-05');
  assert.equal(d['@id'], catalogueId);
  assert.equal(d.identifier, catalogueId);
  assert.equal(d.sameAs, undefined);
  assert.equal(d.subjectOf['@id'], registryUrl);
  assert.equal(d.citation['@id'], softwareArchiveUrl);
  assert.equal(d.citation['@type'], 'SoftwareSourceCode');
  assert.equal(d.dateModified, '2026-05-05');
  assert.equal(buildCatalogueMetadata(null).dateModified, undefined);
  assert.equal(d.distribution.length, 3);
});

test('dataset schema has one server owner; directory pages do not impersonate papers', () => {
  const source = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
  assert.ok(source('src/app/data/layout.js').includes('buildCatalogueMetadata('));
  assert.ok(!source('src/app/data/page.js').includes('"@type": "Dataset"'));
  for (const p of ['src/app/layout.tsx', 'src/app/resources/page.js', 'src/app/resource/[slug]/page.js']) {
    assert.ok(!source(p).includes('citation_'), p);
  }
});

test('exported data-package and VoID describe the dataset rather than another DOI', () => {
  const p = JSON.parse(readFileSync(new URL('../public/datapackage.json', import.meta.url)));
  assert.equal(p.id, catalogueId);
  assert.equal(p.identifiers, undefined);
  assert.ok(p.sources.some(s => s.path === registryUrl));
  const ttl = readFileSync(new URL('../public/void.ttl', import.meta.url), 'utf8');
  assert.ok(ttl.includes(`dcterms:identifier <${catalogueId}>`));
  assert.ok(ttl.includes(`schema:subjectOf <${registryUrl}>`));
  assert.ok(!ttl.includes('schema:sameAs <https://doi.org/'));
  assert.ok(!ttl.includes('void:sparqlEndpoint'));
  const rdf = readFileSync(new URL('../public/resources.ttl', import.meta.url), 'utf8');
  assert.ok(rdf.includes(`<${catalogueId}> a schema:Dataset`));
  assert.ok(!rdf.includes('schema:identifier <https://doi.org/'));
});
