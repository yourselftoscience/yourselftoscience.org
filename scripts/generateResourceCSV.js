import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resources } from '../src/data/resources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateCSV() {
  console.log('Generating resources.csv...');

  try {
    const csvPath = path.join(__dirname, '../public/resources.csv');
    const headers = [
      'ID',
      'Title',
      'Link',
      'Description',
      'Data Types',
      'Countries',
      'Compensation Type',
      'Instructions'
    ];

    const rows = resources.map(resource => {
      return [
        resource.id,
        `"${resource.title.replace(/"/g, '""')}"`,
        resource.link || '',
        `"${resource.description ? resource.description.replace(/"/g, '""') : ''}"`,
        `"${resource.dataTypes ? resource.dataTypes.join(', ') : ''}"`,
        `"${resource.countries ? resource.countries.join(', ') : ''}"`,
        resource.compensationType || '',
        `"${resource.instructions ? resource.instructions.join('; ') : ''}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\\n');
    fs.writeFileSync(csvPath, csvContent);

    console.log(`Successfully generated resources.csv at ${csvPath}`);
  } catch (error) {
    console.error('Error generating CSV:', error);
  }
}

generateCSV();

export { generateCSV }; 