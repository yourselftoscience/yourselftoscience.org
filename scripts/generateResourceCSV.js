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
      'Organization',
      'Link',
      'Data Types',
      'Compensation Type',
      'Countries',
      'Country Codes',
      'Instructions',
      'Citations'
    ];

    const rows = resources.map(resource => {
      // Helper to format citations into a readable string
      const formatCitations = (citations) => {
        if (!citations || citations.length === 0) {
          return '';
        }
        return citations.map(c => `${c.title.replace(/"/g, '""')} (${c.link})`).join('; ');
      };
      
      return [
        resource.id || '',
        `"${(resource.title || '').replace(/"/g, '""')}"`,
        `"${(resource.organization || '').replace(/"/g, '""')}"`,
        resource.link || '',
        `"${resource.dataTypes ? resource.dataTypes.join(', ') : ''}"`,
        resource.compensationType || '',
        `"${resource.countries ? resource.countries.join(', ') : ''}"`,
        `"${resource.countryCodes ? resource.countryCodes.join(', ') : ''}"`,
        `"${resource.instructions ? resource.instructions.join('; ') : ''}"`,
        `"${formatCitations(resource.citations)}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(csvPath, csvContent);

    console.log(`Successfully generated resources.csv at ${csvPath}`);
  } catch (error) {
    console.error('Error generating CSV:', error);
  }
}

// This function will only be defined and used in a Node.js environment.
async function checkIsMain(metaUrl) {
    if (typeof process === 'undefined' || !metaUrl.startsWith('file://')) {
        return false;
    }
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const modulePath = fileURLToPath(metaUrl);
    return process.argv[1] === modulePath;
}

// Check if this script is being run directly.
checkIsMain(import.meta.url).then(isMain => {
    if (isMain) {
        generateCSV();
    }
});

export { generateCSV }; 