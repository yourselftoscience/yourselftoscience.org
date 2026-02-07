import { writeFile, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { existsSync } from 'fs';

const require = createRequire(import.meta.url);
const resources = require('../src/data/resources.js').resources;
const OUTPUT_PATH = './public/resources_wikidata.json';

// Helper function to fetch data from Wikidata removed. Validating manual-only workflow.

// Main function to enrich resources
async function enrichResources() {
  console.log('Starting Safe Sync (Structure Only)...');

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
  // Legacy entries might use slug as ID, newer ones use UUID.
  const existingMap = new Map();
  existingWikidataResources.forEach(r => {
    existingMap.set(r.id, r); // Map by ID (could be UUID or slug)
    // If we have a slug, map by slug too (unlikely for legacy but good for safety)
    if (r.slug) existingMap.set(r.slug, r);
  });

  const enrichedResources = [];

  for (const resource of resources) {
    // 2. Check if resource exists in confirmed JSON
    // Try matching by canonical ID (UUID) first, then by Slug (legacy ID pattern)
    let existingEntry = existingMap.get(resource.id) || existingMap.get(resource.slug);

    let enrichedResource = { ...resource };

    // Use wikidataLabel as title if available to comply with Wikidata naming guidelines
    if (enrichedResource.wikidataLabel) {
      enrichedResource.title = enrichedResource.wikidataLabel;
    }

    // Initialize mappings containers
    enrichedResource.dataTypeMappings = {};
    enrichedResource.countryMappings = {};

    if (existingEntry) {
      // --- MERGE STRATEGY: PRESERVE WIKIDATA IDs FROM EXISTING ENTRY ---
      // console.log(`Syncing existing resource: ${resource.title} (matched via ${existingEntry.id === resource.id ? 'UUID' : 'Slug'})`);

      // Preserve manually verified Wikidata IDs
      if (existingEntry.wikidataId) enrichedResource.wikidataId = existingEntry.wikidataId;
      if (existingEntry.resourceWikidataId) enrichedResource.resourceWikidataId = existingEntry.resourceWikidataId;
      if (existingEntry.entityCategoryWikidataId) enrichedResource.entityCategoryWikidataId = existingEntry.entityCategoryWikidataId;
      if (existingEntry.entitySubTypeWikidataId) enrichedResource.entitySubTypeWikidataId = existingEntry.entitySubTypeWikidataId;
      if (existingEntry.originWikidataId) enrichedResource.originWikidataId = existingEntry.originWikidataId;
      if (existingEntry.organizationWikidataId) enrichedResource.organizationWikidataId = existingEntry.organizationWikidataId; // Preserve manual organization ID

      // Preserve Wikidata metadata (Labels, Descriptions, Aliases)
      if (existingEntry.wikidataLabel && !enrichedResource.wikidataLabel) enrichedResource.wikidataLabel = existingEntry.wikidataLabel;
      if (existingEntry.wikidataDescription) enrichedResource.wikidataDescription = existingEntry.wikidataDescription;
      if (existingEntry.aliases) enrichedResource.aliases = existingEntry.aliases;


      // Also preserve legacy resourceWikidataId if needed (redundant check but safe)
      if (existingEntry.resourceWikidataId) enrichedResource.resourceWikidataId = existingEntry.resourceWikidataId;

      // Legacy ID preservation REMOVED to allow migration to UUIDs
      // if (existingEntry.id && existingEntry.id !== resource.id) {
      //   enrichedResource.id = existingEntry.id;
      // }

      // Preserve existing mappings where possible

      // Data Types
      for (const type of resource.dataTypes || []) {
        let normalizedType = type;
        if (type === 'Wearable data (Fitbit only)') {
          normalizedType = 'Wearable data';
        }

        // STRICT check: if key exists in existing mapping (even if value is null/empty, though unlikely), take it.
        // Using Object.prototype.hasOwnProperty to be safe
        if (existingEntry.dataTypeMappings && Object.prototype.hasOwnProperty.call(existingEntry.dataTypeMappings, normalizedType)) {
          enrichedResource.dataTypeMappings[normalizedType] = existingEntry.dataTypeMappings[normalizedType];
        } else {
          // New tag? Initialize as null (Manual verification required)
          enrichedResource.dataTypeMappings[normalizedType] = null;
        }
      }

      // Countries
      for (const country of resource.countries || []) {
        if (existingEntry.countryMappings && Object.prototype.hasOwnProperty.call(existingEntry.countryMappings, country)) {
          enrichedResource.countryMappings[country] = existingEntry.countryMappings[country];
        } else {
          // New country? Initialize as null
          enrichedResource.countryMappings[country] = null;
        }
      }

    } else {
      // --- NEW RESOURCE: INITIALIZE EMPTY FIELDS ---
      console.log(`Adding NEW resource structure: ${resource.title}`);

      // Initialize all Wikidata fields to null (unless already in source)
      enrichedResource.wikidataId = resource.wikidataId || null;
      enrichedResource.resourceWikidataId = resource.resourceWikidataId || null;
      enrichedResource.entityCategoryWikidataId = resource.entityCategoryWikidataId || null;
      enrichedResource.entitySubTypeWikidataId = resource.entitySubTypeWikidataId || null;
      enrichedResource.originWikidataId = resource.originWikidataId || null;
      enrichedResource.organizationWikidataId = resource.organizationWikidataId || null;

      // Initialize mappings with keys but null values
      for (const type of resource.dataTypes || []) {
        let normalizedType = type;
        if (type === 'Wearable data (Fitbit only)') {
          normalizedType = 'Wearable data';
        }
        enrichedResource.dataTypeMappings[normalizedType] = null;
      }
      for (const country of resource.countries || []) {
        enrichedResource.countryMappings[country] = null;
      }
    }

    // Force title override from wikidataLabel AND remove wikidataLabel from output
    if (enrichedResource.wikidataLabel) {
      // Decoupled: Title remains for display, wikidataLabel for Wikidata
      // We do NOT delete it here so it remains available for the report generator
      // delete enrichedResource.wikidataLabel; 
    }

    enrichedResources.push(enrichedResource);
  }

  try {
    await writeFile(OUTPUT_PATH, JSON.stringify(enrichedResources, null, 2), 'utf8');
    console.log(`Successfully synced (Safe Mode) to ${OUTPUT_PATH}`);

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
`;

  try {
    await writeFile(REPORT_PATH, reportContent, 'utf8');
    console.log(`Successfully generated report at ${REPORT_PATH}`);
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

enrichResources();