import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const jsonPath = join(process.cwd(), 'public/resources_wikidata.json');
const outputPath = join(process.cwd(), 'public/resources.csv');

try {
  const wikidataResources = JSON.parse(readFileSync(jsonPath, 'utf8'));

  const headers = [
    'id', 'title', 'organization', 'link', 'dataTypes', 'compensationType', 'compensationWikidataId',
    'entityCategory', 'entitySubType', 'countries', 'countryCodes', 'origin', 'originCode',
    'description', 'instructions', 'citations', 'wikidataId', 'resourceWikidataId', 'dataTypeWikidataIds'
  ];

  const formatCitations = (citations) => {
    if (!citations || citations.length === 0) return '';
    return citations.map(c => c.link).join('; ');
  };

  let csvContent = headers.join(',') + '\n';

  wikidataResources.forEach(resource => {
    // Handle array or string for compensationWikidataId
    let compQID = '';
    if (Array.isArray(resource.compensationWikidataId)) compQID = resource.compensationWikidataId.join('; ');
    else if (resource.compensationWikidataId) compQID = resource.compensationWikidataId;

    const row = [
      `"${resource.id || ''}"`,
      `"${resource.title ? resource.title.replace(/"/g, '""') : ''}"`,
      `"${resource.organizations ? resource.organizations.map(o => o.name).join('; ').replace(/"/g, '""') : ''}"`,
      `"${resource.link || ''}"`,
      `"${resource.dataTypes ? resource.dataTypes.join('; ') : ''}"`,
      `"${resource.compensationType || ''}"`,
      `"${compQID}"`,
      `"${resource.entityCategory || ''}"`,
      `"${resource.entitySubType || ''}"`,
      `"${resource.countries ? resource.countries.join('; ') : ''}"`,
      `"${resource.countryCodes ? resource.countryCodes.join('; ') : ''}"`,
      `"${resource.origin ? resource.origin.replace(/"/g, '""') : ''}"`,
      `"${resource.originCode ? resource.originCode.replace(/"/g, '""') : ''}"`,
      `"${resource.description ? resource.description.replace(/"/g, '""') : ''}"`,
      `"${resource.instructions ? resource.instructions.join('; ').replace(/"/g, '""') : ''}"`,
      `"${formatCitations(resource.citations)}"`,
      `"${resource.wikidataId || ''}"`,
      `"${resource.resourceWikidataId || ''}"`,
      `"${resource.dataTypeMappings ? Object.values(resource.dataTypeMappings).join('; ') : ''}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  writeFileSync(outputPath, csvContent, 'utf8');
  console.log(`Successfully generated CSV file at ${outputPath}`);
} catch (error) {
  console.error('Error generating CSV file:', error);
  process.exit(1);
}