import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const jsonPath = join(process.cwd(), 'public/resources_wikidata.json');
const statsPath = join(process.cwd(), 'src/data/wikidataStats.json');
const rorPath = join(process.cwd(), 'src/data/rorData.json');
const outputPath = join(process.cwd(), 'public/resources.json');

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
  
  const { dataTypeToMacroCategory } = await import('../src/data/resources.js');
  
  const enrichedResources = wikidataResources.map(resource => {
    // 1. Compute Macro Categories (consistent with src/data/resources.js)
    const macroCategories = Array.from(new Set(
      (resource.dataTypes || []).map(type => dataTypeToMacroCategory[type]).filter(Boolean)
    )).sort();

    // 2. Merge ROR data into organizations
    const enrichedOrgs = (resource.organizations || []).map(org => {
      const ror = rorData[org.name];
      if (ror && ror.rorId && ror.name) {
        return {
          ...org,
          rorId: ror.rorId,
          rorName: ror.name,
          rorTypes: ror.types || [],
          rorCountry: ror.country || null,
          rorCity: ror.city || null,
          rorEstablished: ror.established || null,
          rorAutoMatched: ror.autoMatched || false,
        };
      }
      return org;
    });

    return {
      ...resource,
      organizations: enrichedOrgs,
      macroCategories,
      permalink: `https://yourselftoscience.org/resource/${resource.id}`,
      isCitedOnWikidata: resource.resourceWikidataId ? citedQIDs.has(resource.resourceWikidataId) : false,
      wikidataReferenceUrl: (resource.resourceWikidataId && citedQIDs.has(resource.resourceWikidataId)) ? `https://www.wikidata.org/wiki/${resource.resourceWikidataId}` : null
    };
  });

  const jsonContent = JSON.stringify(enrichedResources, null, 2);
  writeFileSync(outputPath, jsonContent, 'utf8');
  console.log(`Successfully generated JSON file at ${outputPath}`);

  let lastUpdatedDate = new Date().toISOString().split('T')[0];
  try {
    const gitDate = execSync('git log -1 --format="%cI" src/data/resources.js').toString().trim();
    if (gitDate) {
      lastUpdatedDate = gitDate.split('T')[0];
    }
  } catch (e) {
    console.warn('Could not read git history for date modified. Using today.');
  }

  const metaPath = join(process.cwd(), 'src/data/lastUpdated.json');
  writeFileSync(metaPath, JSON.stringify({ dateModified: lastUpdatedDate }, null, 2), 'utf8');
  console.log(`Successfully generated metadata at ${metaPath}`);
} catch (error) {
  console.error('Error generating JSON file:', error);
  process.exit(1);
}