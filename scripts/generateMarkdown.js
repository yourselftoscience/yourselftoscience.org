import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resources } from '../src/data/resources.js';
import { EU_COUNTRIES } from '../src/data/constants.js';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateStatsMarkdown() {
  console.log('Generating stats.md...');

  // --- Replicate stats calculations from stats/page.js ---

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


  // --- Origin Calculation (similar to Availability) ---
  const resourcesByOrigin = resources.reduce((acc, resource) => {
    // Use resource.origin if available, grouping EU countries
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

  // --- Generate Markdown Content ---

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

  const outputPath = path.join(__dirname, '../public/stats.md');
  fs.writeFileSync(outputPath, mdContent);
  console.log(`Successfully generated ${outputPath}`);
}

function generateHomepageMarkdown() {
  console.log('Generating index.html.md...');

  let mdContent = `# Yourself to Science: Contribute to Science\n\n`;
  mdContent += `Yourself to Science™ is an open-source project providing a comprehensive catalogue of services that allow individuals to contribute to scientific research with their data, genome, body, and more.\n\n`;
  mdContent += `This page provides a filterable catalogue of all resources. You can also download the full dataset as CSV or JSON.\n\n`;
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
    // Add separator only if it's not the last item
    if (index < resources.length - 1) {
      mdContent += `---\n\n`;
    } else {
      mdContent += `---`; // End with separator but no extra newlines
    }
  }

  // Ensure no trailing spaces and single trailing newline
  mdContent = mdContent.replace(/ +$/gm, '') + '\n';

  const outputPath = path.join(__dirname, '../public/index.html.md');
  fs.writeFileSync(outputPath, mdContent);
  console.log(`Successfully generated ${outputPath}`);
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
    if (resource.dataTypes) {
      mdContent += `*Data Types:* ${resource.dataTypes.join(', ')}\n\n`;
    }
    if (resource.countries) {
      mdContent += `*Countries:* ${resource.countries.join(', ')}\n\n`;
    }
    if (resource.compensationType) {
      mdContent += `*Compensation:* ${resource.compensationType.charAt(0).toUpperCase() + resource.compensationType.slice(1)}\n\n`;
    }
    mdContent += `---\n\n`;
  }

  const outputPath = path.join(__dirname, '../public/clinical-trials.md');
  fs.writeFileSync(outputPath, mdContent);
  console.log(`Successfully generated ${outputPath}`);
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
    if (resource.dataTypes) {
      mdContent += `*Data Types:* ${resource.dataTypes.join(', ')}\n\n`;
    }
    if (resource.countries) {
      mdContent += `*Countries:* ${resource.countries.join(', ')}\n\n`;
    }
    if (resource.compensationType) {
      mdContent += `*Compensation:* ${resource.compensationType.charAt(0).toUpperCase() + resource.compensationType.slice(1)}\n\n`;
    }
    mdContent += `---\n\n`;
  }

  const outputPath = path.join(__dirname, '../public/organ-body-tissue-donation.md');
  fs.writeFileSync(outputPath, mdContent);
  console.log(`Successfully generated ${outputPath}`);
}

function generateGetInvolvedMarkdown() {
  console.log('Generating get-involved.md...');

  const redditSuggestUrl = `https://www.reddit.com/r/YourselfToScience/submit?title=Suggestion%3A%20New%20Service%20-%20[Service%20Title]&text=Please%20fill%20out%20the%20following%20information%20as%20completely%20as%20possible.%0A%0A**Service%20Title%3A**%0A%0A**Service%20Link%3A**%0A%0A**Data%20Types%3A**%20(e.g.%2C%20Genome%2C%20Health%20data%2C%20Fitbit%20data%2C%20etc.)%0A%0A**Countries%20Available%3A**%20(e.g.%2C%20Worldwide%2C%20United%20States%2C%20etc.)%0A%0A**Why%20it's%20a%20good%20fit%20for%20the%20catalogue%3A**`;
  const githubSuggestUrl = `https://github.com/yourselftoscience/yourselftoscience.org/issues/new?template=suggest-a-service.md&title=Suggestion:%20New%20Service%20-%20[Service%20Title]`;

  let mdContent = `# Get Involved\n\n`;
  mdContent += `Our mission is to provide a transparent, accessible, and comprehensive catalogue of services to advance scientific research. This project is built by the community, for the community, and every contribution is incredibly valuable.\n\n`;

  mdContent += `## Join the Discussion\n\n`;
  mdContent += `The best place to start. Suggest new services, share ideas, and get feedback from the community. Perfect for all users.\n\n`;
  mdContent += `[Suggest on Reddit](${redditSuggestUrl})\n\n`;

  mdContent += `## Go Direct\n\n`;
  mdContent += `For developers and those comfortable with GitHub. Use our template to add your suggestion directly to our project tracker.\n\n`;
  mdContent += `[Suggest on GitHub](${githubSuggestUrl})\n\n`;

  mdContent += `## Contact Us\n\n`;
  mdContent += `Have a question, suggestion, or collaboration idea? We’d love to hear from you. Email us at [hello@yourselftoscience.org](mailto:hello@yourselftoscience.org).\n\n`

  mdContent += `Want to help in other ways? Explore our [project repository](https://github.com/yourselftoscience/yourselftoscience.org) for documentation, code, and more.\n`;

  const outputPath = path.join(__dirname, '../public/get-involved.md');
  fs.writeFileSync(outputPath, mdContent);
  console.log(`Successfully generated ${outputPath}`);
}


function generateAllMarkdown() {
  generateStatsMarkdown();
  generateHomepageMarkdown();
  generateClinicalTrialsMarkdown();
  generateOrganBodyTissueDonationMarkdown();
  generateGetInvolvedMarkdown();
}

generateAllMarkdown();

export { generateAllMarkdown }; 