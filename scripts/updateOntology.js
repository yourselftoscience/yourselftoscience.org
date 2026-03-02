import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resourcesPath = path.join(__dirname, '../public/resources.json');
const ontologyPath = path.join(__dirname, '../src/data/ontology.js');

async function updateOntology() {
    console.log('Updating src/data/ontology.js via public/resources.json mappings...');

    // 1. Read existing ontology module
    // We append a timestamp to bypass ESM caching if run multiple times
    const ontologyModule = await import(`file://${ontologyPath}?t=${Date.now()}`);
    let dataTypesOntology = [...ontologyModule.dataTypesOntology];

    // 2. Read resources.json
    let resources = [];
    if (fs.existsSync(resourcesPath)) {
        resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));
    } else {
        console.warn(`Resources JSON not found at ${resourcesPath}. Generating from existing ontology only.`);
    }

    // 3. Extract data types and their Wikidata IDs from all resources
    const dataTypeMap = new Map(); // Store DataType name -> Wikidata ID

    for (const resource of resources) {
        if (resource.dataTypes) {
            for (const dt of resource.dataTypes) {
                if (!dataTypeMap.has(dt)) dataTypeMap.set(dt, null);
            }
        }
        if (resource.dataTypeMappings) {
            for (const [dt, qid] of Object.entries(resource.dataTypeMappings)) {
                if (qid) dataTypeMap.set(dt, qid);
            }
        }
    }

    // 4. Upsert data types into the ontology mapping
    let hasChanges = false;
    for (const [dtName, qid] of dataTypeMap.entries()) {
        let existing = dataTypesOntology.find(item => item.title === dtName);

        if (existing) {
            // Update wikidataId if newly discovered from resources.json
            // We favor truthy QIDs so we don't accidentally erase manual additions.
            if (qid && existing.wikidataId !== qid) {
                existing.wikidataId = qid;
                hasChanges = true;
            }
        } else {
            // Unseen data type: generate standard scaffolding
            const slug = dtName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            dataTypesOntology.push({
                id: crypto.randomUUID(),
                title: dtName,
                slug: slug,
                wikidataId: qid || undefined,
                description: ""
            });
            hasChanges = true;
        }
    }

    // 5. Sort alphabetically for predictability
    dataTypesOntology.sort((a, b) => a.title.localeCompare(b.title));

    // 6. Rewrite src/data/ontology.js completely ensuring exact formatting structure
    const content = `// src/data/ontology.js

export const dataTypesOntology = ${JSON.stringify(dataTypesOntology, null, 4)};

export function getDataTypeBySlugOrId(identifier) {
    if (!identifier) return null;
    const lowerId = identifier.toLowerCase();
    return dataTypesOntology.find(
        (dt) => dt.slug.toLowerCase() === lowerId || dt.id.toLowerCase() === lowerId
    );
}
`;

    fs.writeFileSync(ontologyPath, content, 'utf8');

    if (hasChanges) {
        console.log('Successfully updated src/data/ontology.js with new mappings/items!');
    } else {
        console.log('No new updates required for src/data/ontology.js');
    }
}

updateOntology().catch(err => {
    console.error('Error updating Ontology file:', err);
    process.exit(1);
});
