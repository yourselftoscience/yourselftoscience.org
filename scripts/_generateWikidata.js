import { writeFile, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { existsSync } from 'fs';

const require = createRequire(import.meta.url);
const resources = require('../src/data/resources.js').resources;
const OUTPUT_PATH = './public/resources_wikidata.json';

// Helper function to fetch data from Wikidata removed. Validating manual-only workflow.

// Helper to fetch Wikidata ID by label
async function fetchWikidataId(label) {
  if (!label) return null;
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(label)}&language=en&format=json&origin=*`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.search && data.search.length > 0) {
      // Return the first match's ID
      return data.search[0].id;
    }
  } catch (error) {
    console.error(`Error fetching Wikidata ID for "${label}":`, error.message);
  }
  return null;
}


// Helper to fetch Wikidata ID by DOI
async function fetchWikidataIdByDOI(doi) {
  if (!doi) return null;
  // Use quoted search for exact phrase match on DOI
  const query = `"${doi}"`;
  const url = `https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.query && data.query.search && data.query.search.length > 0) {
      return data.query.search[0].title; // The title is the QID (e.g., Q12345)
    }
  } catch (error) {
    console.error(`Error fetching Wikidata ID for DOI "${doi}":`, error.message);
  }
  return null;
}

function extractDOI(url) {
  if (!url) return null;
  const match = url.match(/(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/i);
  return match ? match[1] : null;
}

// Main function to enrich resources
async function enrichResources() {
  console.log('Starting Safe Sync (Structure Only + Auto-Fetch Countries)...');

  // 1. Load existing Wikidata JSON to preserve manual edits
  let existingWikidataResources = [];
  try {
    if (existsSync(OUTPUT_PATH)) {
      const fileContent = await readFile(OUTPUT_PATH, 'utf8');
      existingWikidataResources = JSON.parse(fileContent);
      console.log(`Loaded ${existingWikidataResources.length} existing resources from ${OUTPUT_PATH}`);
    }
  } catch (error) {
    console.warn(`Could not load existing ${OUTPUT_PATH}, starting fresh.`, error.message);
  }

  // Create a map for quick lookup of existing data
  const existingMap = new Map();
  existingWikidataResources.forEach(r => {
    existingMap.set(r.id, r);
    if (r.slug) existingMap.set(r.slug, r);
  });

  const enrichedResources = [];

  // Track unique countries to fetch their IDs if missing
  const countryToQidMap = new Map();

  // First pass: Collect all existing country QIDs from resources_wikidata.json
  existingWikidataResources.forEach(r => {
    if (r.origin && r.originWikidataId) {
      countryToQidMap.set(r.origin, r.originWikidataId);
    }
    if (r.countryMappings) {
      Object.entries(r.countryMappings).forEach(([country, qid]) => {
        if (qid) countryToQidMap.set(country, qid);
      });
    }
  });

  // Second pass: Process resources
  for (const resource of resources) {
    let existingEntry = existingMap.get(resource.id) || existingMap.get(resource.slug);
    let enrichedResource = { ...resource };

    if (enrichedResource.wikidataLabel) {
      enrichedResource.title = enrichedResource.wikidataLabel;
    }

    enrichedResource.dataTypeMappings = {};
    enrichedResource.countryMappings = {};

    if (existingEntry) {
      // ... (preserve existing fields as before) ...
      if (existingEntry.wikidataId) enrichedResource.wikidataId = existingEntry.wikidataId;
      if (existingEntry.resourceWikidataId) enrichedResource.resourceWikidataId = existingEntry.resourceWikidataId;
      if (existingEntry.entityCategoryWikidataId) enrichedResource.entityCategoryWikidataId = existingEntry.entityCategoryWikidataId;
      if (existingEntry.entitySubTypeWikidataId) enrichedResource.entitySubTypeWikidataId = existingEntry.entitySubTypeWikidataId;

      // We will re-evaluate originWikidataId based on the global map if missing
      enrichedResource.originWikidataId = existingEntry.originWikidataId || null;

      if (existingEntry.organizationWikidataId) enrichedResource.organizationWikidataId = existingEntry.organizationWikidataId;

      if (existingEntry.wikidataLabel && !enrichedResource.wikidataLabel) enrichedResource.wikidataLabel = existingEntry.wikidataLabel;
      if (existingEntry.wikidataDescription) enrichedResource.wikidataDescription = existingEntry.wikidataDescription;
      if (existingEntry.aliases) enrichedResource.aliases = existingEntry.aliases;

      // Data Types
      for (const type of resource.dataTypes || []) {
        let normalizedType = type;


        if (existingEntry.dataTypeMappings && Object.prototype.hasOwnProperty.call(existingEntry.dataTypeMappings, normalizedType)) {
          enrichedResource.dataTypeMappings[normalizedType] = existingEntry.dataTypeMappings[normalizedType];
        } else {
          enrichedResource.dataTypeMappings[normalizedType] = null;
        }
      }

      // Countries
      for (const country of resource.countries || []) {
        // Check existing mapping first
        if (existingEntry.countryMappings && existingEntry.countryMappings[country]) {
          enrichedResource.countryMappings[country] = existingEntry.countryMappings[country];
          // Ensure global map has it
          if (!countryToQidMap.has(country)) countryToQidMap.set(country, existingEntry.countryMappings[country]);
        } else {
          // If not in this resource, but we know it globally, use that
          enrichedResource.countryMappings[country] = countryToQidMap.get(country) || null;
        }
      }

    } else {
      // New resource
      console.log(`Adding NEW resource structure: ${resource.title}`);

      enrichedResource.wikidataId = resource.wikidataId || null;
      enrichedResource.resourceWikidataId = resource.resourceWikidataId || null;
      enrichedResource.entityCategoryWikidataId = resource.entityCategoryWikidataId || null;
      enrichedResource.entitySubTypeWikidataId = resource.entitySubTypeWikidataId || null;
      enrichedResource.originWikidataId = resource.originWikidataId || null;
      enrichedResource.organizationWikidataId = resource.organizationWikidataId || null;

      for (const type of resource.dataTypes || []) {
        let normalizedType = type;

        enrichedResource.dataTypeMappings[normalizedType] = null;
      }
      for (const country of resource.countries || []) {
        enrichedResource.countryMappings[country] = countryToQidMap.get(country) || null;
      }
    }

    // Check Origin logic
    if (enrichedResource.origin) {
      if (!enrichedResource.originWikidataId && countryToQidMap.has(enrichedResource.origin)) {
        enrichedResource.originWikidataId = countryToQidMap.get(enrichedResource.origin);
      }
    }

    // Mapping Compensation Types to Wikidata QIDs
    if (enrichedResource.compensationType) {
      const type = enrichedResource.compensationType;
      if (type === 'payment') enrichedResource.compensationWikidataId = 'Q1742093'; // remuneration
      else if (type === 'donation') enrichedResource.compensationWikidataId = 'Q1124860'; // donation
      else if (type === 'mixed') enrichedResource.compensationWikidataId = ['Q1742093', 'Q1124860']; // both
      else enrichedResource.compensationWikidataId = null;
    } else {
      enrichedResource.compensationWikidataId = null;
    }

    // Check Citations for DOIs
    if (enrichedResource.citations && enrichedResource.citations.length > 0) {
      enrichedResource.citations = await Promise.all(enrichedResource.citations.map(async (citation) => {
        const enrichedCitation = { ...citation };
        const doi = extractDOI(citation.link);

        if (doi) {
          // Check if we already have it in existing data to avoid re-fetching
          let existingCitation = null;
          if (existingEntry && existingEntry.citations) {
            existingCitation = existingEntry.citations.find(c => c.link === citation.link);
          }

          if (existingCitation && existingCitation.wikidataId) {
            enrichedCitation.wikidataId = existingCitation.wikidataId;
          } else {
            console.log(`Fetching Wikidata ID for DOI: ${doi}...`);
            const qid = await fetchWikidataIdByDOI(doi);
            if (qid) {
              console.log(`  Found ${qid} for DOI ${doi}`);
              enrichedCitation.wikidataId = qid;
            }
          }
        }
        return enrichedCitation;
      }));
    }

    enrichedResources.push(enrichedResource);
  }

  // Third Pass: Fetch Missing Country QIDs
  // Identify all countries (origin or in mappings) that still have null QIDs
  const uniqueCountries = new Set();
  enrichedResources.forEach(r => {
    if (r.origin) uniqueCountries.add(r.origin);
    if (r.countryMappings) Object.keys(r.countryMappings).forEach(c => uniqueCountries.add(c));
  });

  for (const country of uniqueCountries) {
    if (!countryToQidMap.has(country)) {
      console.log(`Fetching Wikidata ID for country: ${country}...`);
      // Adding a small delay to be polite to the API? or simple sequential
      const qid = await fetchWikidataId(country);
      if (qid) {
        console.log(`  Found ${qid} for ${country}`);
        countryToQidMap.set(country, qid);
      } else {
        console.warn(`  No QID found for ${country}`);
      }
    }
  }

  // Fourth Pass: Apply fetched QIDs to resources
  enrichedResources.forEach(r => {
    if (r.origin && !r.originWikidataId) {
      r.originWikidataId = countryToQidMap.get(r.origin) || null;
    }
    if (r.countryMappings) {
      Object.keys(r.countryMappings).forEach(country => {
        if (!r.countryMappings[country]) {
          r.countryMappings[country] = countryToQidMap.get(country) || null;
        }
      });
    }
  });


  try {
    await writeFile(OUTPUT_PATH, JSON.stringify(enrichedResources, null, 2), 'utf8');
    console.log(`Successfully synced (Safe Mode + Auto-Fetch) to ${OUTPUT_PATH}`);

    await generateReport(enrichedResources);

  } catch (error) {
    console.error('Error writing Wikidata-enriched file:', error);
  }
}

// Helper to generate the Markdown report
async function generateReport(resources) {
  const REPORT_PATH = './wikidata_report.md';
  console.log('Generating Wikidata Report...');

  const generateLink = (id) => id ? `[${id}](https://www.wikidata.org/wiki/${id})` : '❌';

  // 1. Resources List (use wikidataLabel if available, otherwise title)
  const resourcesList = resources.map(r => {
    const id = r.wikidataId || r.resourceWikidataId;
    const label = r.wikidataLabel || r.title;
    return `- **${label}**: ${generateLink(id)}`;
  }).sort();

  // 2. Organizations (from organizations array)
  const organizationMap = new Map();
  resources.forEach(r => {
    if (r.organizations && Array.isArray(r.organizations)) {
      r.organizations.forEach(org => {
        if (org.name) {
          if (!organizationMap.has(org.name) || (org.wikidataId && !organizationMap.get(org.name))) {
            organizationMap.set(org.name, org.wikidataId || null);
          }
        }
      });
    }
  });
  const organizationsList = Array.from(organizationMap.entries()).sort().map(([key, value]) => {
    return `- **${key}**: ${generateLink(value)}`;
  });

  // 3. Aggregate Data Types
  const dataTypeMap = new Map();
  resources.forEach(r => {
    if (r.dataTypeMappings) {
      Object.entries(r.dataTypeMappings).forEach(([key, value]) => {
        if (!dataTypeMap.has(key) || (value && !dataTypeMap.get(key))) {
          dataTypeMap.set(key, value);
        }
      });
    }
  });
  const dataTypesList = Array.from(dataTypeMap.entries()).sort().map(([key, value]) => {
    return `- **${key}**: ${generateLink(value)}`;
  });

  // 4. Aggregate Countries (Mappings + Origin)
  const countryMap = new Map();
  resources.forEach(r => {
    // Check Origin
    if (r.origin) {
      if (!countryMap.has(r.origin) || (r.originWikidataId && !countryMap.get(r.origin))) {
        countryMap.set(r.origin, r.originWikidataId);
      }
    }
    // Check Mappings
    if (r.countryMappings) {
      Object.entries(r.countryMappings).forEach(([key, value]) => {
        if (!countryMap.has(key) || (value && !countryMap.get(key))) {
          countryMap.set(key, value);
        }
      });
    }
  });
  const countriesList = Array.from(countryMap.entries()).sort().map(([key, value]) => {
    return `- **${key}**: ${generateLink(value)}`;
  });

  // 5. Entity Categories (Entity Category & SubType)
  const categoryMap = new Map();
  resources.forEach(r => {
    if (r.entityCategory) {
      if (!categoryMap.has(r.entityCategory) || (r.entityCategoryWikidataId && !categoryMap.get(r.entityCategory))) {
        categoryMap.set(r.entityCategory, r.entityCategoryWikidataId);
      }
    }
    if (r.entitySubType) {
      if (!categoryMap.has(r.entitySubType) || (r.entitySubTypeWikidataId && !categoryMap.get(r.entitySubType))) {
        categoryMap.set(r.entitySubType, r.entitySubTypeWikidataId);
      }
    }
  });
  const categoriesList = Array.from(categoryMap.entries()).sort().map(([key, value]) => {
    return `- **${key}**: ${generateLink(value)}`;
  });

  // 6. Compensation Types
  const compensationMap = new Map();
  resources.forEach(r => {
    if (r.compensationType) {
      const type = r.compensationType;
      // Use the QID logic we just added or manual lookup
      let qid = r.compensationWikidataId;
      if (Array.isArray(qid)) qid = qid.map(q => generateLink(q)).join(', ');
      else if (qid) qid = generateLink(qid);
      else qid = 'No QID';

      if (!compensationMap.has(type)) {
        compensationMap.set(type, qid);
      }
    }
  });
  const compensationList = Array.from(compensationMap.entries()).sort().map(([key, value]) => {
    return `- **${key}**: ${value}`;
  });

  // 7. Citations
  const citationList = [];
  resources.forEach(r => {
    if (r.citations) {
      r.citations.forEach(c => {
        const doi = extractDOI(c.link);
        const status = c.wikidataId ? `[${c.wikidataId}](https://www.wikidata.org/wiki/${c.wikidataId})` : '❌';
        const linkText = doi ? `(DOI: ${doi})` : `([Link](${c.link}))`;
        const title = c.title && c.title.length > 120 ? c.title.substring(0, 117) + '...' : c.title;
        citationList.push(`- ${status} **${title}** ${linkText}`);
      });
    }
  });

  const reportContent = `# Wikidata Integration Report

**Generated on:** ${new Date().toLocaleString()}

## Project-Organizer Relationships


${[...resources].sort((a, b) => (a.wikidataLabel || a.title).localeCompare(b.wikidataLabel || b.title)).map(r => {
    const projectId = r.wikidataId || r.resourceWikidataId;
    const projectLink = projectId ? generateLink(projectId) : '❌';
    const projectTitle = r.wikidataLabel || r.title; // Use Wikidata label if available

    const orgs = (r.organizations || []).map(org => {
      const orgName = org.name;
      const orgId = org.wikidataId ? generateLink(org.wikidataId) : 'No Wikidata ID';
      return `  - ${orgName}: ${orgId}`;
    }).join('\n');
    return `- **${projectTitle}**: ${projectLink}\n${orgs}`;
  }).join('\n')}

## Resources (Projects)

${resourcesList.join('\n')}

## Participating Organizations

${organizationsList.join('\n')}

## Data Types

${dataTypesList.join('\n')}

## Countries

${countriesList.join('\n')}

## Entity Categories

${categoriesList.join('\n')}

## Compensation Types

${compensationList.join('\n')}

## Citations

${citationList.join('\n')}
`;

  try {
    await writeFile(REPORT_PATH, reportContent, 'utf8');
    console.log(`Successfully generated report at ${REPORT_PATH}`);
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

enrichResources();