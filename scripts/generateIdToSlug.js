import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { resources } from '../src/data/resources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIdToSlug() {
  const map = {};
  for (const r of resources) {
    if (r.id && r.slug) {
      map[r.id] = r.slug;
    }
  }
  const outPath = path.join(__dirname, '..', 'public', 'id-to-slug.json');
  await writeFile(outPath, JSON.stringify(map, null, 2), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Successfully generated id-to-slug map at ${outPath}`);
}

generateIdToSlug().catch((err) => {
  console.error('Failed generating id-to-slug.json', err);
  process.exit(1);
});


