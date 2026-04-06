import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const jsonPath = join(process.cwd(), 'public/resources_wikidata.json');
const outputPath = join(process.cwd(), 'public/resources.csv');

const statsPath = join(process.cwd(), 'src/data/wikidataStats.json');
const rorPath = join(process.cwd(), 'src/data/rorData.json');

try {
  const wikidataResources = JSON.parse(readFileSync(jsonPath, 'utf8'));

  let citedQIDs = new Set();
  try {
    const stats = JSON.parse(readFileSync(statsPath, 'utf8'));
    citedQIDs = new Set(stats.items ? stats.items.map(i => i.id) : []);
  } catch(e) {}

  let rorData = {};
  try {
    rorData = JSON.parse(readFileSync(rorPath, 'utf8'));
  } catch(e) {}

  const headers = [
    'id', 'permalink', 'title', 'organization', 'link', 'dataTypes', 'compensationType', 'compensationWikidataId',
    'entityCategory', 'entitySubType', 'countries', 'countryCodes', 'origin', 'originCode',
    'description', 'instructions', 'citations', 'citationWikidataIds', 'wikidataId', 'resourceWikidataId', 'dataTypeWikidataIds',
    'isCitedOnWikidata', 'wikidataReferenceUrl',
    'rorId', 'rorTypes'
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

    const isCited = resource.resourceWikidataId ? citedQIDs.has(resource.resourceWikidataId) : false;
    const refUrl = isCited ? `https://www.wikidata.org/wiki/${resource.resourceWikidataId}` : '';

    // Get ROR data for the first org
    const firstOrgName = resource.organizations?.[0]?.name;
    const ror = firstOrgName ? rorData[firstOrgName] : null;
    const rorId = (ror && ror.rorId && ror.name) ? ror.rorId : '';
    const rorTypes = (ror && ror.types) ? ror.types.join('; ') : '';

    const row = [
      `"${resource.id || ''}"`,
      `"https://yourselftoscience.org/resource/${resource.id}"`,
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
      `"${resource.citations ? resource.citations.map(c => c.wikidataId || '').join('; ') : ''}"`,
      `"${resource.wikidataId || ''}"`,
      `"${resource.resourceWikidataId || ''}"`,
      `"${resource.dataTypeMappings ? Object.values(resource.dataTypeMappings).join('; ') : ''}"`,
      `"${isCited}"`,
      `"${refUrl}"`,
      `"${rorId}"`,
      `"${rorTypes}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  writeFileSync(outputPath, csvContent, 'utf8');
  console.log(`Successfully generated CSV file at ${outputPath}`);
} catch (error) {
  console.error('Error generating CSV file:', error);
  process.exit(1);
}