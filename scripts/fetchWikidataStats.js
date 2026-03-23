import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the robust MediaWiki exturlusage API instead of SPARQL
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php?action=query&list=exturlusage&euquery=yourselftoscience.org&eunamespace=0&eulimit=max&format=json';

async function fetchWikidataStats() {
    console.log('Fetching Wikidata citation count...');
    try {
        const response = await fetch(WIKIDATA_API, {
            headers: {
                'User-Agent': 'YourselfToScience/1.0 (info@yourselftoscience.org)'
            },
            timeout: 10000 // 10 seconds
        });

        if (!response.ok) {
            throw new Error(`Wikidata API responded with status ${response.status}`);
        }

        const data = await response.json();
        
        // Use a Set to extract unique Wikidata item IDs (title contains the Q-ID)
        const uniqueItems = new Set();
        if (data && data.query && data.query.exturlusage) {
            data.query.exturlusage.forEach(item => {
                uniqueItems.add(item.title);
            });
        }
        
        const qids = Array.from(uniqueItems);
        const chunkSize = 50;
        const items = [];

        for (let i = 0; i < qids.length; i += chunkSize) {
            const chunk = qids.slice(i, i + chunkSize);
            const detailUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${chunk.join('|')}&props=labels&languages=en&format=json`;
            try {
                const detailRes = await fetch(detailUrl, {
                    headers: { 'User-Agent': 'YourselfToScience/1.0 (info@yourselftoscience.org)' },
                    timeout: 10000
                });
                if (detailRes.ok) {
                    const detailData = await detailRes.json();
                    if (detailData && detailData.entities) {
                        for (const id of chunk) {
                            const entity = detailData.entities[id];
                            let label = id;
                            if (entity && entity.labels && entity.labels.en) {
                                label = entity.labels.en.value;
                            }
                            // Don't list raw QIDs if label is missing (or use them anyway so they aren't lost)
                            items.push({ id, label });
                        }
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch labels for chunk ${i}: ${err.message}`);
            }
        }

        // Sort items alphabetically
        items.sort((a, b) => a.label.localeCompare(b.label));

        const count = uniqueItems.size;

        console.log(`Found ${count} unique Wikidata items referencing yourselftoscience.org! Fetched ${items.length} labels.`);

        const statsData = {
            referencedItemsCount: count,
            items: items,
            lastUpdated: new Date().toISOString()
        };

        const outputDir = path.join(__dirname, '..', 'src', 'data');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, 'wikidataStats.json');
        fs.writeFileSync(outputPath, JSON.stringify(statsData, null, 2));
        
        console.log(`Successfully saved Wikidata stats to ${outputPath}`);
    } catch (error) {
        console.error('Error fetching Wikidata stats:', error.message);
        console.log('Falling back to default stats (0).');
        
        const statsData = {
            referencedItemsCount: 0,
            lastUpdated: new Date().toISOString(),
            error: error.message
        };
        const outputPath = path.join(__dirname, '..', 'src', 'data', 'wikidataStats.json');
        fs.writeFileSync(outputPath, JSON.stringify(statsData, null, 2));
    }
}

fetchWikidataStats().catch(console.error);
