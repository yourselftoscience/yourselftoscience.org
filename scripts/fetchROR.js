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
 * Uses the affiliation endpoint for better relevance scoring, then
 * validates the result with multiple criteria to avoid false matches.
 * 
 * @param {string} name - Organization name to search
 * @param {string|null} expectedWikidataId - If we already know the Wikidata ID,
 *   use it to cross-validate the ROR result.
 */
async function searchRORByName(name, expectedWikidataId = null) {
  if (!name) return null;

  // Use the affiliation endpoint — it's designed for name matching
  // and returns a relevance score
  const url = `${ROR_API_BASE}?query=${encodeURIComponent(name)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();

    if (!data.items || data.items.length === 0) return null;

    const normalizedSearch = name.toLowerCase().trim();

    // Strategy: score each result and pick the best validated match
    let bestMatch = null;
    let bestScore = 0;

    for (const item of data.items.slice(0, 5)) { // Check top 5 results
      const rorNames = (item.names || [])
        .map(n => n.value?.toLowerCase())
        .filter(Boolean);

      // Score this match
      let score = 0;

      // Exact match = highest confidence
      if (rorNames.some(n => n === normalizedSearch)) {
        score += 100;
      }
      // ROR name contains search term (but needs length check to avoid
      // "Cochrane" matching "Cochrane Nordic" ranked higher)
      else if (rorNames.some(n => n === normalizedSearch || 
               (n.includes(normalizedSearch) && normalizedSearch.length >= 5))) {
        score += 50;
      }
      // Search term contains ROR name (e.g., "National Institutes of Health (NIH)" 
      // contains "national institutes of health")
      else if (rorNames.some(n => 
               n.length >= 10 && normalizedSearch.includes(n))) {
        score += 40;
      }
      else {
        continue; // No name overlap at all, skip
      }

      // Cross-validate with Wikidata ID if we have one
      const rorWikidataIds = (item.external_ids || [])
        .filter(e => e.type === 'wikidata')
        .flatMap(e => e.all || []);
      
      if (expectedWikidataId && rorWikidataIds.length > 0) {
        if (rorWikidataIds.includes(expectedWikidataId)) {
          score += 200; // Wikidata match = very high confidence
        } else {
          score -= 50; // Wikidata mismatch = red flag
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && bestScore > 0) {
      return extractRORData(bestMatch);
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

    // Fallback: search by name, passing wikidataId for cross-validation
    console.log(`Searching ROR for: ${orgName}`);
    const data = await searchRORByName(orgName, orgInfo.wikidataId);
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
