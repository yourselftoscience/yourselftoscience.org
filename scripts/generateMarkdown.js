import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichedResourcesWithMacro as resources } from '../src/data/resources.js';
import { dataTypesOntology } from '../src/data/ontology.js';
import { EU_COUNTRIES } from '../src/data/constants.js';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const RESOURCE_DIR = path.join(PUBLIC_DIR, 'resource');

// Ensure directories exist
if (!fs.existsSync(RESOURCE_DIR)) {
  fs.mkdirSync(RESOURCE_DIR, { recursive: true });
}

function generateStatsMarkdown() {
  console.log('Generating stats.md...');

  const totalResources = resources.length;

  const resourcesByCountry = resources.reduce((acc, resource) => {
    if (resource.countries && resource.countries.length > 0) {
      for (const country of resource.countries) {
        const countryName = country === 'European Union' || EU_COUNTRIES.includes(country) ? 'European Union' : country;
        acc[countryName] = (acc[countryName] || 0) + 1;
      }
    } else {
      acc['Worldwide'] = (acc['Worldwide'] || 0) + 1;
    }
    return acc;
  }, {});

  const resourcesByDataType = resources.reduce((acc, resource) => {
    for (const type of (resource.dataTypes || [])) {
      const baseType = type.startsWith('Wearable data') ? 'Wearable data' : type;
      acc[baseType] = (acc[baseType] || 0) + 1;
    }
    return acc;
  }, {});

  const resourcesByCompensation = resources.reduce((acc, resource) => {
    const type = resource.compensationType || 'donation';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const resourcesByEntityType = resources.reduce((acc, resource) => {
    const category = resource.entityCategory || 'Other';
    const subType = resource.entitySubType || 'Not Specified';

    if (!acc[category]) {
      acc[category] = { count: 0, subTypes: {} };
    }
    acc[category].count++;
    acc[category].subTypes[subType] = (acc[category].subTypes[subType] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(resourcesByCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const dataTypesDistribution = Object.entries(resourcesByDataType)
    .sort(([, a], [, b]) => b - a);

  const compensationDistribution = Object.entries(resourcesByCompensation)
    .sort(([, a], [, b]) => b - a);

  const entityTypeDistribution = Object.entries(resourcesByEntityType)
    .map(([name, data]) => ({
      name,
      count: data.count,
      subTypes: Object.entries(data.subTypes).sort(([, a], [, b]) => b - a),
    }))
    .sort((a, b) => b.count - a.count);

  const euBreakdownStats = Object.entries(resources.reduce((acc, resource) => {
    if (resource.countries) {
      for (const country of resource.countries) {
        if (country === 'European Union') {
          acc['EU-Wide'] = (acc['EU-Wide'] || 0) + 1;
        } else if (EU_COUNTRIES.includes(country)) {
          acc[country] = (acc[country] || 0) + 1;
        }
      }
    }
    return acc;
  }, {})).sort(([, a], [, b]) => b - a);

  const resourcesByOrigin = resources.reduce((acc, resource) => {
    if (resource.origin) {
      const originName = resource.origin === 'European Union' || EU_COUNTRIES.includes(resource.origin) ? 'European Union' : resource.origin;
      acc[originName] = (acc[originName] || 0) + 1;
    }
    return acc;
  }, {});

  const topOrigins = Object.entries(resourcesByOrigin)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const euOriginBreakdownStats = Object.entries(resources.reduce((acc, resource) => {
    if (resource.origin) {
      if (resource.origin === 'European Union') {
        acc['EU-Wide'] = (acc['EU-Wide'] || 0) + 1;
      } else if (EU_COUNTRIES.includes(resource.origin)) {
        acc[resource.origin] = (acc[resource.origin] || 0) + 1;
      }
    }
    return acc;
  }, {})).sort(([, a], [, b]) => b - a);

  let mdContent = `# Project Statistics\n\n`;
  mdContent += `An overview of the resources available on Yourself to Science, providing insights into the landscape of citizen science contribution.\n\n`;
  mdContent += `## Overview\n\n`;
  mdContent += `- **Total Resources:** ${totalResources}\n\n`;
  mdContent += `## Compensation Types\n\n`;
  for (const [type, count] of compensationDistribution) {
    mdContent += `- **${type.charAt(0).toUpperCase() + type.slice(1)}:** ${count}\n`;
  }
  mdContent += `\n`;
  mdContent += `## Resources Based In\n\n`;
  for (const [origin, count] of topOrigins) {
    mdContent += `- **${origin}:** ${count}\n`;
    if (origin === 'European Union') {
      mdContent += `  - **Breakdown:**\n`;
      for (const [euCountry, euCount] of euOriginBreakdownStats) {
        mdContent += `    - **${euCountry}:** ${euCount}\n`;
      }
    }
  }
  mdContent += `\n`;
  mdContent += `## Top 10 Service Availability by Country\n\n`;
  for (const [country, count] of topCountries) {
    mdContent += `- **${country}:** ${count}\n`;
    if (country === 'European Union') {
      mdContent += `  - **Breakdown:**\n`;
      for (const [euCountry, euCount] of euBreakdownStats) {
        mdContent += `    - **${euCountry}:** ${euCount}\n`;
      }
    }
  }
  mdContent += `\n`;
  
  const wikidataStatsPath = path.join(__dirname, '../src/data/wikidataStats.json');
  let wikidataStats = { referencedItemsCount: 0 };
  if (fs.existsSync(wikidataStatsPath)) {
    try {
      wikidataStats = JSON.parse(fs.readFileSync(wikidataStatsPath, 'utf8'));
    } catch (e) {
      console.error('Error reading wikidataStats:', e);
    }
  }

  mdContent += `## Wikidata Impact\n\n`;
  mdContent += `Yourself to Science is actively enriching the global knowledge graph. Our dataset is used as a verified reference URL (P854) on **${wikidataStats.referencedItemsCount || 0} distinct Wikidata items**.\n\n`;

  mdContent += `## Data Type Distribution\n\n`;
  for (const [type, count] of dataTypesDistribution) {
    mdContent += `- **${type}:** ${count}\n`;
  }
  mdContent += `\n`;
  mdContent += `## Entity Type Distribution\n\n`;
  for (const entity of entityTypeDistribution) {
    mdContent += `- **${entity.name}:** ${entity.count}\n`;
    if (entity.subTypes.length > 1) {
      for (const [subType, subCount] of entity.subTypes) {
        mdContent += `  - **${subType}:** ${subCount}\n`;
      }
    }
  }
  mdContent += `\n`;
  mdContent += `## Live Data Access\n\n`;
  mdContent += `Use these persistent URLs for automated access to always get the latest version of the dataset.\n\n`;
  mdContent += `- **CSV Endpoint:** <https://yourselftoscience.org/resources.csv>\n`;
  mdContent += `- **JSON Endpoint:** <https://yourselftoscience.org/resources.json>\n`;

  const outputPath = path.join(PUBLIC_DIR, 'stats.md');
  fs.writeFileSync(outputPath, mdContent);
  console.log(`Successfully generated ${outputPath}`);
}

function generateHomepageMarkdown() {
  console.log('Generating index.html.md...');

  let mdContent = `# Yourself to Science: Contribute to Science\n\n`;
  mdContent += `> A comprehensive open-source catalogue for contributing your biological and digital self to scientific research. Browse opportunities to share your data, genome, biological samples, and more.\n\n`;
  mdContent += `This project is open source. The content is licensed under CC BY-SA 4.0 and the code is licensed under AGPL-3.0. This page provides a filterable catalogue of all resources. You can also download the full dataset as CSV or JSON.\n\n`;
  mdContent += `## All Resources\n\n`;

  for (const [index, resource] of resources.entries()) {
    mdContent += `### [${resource.title}](https://yourselftoscience.org/resource/${resource.slug})\n\n`;
    mdContent += `*Description:* ${resource.description}\n\n`;
    if (resource.dataTypes) {
      mdContent += `*Data Types:* ${resource.dataTypes.join(', ')}\n\n`;
    }
    if (resource.countries) {
      mdContent += `*Countries:* ${resource.countries.join(', ')}\n\n`;
    }
    if (resource.compensationType) {
      mdContent += `*Compensation:* ${resource.compensationType.charAt(0).toUpperCase() + resource.compensationType.slice(1)}\n\n`;
    }
    if (index < resources.length - 1) {
      mdContent += `---\n\n`;
    }
  }

  const outputPath = path.join(PUBLIC_DIR, 'index.html.md');
  fs.writeFileSync(outputPath, mdContent);
  console.log(`Successfully generated ${outputPath}`);
}

function generateResourceMarkdown(resource) {
  let mdContent = `# ${resource.title}\n\n`;
  mdContent += `> ${resource.description}\n\n`;

  if (resource.organizations) {
    const orgs = resource.organizations.map(o => o.name).join('; ');
    mdContent += `**Organizations:** ${orgs}\n\n`;
  }

  mdContent += `**Persistent ID:** https://yourselftoscience.org/resource/${resource.id}\n`;
  mdContent += `**Canonical URL:** https://yourselftoscience.org/resource/${resource.slug}\n`;

  if (resource.isCitedOnWikidata) {
    mdContent += `**Wikidata Citation:** This resource is actively cited on Wikidata. [View Reference (P854)](https://www.wikidata.org/wiki/${resource.resourceWikidataId})\n`;
  }

  mdContent += `\n## Details\n\n`;
  mdContent += `- **Data Types:** ${(resource.dataTypes || []).join(', ')}\n`;
  mdContent += `- **Compensation:** ${resource.compensationType || 'donation'}\n`;
  mdContent += `- **Entity Category:** ${resource.entityCategory || 'Other'}\n`;
  mdContent += `- **Entity Sub-Type:** ${resource.entitySubType || 'Not Specified'}\n`;

  if (resource.origin) {
    mdContent += `- **Based In:** ${resource.origin}\n`;
  }

  const countries = (resource.countries && resource.countries.length > 0) ? resource.countries.join(', ') : 'Worldwide';
  mdContent += `- **Availability:** ${countries}\n`;

  if (resource.excludedCountries && resource.excludedCountries.length > 0) {
    mdContent += `- **Excluded Countries:** ${resource.excludedCountries.join(', ')}\n`;
  }

  if (resource.compatibleSources && resource.compatibleSources.length > 0) {
    mdContent += `- **Compatible Sources:** ${resource.compatibleSources.join(', ')}\n`;
  }

  mdContent += `\n## How to Contribute\n\n`;
  mdContent += `[Contribute Now](${resource.link})\n\n`;

  if (resource.instructions && resource.instructions.length > 0) {
    mdContent += `### Steps\n\n`;
    resource.instructions.forEach((instruction, index) => {
      mdContent += `${index + 1}. ${instruction}\n`;
    });
    mdContent += `\n`;
  }

  if (resource.citations && resource.citations.length > 0) {
    mdContent += `## References\n\n`;
    resource.citations.forEach(citation => {
      if (citation.link) {
        mdContent += `- [${citation.title}](${citation.link})\n`;
      } else {
        mdContent += `- ${citation.title}\n`;
      }
    });
    mdContent += `\n`;
  }

  if (resource.resourceWikidataId) {
    mdContent += `## Linked Data\n\n`;
    mdContent += `- [Wikidata Entity](https://www.wikidata.org/wiki/${resource.resourceWikidataId})\n`;
  }

  const outputPath = path.join(RESOURCE_DIR, `${resource.slug}.md`);
  fs.writeFileSync(outputPath, mdContent);
}

function generateAllResourceMarkdowns() {
  console.log(`Generating markdown for ${resources.length} resources...`);
  resources.forEach(generateResourceMarkdown);
}

function generateClinicalTrialsMarkdown() {
  console.log('Generating clinical-trials.md...');
  const clinicalTrialResources = resources.filter(r => r.dataTypes.includes('Clinical trials'));

  let mdContent = `# Clinical Trials\n\n`;
  mdContent += `This page catalogues resources related to contributing to clinical trials.\n\n`;
  mdContent += `## Clinical Trial Resources\n\n`;

  for (const resource of clinicalTrialResources) {
    mdContent += `### [${resource.title}](https://yourselftoscience.org/resource/${resource.slug})\n\n`;
    mdContent += `*Description:* ${resource.description}\n\n`;
    mdContent += `---\n\n`;
  }

  const outputPath = path.join(PUBLIC_DIR, 'clinical-trials.md');
  fs.writeFileSync(outputPath, mdContent);
}

function generateGeneticDataMarkdown() {
  console.log('Generating what-can-i-do-with-my-genetic-data.md...');
  const geneticResourcesList = resources.filter(resource =>
    resource.dataTypes?.some(t => t.includes('Genome') || t.includes('DNA') || t.includes('Genetic'))
  );

  let mdContent = `# What can I do with my genetic data?\n\n`;
  mdContent += `> Find research for your DNA. A directory of active projects across various fields that accept genetic data (like 23andMe, AncestryDNA, or WGS).\n\n`;
  mdContent += `## Genetic Data Resources\n\n`;

  for (const resource of geneticResourcesList) {
    mdContent += `### [${resource.title}](https://yourselftoscience.org/resource/${resource.slug})\n\n`;
    mdContent += `*Description:* ${resource.description}\n\n`;
    mdContent += `---\n\n`;
  }

  const outputPath = path.join(PUBLIC_DIR, 'what-can-i-do-with-my-genetic-data.md');
  fs.writeFileSync(outputPath, mdContent);
}

function generateDataPageMarkdown() {
  console.log('Generating data.md...');
  let mdContent = `# Dataset & Access\n\n`;
  mdContent += `> Our complete dataset is open and available for anyone. We believe science data should be free. Unlike closed platforms, our entire catalogue is available as an Open Dataset published under the CC0 1.0 Universal license (Public Domain).\n\n`;
  mdContent += `## Live Data Access\n\n`;
  mdContent += `Use these persistent URLs for automated access to always get the latest version of the dataset.\n\n`;
  mdContent += `- **CSV Endpoint:** <https://yourselftoscience.org/resources.csv>\n`;
  mdContent += `- **JSON Endpoint:** <https://yourselftoscience.org/resources.json>\n`;
  mdContent += `- **RDF/TTL Endpoint:** <https://yourselftoscience.org/resources.ttl>\n`;
  mdContent += `- **VOID Endpoint:** <https://yourselftoscience.org/void.ttl>\n\n`;
  mdContent += `## Licensing\n\n`;
  mdContent += `Our dataset is dedicated to the public domain under the Creative Commons CC0 1.0 Universal Public Domain Dedication (CC0 1.0).\n\n`;

  const outputPath = path.join(PUBLIC_DIR, 'data.md');
  fs.writeFileSync(outputPath, mdContent);
}

function generateOrganBodyTissueDonationMarkdown() {
  console.log('Generating organ-body-tissue-donation.md...');
  const donationResources = resources.filter(r =>
    r.dataTypes.includes('Organ') ||
    r.dataTypes.includes('Body') ||
    r.dataTypes.includes('Tissue')
  );

  let mdContent = `# Organ, Body & Tissue Donation\n\n`;
  mdContent += `This page catalogues resources related to donating organs, bodies, or tissues for scientific research.\n\n`;
  mdContent += `## Organ, Body & Tissue Donation Resources\n\n`;

  for (const resource of donationResources) {
    mdContent += `### [${resource.title}](https://yourselftoscience.org/resource/${resource.slug})\n\n`;
    mdContent += `*Description:* ${resource.description}\n\n`;
    mdContent += `---\n\n`;
  }

  const outputPath = path.join(PUBLIC_DIR, 'organ-body-tissue-donation.md');
  fs.writeFileSync(outputPath, mdContent);
}

function generateGetInvolvedMarkdown() {
  console.log('Generating get-involved.md...');
  let mdContent = `# Get Involved\n\n`;
  mdContent += `Our mission is to provide a transparent, accessible, and comprehensive catalogue of services that allow individuals to contribute their biological and digital self to science. We are building a public good and welcome contributors, funders, and partners of all kinds.\n\n`;

  mdContent += `## Ways to Contribute\n\n`;
  mdContent += `- **Suggest new services:** Share ideas on Reddit or GitHub.\n`;
  mdContent += `- **Code:** Contribute to our open-source project on GitHub. We are built on foundations of transparency, access, and community.\n`;
  mdContent += `- **Partner With Us:** Connect with us to list an initiative or help build the catalogue.\n`;
  mdContent += `- **Contact:** Email hello@yourselftoscience.org\n\n`;

  mdContent += `### Core Principles\n\n`;
  mdContent += `- **Radically Open:** Dataset (CC0 1.0), content (CC BY-SA), and code (AGPL-3) are openly licensed.\n`;
  mdContent += `- **Community-Driven:** A collaborative ecosystem welcoming contributions from a global base.\n`;
  mdContent += `- **Accessible:** Built for everyone. Maintained with a high focus on accessibility and readability.\n`;
  mdContent += `- **AI-Ready:** Open data (CC0), open-source code, and an [llms.txt](https://yourselftoscience.org/llms.txt) file make the catalogue fully accessible to AI systems and LLMs.\n\n`;

  mdContent += `[Project Repository](https://github.com/yourselftoscience/yourselftoscience.org)\n`;

  const outputPath = path.join(PUBLIC_DIR, 'get-involved.md');
  fs.writeFileSync(outputPath, mdContent);
}

function generateMissionMarkdown() {
  console.log('Generating mission.md...');
  let mdContent = `# Our Mission & Roadmap\n\n`;
  mdContent += `> Building the simplest way to contribute to science through a unified, public catalogue of clinical trials, registries, databases, and programs.\n\n`;

  mdContent += `## The Challenge\n\n`;
  mdContent += `Many programs already exist—but without shared infrastructure, it's hard for people to navigate the full landscape. We believe everyone benefits when information is unified and accessible.\n\n`;
  mdContent += `- **Scattered Landscape:** Registries, donation portals, and services all exist independently, making it hard to see the full picture.\n`;
  mdContent += `- **Geographic Complexity:** Understanding where an opportunity is available often takes significant effort.\n`;
  mdContent += `- **Missing Context:** Details like organization type and compensation structure are valuable but not always easy to find or compare.\n`;
  mdContent += `- **No Shared Catalogue:** Previously, there was no standardized, open catalogue with machine-readable information.\n\n`;

  mdContent += `## Our Solution: A Unified, Open Catalogue\n\n`;
  mdContent += `By standardizing descriptions—normalizing country, data types, organization, and compensation—we make discovering and comparing opportunities frictionless.\n\n`;

  mdContent += `## Roadmap\n\n`;
  mdContent += `### PHASE 1: Trusted Central Hub\n`;
  mdContent += `Becoming the go-to reference for citizens, researchers, academia, and public institutions.\n\n`;
  mdContent += `### PHASE 2: Personalized Alerts\n`;
  mdContent += `Rollout of tailored newsletter updates based on country, data-type preference, and compensation models.\n\n`;
  mdContent += `### PHASE 3: Broadening Citizen Science\n`;
  mdContent += `Expanding beyond personal data to environmental data collection, image classification, and crowd-sourced field research.\n\n`;
  mdContent += `### PHASE 4: Multi-Language Integration\n`;
  mdContent += `Translating the catalogue natively so science is universally accessible regardless of spoken language.\n`;

  const outputPath = path.join(PUBLIC_DIR, 'mission.md');
  fs.writeFileSync(outputPath, mdContent);
}

function generateDataTypesMarkdown() {
  console.log('Generating data-types.md...');
  let mdContent = `# Data Dictionary\n\n`;
  mdContent += `> Ontology definitions for the biological, digital, and clinical data types tracked in the Yourself to Science catalogue.\n\n`;

  const wikidataStatsPath = path.join(__dirname, '../src/data/wikidataStats.json');
  let citedQIDs = new Set();
  if (fs.existsSync(wikidataStatsPath)) {
    try {
      const stats = JSON.parse(fs.readFileSync(wikidataStatsPath, 'utf8'));
      citedQIDs = new Set(stats.items ? stats.items.map(i => i.id) : []);
    } catch (e) {}
  }

  const sortedTypes = [...dataTypesOntology].sort((a, b) => a.title.localeCompare(b.title));

  for (const item of sortedTypes) {
    mdContent += `## ${item.title}\n\n`;
    mdContent += `${item.description}\n\n`;
    mdContent += `- **ID:** ${item.id}\n`;
    mdContent += `- **Semantic URL:** https://yourselftoscience.org/data-types/${item.slug}\n`;
    if (item.wikidataId) {
      mdContent += `- **Wikidata:** [${item.wikidataId}](https://www.wikidata.org/wiki/${item.wikidataId})\n`;
      if (citedQIDs.has(item.wikidataId)) {
        mdContent += `- **Wikidata Citation:** This semantic data type actively leverages Yourself to Science as a [verifiable reference URL (P854)](https://www.wikidata.org/wiki/${item.wikidataId})\n`;
      }
    }
    mdContent += `\n`;
  }

  const outputPath = path.join(PUBLIC_DIR, 'data-types.md');
  fs.writeFileSync(outputPath, mdContent);
}

function generateResourcesListMarkdown() {
  console.log('Generating resources.md (simplified list)...');
  let mdContent = `# All Resources List\n\n`;
  mdContent += `> A simplified, alphabetical listing of all research resources and contribution opportunities.\n\n`;

  const sortedResources = [...resources].sort((a, b) =>
    a.title.toLowerCase().localeCompare(b.title.toLowerCase())
  );

  for (const resource of sortedResources) {
    mdContent += `- [${resource.title}](https://yourselftoscience.org/resource/${resource.slug})\n`;
  }

  const outputPath = path.join(PUBLIC_DIR, 'resources.md');
  fs.writeFileSync(outputPath, mdContent);
}

function generateLlmsTxt() {
  console.log('Generating llms.txt...');

  let content = `# Yourself to Science Catalog\n\n`;
  content += `> Yourself to Science™ is an open-source project providing a comprehensive list of services that allow individuals to contribute to scientific research with their data, genome, body, and more.\n\n`;
  content += `This project is radically open. Our **entire dataset** is dedicated to the public domain under the [CC0 1.0 Universal license](https://yourselftoscience.org/data). The mission content is licensed under CC BY-SA 4.0 and the code is licensed under AGPL-3.0.\n\n`;

  content += `## Core Documentation\n\n`;
  content += `- [Full Catalogue (Markdown)](https://yourselftoscience.org/index.html.md): The main catalogue of all scientific contribution opportunities.\n`;
  content += `- [Our Mission](https://yourselftoscience.org/mission.md): The vision, core principles, and roadmap for a unified open catalogue.\n`;
  content += `- [Simplified List](https://yourselftoscience.org/resources.md): A concise, alphabetical listing of all catalogued resources.\n`;
  content += `- [Project Statistics](https://yourselftoscience.org/stats.md): Insights into the landscape of citizen science contribution.\n`;
  content += `- [Dataset & Access](https://yourselftoscience.org/data.md): Information on live data endpoints and CC0 dataset licensing.\n`;
  content += `- [Get Involved](https://yourselftoscience.org/get-involved.md): How to contribute to the project, suggest services, or partner with us.\n\n`;

  content += `## Specialized Collections\n\n`;
  content += `- [Clinical Trials](https://yourselftoscience.org/clinical-trials.md): Focus on clinical trials and research registries.\n`;
  content += `- [Organ, Body & Tissue Donation](https://yourselftoscience.org/organ-body-tissue-donation.md): Specialized collection for physical biological donations.\n`;
  content += `- [Genetic Data Wizard](https://yourselftoscience.org/what-can-i-do-with-my-genetic-data.md): Find research for your DNA and discover projects accepting genomic data.\n\n`;

  content += `## Metadata & Schema\n\n`;
  content += `- [Data Dictionary](https://yourselftoscience.org/data-types.md): Definitions and technical ontology of data types.\n\n`;

  content += `## Individual Resources\n\n`;
  for (const resource of resources) {
    content += `- [${resource.title}](https://yourselftoscience.org/resource/${resource.slug}.md): ${resource.description.split('.')[0]}.\n`;
  }

  content += `\n## Data Files\n\n`;
  content += `- [resources.json](https://yourselftoscience.org/resources.json): Full machine-readable dataset.\n`;
  content += `- [resources.csv](https://yourselftoscience.org/resources.csv): Spreadsheet-compatible dataset.\n`;
  content += `- [sitemap.xml](https://yourselftoscience.org/sitemap.xml): Index of all human-readable pages.\n\n`;

  content += `## Optional\n\n`;
  content += `- [Full PDF Catalogue](https://yourselftoscience.org/yourselftoscience.pdf): Print-ready version of the resource list.\n`;

  const outputPath = path.join(PUBLIC_DIR, 'llms.txt');
  fs.writeFileSync(outputPath, content);
  console.log(`Successfully generated ${outputPath}`);
}

function generateLlmsCtx() {
  console.log('Generating llms-ctx.txt and llms-ctx-full.txt...');

  const llmsTxtPath = path.join(PUBLIC_DIR, 'llms.txt');
  if (!fs.existsSync(llmsTxtPath)) return;

  const llmsTxt = fs.readFileSync(llmsTxtPath, 'utf8');

  // Extract all links
  const linkRegex = /\[([^\]]+)\]\((https:\/\/yourselftoscience\.org\/[^\)]+\.md)\)/g;
  let match;
  const links = [];
  while ((match = linkRegex.exec(llmsTxt)) !== null) {
    links.push({ name: match[1], url: match[2] });
  }

  let fullCtx = `# Yourself to Science Full Context\n\n`;
  fullCtx += `This file contains the full context of the Yourself to Science catalogue, including all resource details.\n\n`;

  for (const link of links) {
    const relativePath = link.url.replace('https://yourselftoscience.org/', '');
    const filePath = path.join(PUBLIC_DIR, relativePath);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      fullCtx += `\n--- START OF ${link.name} ---\n\n`;
      fullCtx += content;
      fullCtx += `\n--- END OF ${link.name} ---\n\n`;
    }
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-ctx-full.txt'), fullCtx);

  // For llms-ctx.txt, we might exclude resources or just take core pages
  let coreCtx = `# Yourself to Science Core Context\n\n`;
  const coreLinks = links.filter(l => !l.url.includes('/resource/'));

  for (const link of coreLinks) {
    const relativePath = link.url.replace('https://yourselftoscience.org/', '');
    const filePath = path.join(PUBLIC_DIR, relativePath);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      coreCtx += `\n--- START OF ${link.name} ---\n\n`;
      coreCtx += content;
      coreCtx += `\n--- END OF ${link.name} ---\n\n`;
    }
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-ctx.txt'), coreCtx);
  console.log('Successfully generated context files.');
}

function generateAllMarkdown() {
  generateStatsMarkdown();
  generateHomepageMarkdown();
  generateResourcesListMarkdown();
  generateClinicalTrialsMarkdown();
  generateOrganBodyTissueDonationMarkdown();
  generateGeneticDataMarkdown();
  generateDataPageMarkdown();
  generateGetInvolvedMarkdown();
  generateMissionMarkdown();
  generateDataTypesMarkdown();
  generateAllResourceMarkdowns();
  generateLlmsTxt();
  generateLlmsCtx();
}

generateAllMarkdown();

export { generateAllMarkdown };