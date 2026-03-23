import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const jsonPath = join(process.cwd(), 'public/resources_wikidata.json');
const statsPath = join(process.cwd(), 'src/data/wikidataStats.json');
const outputPath = join(process.cwd(), 'public/resources.json');

try {
  const wikidataResources = JSON.parse(readFileSync(jsonPath, 'utf8'));
  
  let citedQIDs = new Set();
  try {
    const stats = JSON.parse(readFileSync(statsPath, 'utf8'));
    citedQIDs = new Set(stats.items ? stats.items.map(i => i.id) : []);
  } catch(e) {}
  
  const enrichedResources = wikidataResources.map(resource => ({
    ...resource,
    permalink: `https://yourselftoscience.org/resource/${resource.id}`,
    isCitedOnWikidata: resource.resourceWikidataId ? citedQIDs.has(resource.resourceWikidataId) : false,
    wikidataReferenceUrl: (resource.resourceWikidataId && citedQIDs.has(resource.resourceWikidataId)) ? `https://www.wikidata.org/wiki/${resource.resourceWikidataId}` : null
  }));

  const jsonContent = JSON.stringify(enrichedResources, null, 2);
  writeFileSync(outputPath, jsonContent, 'utf8');
  console.log(`Successfully generated JSON file at ${outputPath}`);
} catch (error) {
  console.error('Error generating JSON file:', error);
  process.exit(1);
}