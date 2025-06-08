import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resources } from '../src/data/resources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateJSON() {
  console.log('Generating resources.json...');

  try {
    const jsonPath = path.join(__dirname, '../public/resources.json');
    const jsonContent = JSON.stringify(resources, null, 2);
    fs.writeFileSync(jsonPath, jsonContent);

    console.log(`Successfully generated resources.json at ${jsonPath}`);
  } catch (error) {
    console.error('Error generating JSON:', error);
  }
}

generateJSON();

export { generateJSON }; 