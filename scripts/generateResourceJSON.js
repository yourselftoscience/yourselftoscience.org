import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const jsonPath = join(process.cwd(), 'public/resources_wikidata.json');
const outputPath = join(process.cwd(), 'public/resources.json');

try {
  const wikidataResources = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const jsonContent = JSON.stringify(wikidataResources, null, 2);
  writeFileSync(outputPath, jsonContent, 'utf8');
  console.log(`Successfully generated JSON file at ${outputPath}`);
} catch (error) {
  console.error('Error generating JSON file:', error);
  process.exit(1);
}