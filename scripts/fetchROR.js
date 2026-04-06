import { writeFile, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { existsSync } from 'fs';

const require = createRequire(import.meta.url);
const resources = require('../src/data/resources.js').rawResources;
const OUTPUT_PATH = './src/data/rorData.json';

// ROR API v2: https://ror.readme.io/v2/docs/rest-api
const ROR_API_BASE = 'https://api.ror.org/v2/organizations';

/**
 * Fetch organization details from ROR by its ROR ID.
 * ROR IDs look like: https://ror.org/00f54p054
 */
async function fetchRORById(rorId) {
  if (!rorId) return null;

  // Normalize: accept both URL and short form
  const id = rorId.startsWith('https://ror.org/')
    ? rorId
    : `https://ror.org/${rorId}`;

  const encodedId = encodeURIComponent(id);
  const url = `${ROR_API_BASE}/${encodedId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ROR API returned ${response.status} for ${id}`);
      return null;
    }
    const data = await response.json();
    return extractRORData(data);
  } catch (error) {
    console.error(`  Error fetching ROR data for ${id}:`, error.message);
    return null;
  }
}

/**
 * Search ROR by organization name (fallback when no ID is available).
 * Only returns a match if the name matches closely.
 */
async function searchRORByName(name) {
  if (!name) return null;

  const url = `${ROR_API_BASE}?query=${encodeURIComponent(name)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Only accept as a match if the score is high (first result with matching name)
      const firstResult = data.items[0];
      const rorNames = [
        ...(firstResult.names || []).map(n => n.value?.toLowerCase()),
      ].filter(Boolean);

      const normalizedSearch = name.toLowerCase().trim();
      const isCloseMatch = rorNames.some(n =>
        n === normalizedSearch ||
        n.includes(normalizedSearch) ||
        normalizedSearch.includes(n)
      );

      if (isCloseMatch) {
        return extractRORData(firstResult);
      }
    }
  } catch (error) {
    console.error(`  Error searching ROR for "${name}":`, error.message);
  }
  return null;
}

/**
 * Extract the fields we care about from a ROR API response.
 */
function extractRORData(rorEntry) {
  if (!rorEntry) return null;

  // Extract country from locations
  const location = (rorEntry.locations || [])[0];
  const country = location?.geonames_details?.country_name || null;
  const city = location?.geonames_details?.name || null;
  const countryCode = location?.geonames_details?.country_code || null;

  // Extract types
  const types = (rorEntry.types || []);

  // Extract established year
  const established = rorEntry.established || null;

  // Extract external IDs
  const externalIds = {};
  (rorEntry.external_ids || []).forEach(ext => {
    if (ext.type === 'wikidata') {
      externalIds.wikidataId = ext.all?.[0] || null;
    } else if (ext.type === 'isni') {
      externalIds.isni = ext.all?.[0] || null;
    } else if (ext.type === 'fundref') {
      externalIds.fundref = ext.all?.[0] || null;
    }
  });

  // Extract links
  const links = (rorEntry.links || []).map(l => l.value).filter(Boolean);
  const wikipediaLink = links.find(l => l.includes('wikipedia.org')) || null;

  return {
    rorId: rorEntry.id,
    name: (rorEntry.names || []).find(n => n.types?.includes('ris_abbr'))?.value
      || (rorEntry.names || []).find(n => n.types?.includes('label'))?.value
      || null,
    types,
    country,
    city,
    countryCode,
    established,
    wikipediaUrl: wikipediaLink,
    ...externalIds,
  };
}

/**
 * Main function: enrich organizations from resources with ROR data.
 * 
 * Strategy (Option B - Manual IDs):
 * 1. Check if the organization in resources.js has a `rorId` field
 * 2. If yes, fetch from ROR API by ID
 * 3. If no rorId, try a name-based search as a fallback/suggestion
 * 4. Cache all results in rorData.json
 */
async function enrichWithROR() {
  console.log('Starting ROR (Research Organization Registry) enrichment...');
  console.log(`ROR (Wikidata: Q63565260) — https://ror.org\n`);

  // Load existing cached data
  let existingData = {};
  try {
    if (existsSync(OUTPUT_PATH)) {
      const content = await readFile(OUTPUT_PATH, 'utf8');
      existingData = JSON.parse(content);
      console.log(`Loaded ${Object.keys(existingData).length} cached org entries from ${OUTPUT_PATH}`);
    }
  } catch (error) {
    console.warn(`Could not load existing ${OUTPUT_PATH}:`, error.message);
  }

  // Collect all unique organizations
  const orgMap = new Map();
  resources.forEach(r => {
    if (r.organizations && Array.isArray(r.organizations)) {
      r.organizations.forEach(org => {
        if (org.name && !orgMap.has(org.name)) {
          orgMap.set(org.name, {
            name: org.name,
            wikidataId: org.wikidataId || null,
            rorId: org.rorId || null,
          });
        }
      });
    }
  });

  console.log(`Found ${orgMap.size} unique organizations across all resources.\n`);

  const enrichedData = {};
  let fetched = 0;
  let cached = 0;
  let notFound = 0;

  for (const [orgName, orgInfo] of orgMap) {
    // Check existing cache first
    if (existingData[orgName] && existingData[orgName].rorId) {
      enrichedData[orgName] = existingData[orgName];
      cached++;
      continue;
    }

    // If org has a manual ROR ID, fetch by ID
    if (orgInfo.rorId) {
      console.log(`Fetching ROR by ID for: ${orgName} (${orgInfo.rorId})`);
      const data = await fetchRORById(orgInfo.rorId);
      if (data) {
        enrichedData[orgName] = data;
        fetched++;
      } else {
        enrichedData[orgName] = { rorId: null, searched: true, query: orgName };
        notFound++;
      }
      // Rate limiting: 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      continue;
    }

    // Fallback: search by name
    console.log(`Searching ROR for: ${orgName}`);
    const data = await searchRORByName(orgName);
    if (data) {
      console.log(`  ✓ Found: ${data.rorId} (${data.name})`);
      enrichedData[orgName] = { ...data, autoMatched: true };
      fetched++;
    } else {
      console.log(`  ✗ No match found`);
      enrichedData[orgName] = { rorId: null, searched: true, query: orgName };
      notFound++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Write results
  await writeFile(OUTPUT_PATH, JSON.stringify(enrichedData, null, 2), 'utf8');

  console.log(`\n--- ROR Enrichment Summary ---`);
  console.log(`Total organizations: ${orgMap.size}`);
  console.log(`Cached (unchanged):  ${cached}`);
  console.log(`Fetched / matched:   ${fetched}`);
  console.log(`Not found:           ${notFound}`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

enrichWithROR();
