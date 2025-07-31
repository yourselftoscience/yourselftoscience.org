import { writeFile } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const wikidataResources = require('../public/resources_wikidata.json');

const outputPath = './public/resources.json';

function generateJSON() {
  try {
    const jsonContent = JSON.stringify(wikidataResources, null, 2);
    writeFile(outputPath, jsonContent, 'utf8');
    console.log(`Successfully generated JSON file at ${outputPath}`);
  } catch (error) {
    console.error('Error generating JSON file:', error);
  }
}

generateJSON();