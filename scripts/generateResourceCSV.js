import { writeFile } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const wikidataResources = require('../public/resources_wikidata.json');

const outputPath = './public/resources.csv';

function generateCSV() {
    const headers = [
    'id', 'title', 'organization', 'link', 'dataTypes', 'compensationType', 
    'entityCategory', 'entitySubType', 'countries', 'countryCodes', 
    'description', 'instructions', 'citations', 'wikidataId', 'resourceWikidataId', 'dataTypeWikidataIds'
  ];

      const formatCitations = (citations) => {
    if (!citations || citations.length === 0) return '';
    return citations.map(c => c.link).join('; ');
      };
      
  let csvContent = headers.join(',') + '\n';

  wikidataResources.forEach(resource => {
    const row = [
      `"${resource.id || ''}"`,
      `"${resource.title ? resource.title.replace(/"/g, '""') : ''}"`,
      `"${resource.organization ? resource.organization.replace(/"/g, '""') : ''}"`,
      `"${resource.link || ''}"`,
      `"${resource.dataTypes ? resource.dataTypes.join('; ') : ''}"`,
      `"${resource.compensationType || ''}"`,
      `"${resource.entityCategory || ''}"`,
      `"${resource.entitySubType || ''}"`,
      `"${resource.countries ? resource.countries.join('; ') : ''}"`,
      `"${resource.countryCodes ? resource.countryCodes.join('; ') : ''}"`,
      `"${resource.description ? resource.description.replace(/"/g, '""') : ''}"`,
      `"${resource.instructions ? resource.instructions.join('; ').replace(/"/g, '""') : ''}"`,
      `"${formatCitations(resource.citations)}"`,
      `"${resource.wikidataId || ''}"`,
      `"${resource.resourceWikidataId || ''}"`,
      `"${resource.dataTypeMappings ? Object.values(resource.dataTypeMappings).join('; ') : ''}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  try {
    writeFile(outputPath, csvContent, 'utf8');
    console.log(`Successfully generated CSV file at ${outputPath}`);
  } catch (error) {
    console.error('Error generating CSV file:', error);
  }
}

        generateCSV();