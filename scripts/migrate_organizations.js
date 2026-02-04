/**
 * Migration script v2: Convert organization string to organizations array in resources.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read resources_wikidata.json for organization wikidataIds
const wikidataPath = join(__dirname, '../public/resources_wikidata.json');
const wikidataResources = JSON.parse(readFileSync(wikidataPath, 'utf8'));

// Create a lookup map by id
const wikidataOrgMap = new Map();
wikidataResources.forEach(r => {
    if (r.organizations) {
        wikidataOrgMap.set(r.id, r.organizations);
    }
});

function migrateResourcesJs() {
    const filePath = join(__dirname, '../src/data/resources.js');
    let content = readFileSync(filePath, 'utf8');

    // For each resource with organization field, replace with organizations array
    // Use resources_wikidata.json as the source of truth for the organizations structure

    wikidataResources.forEach(wikidataResource => {
        if (!wikidataResource.organizations) return;

        const orgString = wikidataResource.organizations.map(o => o.name).join('; ');

        // Find and replace old organization field with new organizations array
        // Match: "organization": "some org name",
        const patterns = [
            `"organization": "${orgString}",`,
            `"organization": "${orgString.replace(/; /g, ';')}",`,
        ];

        // Also try individual org names for single-org cases
        if (wikidataResource.organizations.length === 1) {
            patterns.push(`"organization": "${wikidataResource.organizations[0].name}",`);
        }

        for (const pattern of patterns) {
            if (content.includes(pattern)) {
                const orgsJson = JSON.stringify(wikidataResource.organizations, null, 6)
                    .split('\n')
                    .map((line, i) => i === 0 ? line : '    ' + line)
                    .join('\n');
                content = content.replace(pattern, `"organizations": ${orgsJson},`);
                console.log(`Migrated: ${wikidataResource.title}`);
                break;
            }
        }
    });

    writeFileSync(filePath, content, 'utf8');
    console.log('Migration of resources.js complete!');
}

migrateResourcesJs();
