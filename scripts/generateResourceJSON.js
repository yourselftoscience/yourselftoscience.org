import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const jsonPath = join(process.cwd(), 'public/resources_wikidata.json');
const outputPath = join(process.cwd(), 'public/resources.json');

try {
  const wikidataResources = JSON.parse(readFileSync(jsonPath, 'utf8'));
  
  // Inject canonical permalink for linked data interoperability
  const enrichedResources = wikidataResources.map(resource => ({
    ...resource,
    permalink: `https://yourselftoscience.org/resource/${resource.id}`
  }));

  const jsonContent = JSON.stringify(enrichedResources, null, 2);
  writeFileSync(outputPath, jsonContent, 'utf8');
  console.log(`Successfully generated JSON file at ${outputPath}`);
} catch (error) {
  console.error('Error generating JSON file:', error);
  process.exit(1);
}