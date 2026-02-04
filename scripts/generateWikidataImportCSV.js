import { writeFile } from 'fs/promises';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { resources } = require('../src/data/resources.js');

const OUTPUT_PATH = './y2s_wikidata_import.csv';

function generateImportCSV() {
    console.log('Generating Wikidata Import CSV...');

    const resourcesToExport = resources.filter(r => {
        // Logic: Export items that do NOT have a resourceWikidataId (program ID)
        return !r.resourceWikidataId;
    });

    const headers = ['id', 'name', 'description', 'url', 'type'];
    let csvContent = headers.join(',') + '\n';

    let count = 0;

    resourcesToExport.forEach(r => {
        // Determine the Name to use
        // Use wikidataLabel if present, otherwise fall back to title.
        const name = r.wikidataLabel || r.title;

        // Clean description for Wikidata:
        // 1. Use wikidataDescription if available (override)
        // 2. Fallback to description with cleaning
        let desc = r.wikidataDescription || r.description || '';

        // Split by period to get first sentence if it's long
        if (desc.includes('. ')) {
            desc = desc.split('. ')[0];
        }

        // Remove trailing period
        if (desc.endsWith('.')) {
            desc = desc.slice(0, -1);
        }

        // Remove initial articles (case insensitive but usually capitalized at start)
        desc = desc.replace(/^(A|An|The)\s+/i, '');

        // Lowercase the first letter of the remaining string (as per guidelines "starts with lowercase")
        // UNLESS it's a proper noun (which is hard to detect perfectly, but we can try basic heuristics
        // or just leave it capitalized to be safe, though strict guidelines say lowercase.
        // However, many tools/editors prefer readable text. The guidelines say "begins with a lowercase letter except when uppercase would normally be required".
        // Let's try to lowercase it, but if it looks like a proper noun (e.g. "UBC"), keep it.
        // Actually, simple heuristics: if the second letter is lowercase, lowercase the first.
        if (desc.length > 1 && desc[1] === desc[1].toLowerCase() && desc[0] !== desc[0].toLowerCase()) {
            desc = desc.charAt(0).toLowerCase() + desc.slice(1);
        }

        // Escape quotes.
        const escapedName = `"${name.replace(/"/g, '""')}"`;
        const escapedDesc = `"${desc.replace(/"/g, '""')}"`;
        const escapedUrl = `"${(r.link || '').replace(/"/g, '""')}"`;

        let type = 'resource'; // default
        if (r.resourceType) {
            type = r.resourceType.toLowerCase();
        } else if (r.dataTypes && r.dataTypes.includes('Clinical trials')) {
            type = 'registry';
        } else if (r.dataTypes && (r.dataTypes.includes('Body') || r.dataTypes.includes('Tissue') || r.dataTypes.includes('Stool'))) {
            type = 'biobank';
        } else if (r.title.toLowerCase().includes('database') || r.title.toLowerCase().includes('gateway')) {
            type = 'database';
        } else if (r.title.toLowerCase().includes('program') || r.title.toLowerCase().includes('study')) {
            type = 'program';
        } else if (r.entityCategory === 'Academic') {
            type = 'research project';
        }

        // Refine type based on specific patterns
        if (r.wikidataLabel && r.wikidataLabel.includes('Program')) type = 'program';
        if (r.wikidataLabel && r.wikidataLabel.includes('Donation')) type = 'biobank';
        if (r.title.includes('ClinicalTrials')) type = 'registry';
        if (name.includes('Esperity')) type = 'registry';

        const row = [
            r.id,
            escapedName,
            escapedDesc,
            escapedUrl,
            type
        ];

        csvContent += row.join(',') + '\n';
        count++;
    });

    writeFile(OUTPUT_PATH, csvContent, 'utf8')
        .then(() => console.log(`Successfully generated ${OUTPUT_PATH} with ${count} items.`))
        .catch(err => console.error('Error writing CSV:', err));
}

generateImportCSV();
