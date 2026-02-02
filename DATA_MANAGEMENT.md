# Data Management Guide

This guide details how to manage the underlying data for **Yourself to Science**, including the web application resources and the generated datasets (JSON, CSV, RDF/Turtle).

## Data Sources

The project currently maintains two parallel data sources that must be kept in sync:

1. **`src/data/resources.js`**: The primary source for the **web application**. This drives the UI cards and search functionality.
2. **`public/resources_wikidata.json`**: The source for the **downloadable datasets** (`resources.json`, `resources.csv`, `resources.ttl`). This file contains additional metadata, specifically Wikidata IDs, to support Linked Open Data (LOD).

## Workflow: Adding or Updating a Resource

To add or update a resource, you must modify **both** sources and then regenerate the static files.

### 1. Update the Web Application

Edit `src/data/resources.js`, or use the helper script to generate a placeholder with a unique ID:

```bash
node scripts/generate-id.js <your-slug-here>
```

This will append a new entry to `resources.js`. Open the file to fill in the details.

### 2. Sync Metadata (Safe Mode)

Run the synchronization script. This script blindly copies the new structure from `resources.js` to `resources_wikidata.json`.

- **It copies**: New resources, new data types.
- **It initializes**: New Wikidata fields to `null`.
- **It preserves**: All existing manual edits and IDs.

```bash
node scripts/_generateWikidata.js
```

### 3. Manually Add Metadata

Open `public/resources_wikidata.json`. New entries will have `null` fields. You must **manually** find and paste the correct Wikidata IDs (`Q-IDs`).

**⚠️ CRITICAL WARNING: False Positives**
Wikidata search can return homonyms. **Always verify the item description.**

- **Example**: "Cover letter" might return a "creative work" or "disambiguation page". Ensure you select the concept corresponding to "letter of introduction sent with a résumé" (e.g., `Q569410`).
- **Correction**: If an ID is incorrect, manually edit `public/resources_wikidata.json` to insert the correct `Q-ID`. The sync script will **preserve** this correction on future runs.

### 4. Regenerate Datasets

Once both source files are updated, run the following command to regenerate all downstream datasets (JSON, CSV, Sitemap, RDF):

```bash
npm run prebuild
```

This script executes:

- `update-sitemap`
- `update-csv` (generates `public/resources.csv`)
- `update-json` (generates `public/resources.json` from `resources_wikidata.json`)
- `update-idmap`
- `update-markdown`
- `update-rdf` (generates `public/resources.ttl`)

## Quality Control

After regeneration, manually verify the output files in the `public/` directory to ensure the new data is present and correctly formatted.
