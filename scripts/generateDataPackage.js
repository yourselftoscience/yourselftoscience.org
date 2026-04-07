import { writeFileSync } from 'fs';
import { join } from 'path';

const outputPath = join(process.cwd(), 'public/datapackage.json');

const dataPackage = {
  "name": "yourself-to-science",
  "title": "Yourself to Science - Open Citizen Science Resources",
  "description": "Yourself to Science™ is an open-source project providing a comprehensive list of services that allow individuals to contribute to scientific research with their biological and digital selves.",
  "homepage": "https://yourselftoscience.org",
  "licenses": [
    {
      "id": "CC0-1.0",
      "name": "CC0 1.0 Universal",
      "path": "https://creativecommons.org/publicdomain/zero/1.0/"
    }
  ],
  "keywords": [
    "citizen science",
    "open data",
    "genomics",
    "health data",
    "biobanks"
  ],
  "resources": [
    {
      "name": "resources-csv",
      "title": "Resources (CSV)",
      "path": "resources.csv",
      "format": "csv",
      "mediatype": "text/csv",
      "schema": {
        "fields": [
          { "name": "id", "type": "string", "description": "Unique UUID for the resource" },
          { "name": "permalink", "type": "string", "description": "Permanent URL on the platform" },
          { "name": "title", "type": "string" },
          { "name": "organization", "type": "string" },
          { "name": "link", "type": "string" },
          { "name": "dataTypes", "type": "string" },
          { "name": "compensationType", "type": "string" },
          { "name": "compensationWikidataId", "type": "string" },
          { "name": "entityCategory", "type": "string" },
          { "name": "entitySubType", "type": "string" },
          { "name": "countries", "type": "string" },
          { "name": "countryCodes", "type": "string" },
          { "name": "origin", "type": "string" },
          { "name": "originCode", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "instructions", "type": "string" },
          { "name": "citations", "type": "string" },
          { "name": "citationWikidataIds", "type": "string" },
          { "name": "wikidataId", "type": "string" },
          { "name": "resourceWikidataId", "type": "string" },
          { "name": "dataTypeWikidataIds", "type": "string" },
          { "name": "isCitedOnWikidata", "type": "boolean" },
          { "name": "wikidataReferenceUrl", "type": "string" },
          { "name": "rorId", "type": "string" },
          { "name": "rorTypes", "type": "string" },
          { "name": "yearLaunched", "type": "string" },
          { "name": "isActivelyRecruiting", "type": "boolean" },
          { "name": "hasApi", "type": "boolean" },
          { "name": "isOpenData", "type": "boolean" }
        ]
      }
    },
    {
      "name": "resources-json",
      "title": "Resources (JSON)",
      "path": "resources.json",
      "format": "json",
      "mediatype": "application/json"
    }
  ]
};

try {
  writeFileSync(outputPath, JSON.stringify(dataPackage, null, 2), 'utf8');
  console.log('Successfully generated public/datapackage.json');
} catch (error) {
  console.error('Error generating datapackage.json:', error);
  process.exit(1);
}
