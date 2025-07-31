import { writeFile, readFile } from 'fs/promises';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const resources = require('../src/data/resources.js').resources;

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

// Caches to avoid redundant API calls
const dataTypeCache = {};
const countryCache = {};
const entityCategoryCache = {};
const entitySubTypeCache = {};

// Helper function to fetch data from Wikidata
async function fetchWikidata(params) {
  const url = new URL(WIKIDATA_API);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from Wikidata for params ${JSON.stringify(params)}:`, error);
    return null;
  }
}

// Helper function to fetch page ID from Wikipedia
async function getWikipediaPageId(title) {
    const url = `${WIKIPEDIA_API}?action=query&prop=info&titles=${encodeURIComponent(title)}&format=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        return pageId !== "-1" ? pageId : null;
    } catch (error) {
        console.error(`Error fetching Wikipedia page ID for "${title}":`, error);
        return null;
    }
}

// Function to get Wikidata ID from a Wikipedia page title
async function getWikidataIdFromWikipedia(title) {
    const pageId = await getWikipediaPageId(title);
    if (!pageId) return null;

    const params = {
        action: 'wbgetentities',
        props: 'info',
        sites: 'enwiki',
        titles: title,
        format: 'json',
    };
    const data = await fetchWikidata(params);
    if (data && data.entities) {
        const entityId = Object.keys(data.entities)[0];
        return entityId !== "-1" ? entityId : null;
    }
    return null;
}

// Function to search for a Wikidata ID
async function searchWikidata(searchTerm) {
    if (!searchTerm) return null;
    const params = {
        action: 'wbsearchentities',
        search: searchTerm,
        language: 'en',
        format: 'json',
        limit: 1,
    };
    const data = await fetchWikidata(params);
    if (data && data.search && data.search.length > 0) {
        return data.search[0].id;
    }
    return null;
}

// Main function to enrich resources
async function enrichResources() {
  // Manual mappings for ambiguous terms
  const manualMappings = {
    'Commercial': 'Q4830453', // Maps to "business"
    'All of US': 'Q25004683',  // Maps to the research program, not the sitcom
  };

  const enrichedResources = [];

  for (const resource of resources) {
    const enrichedResource = { ...resource, dataTypeMappings: {}, countryMappings: {} };

    // Use manual mapping if available, otherwise search
    if (manualMappings[resource.title]) {
        enrichedResource.resourceWikidataId = manualMappings[resource.title];
    } else if (resource.title) {
        enrichedResource.resourceWikidataId = await searchWikidata(resource.title);
    }
    
    // Enrich organization (creator)
    if (manualMappings[resource.organization]) {
      enrichedResource.wikidataId = manualMappings[resource.organization];
    } else if (resource.organization) {
      enrichedResource.wikidataId = await searchWikidata(resource.organization);
    }

    // Enrich data types
    for (const type of resource.dataTypes || []) {
      if (!dataTypeCache[type]) {
        dataTypeCache[type] = await searchWikidata(type);
      }
      if (dataTypeCache[type]) {
        enrichedResource.dataTypeMappings[type] = dataTypeCache[type];
      }
    }

    // Enrich countries
    for (const country of resource.countries || []) {
      if (!countryCache[country]) {
        countryCache[country] = await searchWikidata(country);
      }
      if (countryCache[country]) {
        enrichedResource.countryMappings[country] = countryCache[country];
      }
    }
      
    // Enrich Entity Category
    if (resource.entityCategory) {
        if (!entityCategoryCache[resource.entityCategory]) {
            entityCategoryCache[resource.entityCategory] = manualMappings[resource.entityCategory] || await searchWikidata(resource.entityCategory);
        }
        if (entityCategoryCache[resource.entityCategory]) {
            enrichedResource.entityCategoryWikidataId = entityCategoryCache[resource.entityCategory];
        }
    }
    
    // Enrich Entity SubType
    if (resource.entitySubType) {
        if (!entitySubTypeCache[resource.entitySubType]) {
            entitySubTypeCache[resource.entitySubType] = await searchWikidata(resource.entitySubType);
        }
        if (entitySubTypeCache[resource.entitySubType]) {
            enrichedResource.entitySubTypeWikidataId = entitySubTypeCache[resource.entitySubType];
        }
    }

    enrichedResources.push(enrichedResource);
  }

  try {
    const outputPath = './public/resources_wikidata.json';
    await writeFile(outputPath, JSON.stringify(enrichedResources, null, 2), 'utf8');
    console.log(`Successfully generated Wikidata-enriched file at ${outputPath}`);
  } catch (error) {
    console.error('Error writing Wikidata-enriched file:', error);
  }
}

enrichResources(); 