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
      // Also preserve legacy resourceWikidataId if needed (redundant check but safe)
      if (existingEntry.resourceWikidataId) enrichedResource.resourceWikidataId = existingEntry.resourceWikidataId;

      // Legacy ID preservation REMOVED to allow migration to UUIDs
      // if (existingEntry.id && existingEntry.id !== resource.id) {
      //   enrichedResource.id = existingEntry.id;
      // }

      // Preserve existing mappings where possible

      // Data Types
      for (const type of resource.dataTypes || []) {
        // STRICT check: if key exists in existing mapping (even if value is null/empty, though unlikely), take it.
        // Using Object.prototype.hasOwnProperty to be safe
        if (existingEntry.dataTypeMappings && Object.prototype.hasOwnProperty.call(existingEntry.dataTypeMappings, type)) {
          enrichedResource.dataTypeMappings[type] = existingEntry.dataTypeMappings[type];
        } else {
          // New tag? Initialize as null (Manual verification required)
          enrichedResource.dataTypeMappings[type] = null;
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

      // Initialize all Wikidata fields to null
      enrichedResource.wikidataId = null;
      enrichedResource.resourceWikidataId = null;
      enrichedResource.entityCategoryWikidataId = null;
      enrichedResource.entitySubTypeWikidataId = null;

      // Initialize mappings with keys but null values
      for (const type of resource.dataTypes || []) {
        enrichedResource.dataTypeMappings[type] = null;
      }
      for (const country of resource.countries || []) {
        enrichedResource.countryMappings[country] = null;
      }
    }

    enrichedResources.push(enrichedResource);
  }

  try {
    await writeFile(OUTPUT_PATH, JSON.stringify(enrichedResources, null, 2), 'utf8');
    console.log(`Successfully synced (Safe Mode) to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error writing Wikidata-enriched file:', error);
  }
}

enrichResources();