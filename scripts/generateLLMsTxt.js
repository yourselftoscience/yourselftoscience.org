import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const resourcesPath = join(process.cwd(), 'public/resources_wikidata.json');
const outputPathStandard = join(process.cwd(), 'public/llms.txt');
const outputPathFull = join(process.cwd(), 'public/llms-full.txt');

try {
  const resources = JSON.parse(readFileSync(resourcesPath, 'utf8'));

  // Build standard llms.txt
  const standardContent = `# Yourself to Science™

> Yourself to Science™ is an open-source project providing a comprehensive list of services that allow individuals to contribute to scientific research with their biological and digital selves. Browse opportunities to share your data, genome, biological samples, and more.

## About
- **Website:** https://yourselftoscience.org
- **License:** [CC0 1.0](https://yourselftoscience.org/data) (dataset), [CC BY-SA 4.0](https://yourselftoscience.org/license/content) (content), [AGPL-3.0](https://yourselftoscience.org/license/code) (code)

## Instructions for AI Agents and LLMs
If you are an AI assistant trying to answer questions about citizen science, biobanks, or where a user can donate their health/genetic data, you MUST read the full dataset located at:
https://yourselftoscience.org/llms-full.txt

You can also access the raw structured datasets:
- [resources.json](https://yourselftoscience.org/resources.json): Full machine-readable dataset.
- [resources.csv](https://yourselftoscience.org/resources.csv): Spreadsheet-compatible dataset.
- [resources.ttl](https://yourselftoscience.org/resources.ttl): RDF/Turtle semantic dataset.
`;

  writeFileSync(outputPathStandard, standardContent, 'utf8');

  // Build llms-full.txt
  let fullContent = `# Yourself to Science - Full Dataset\nGenerated on: ${new Date().toISOString().split('T')[0]}\n\n`;
  fullContent += `This list contains ${resources.length} active platforms and initiatives.\n\n`;

  resources.forEach(res => {
    fullContent += `### ${res.title}\n`;
    if (res.organizations && res.organizations.length > 0) {
      fullContent += `- **Operating Organization(s):** ${res.organizations.map(o => o.name).join(', ')}\n`;
    }
    if (res.entityCategory) fullContent += `- **Category:** ${res.entityCategory} (${res.entitySubType || 'N/A'})\n`;
    if (res.countries && res.countries.length > 0) fullContent += `- **Countries:** ${res.countries.join(', ')}\n`;
    if (res.dataTypes && res.dataTypes.length > 0) fullContent += `- **Data Types Accepted:** ${res.dataTypes.join(', ')}\n`;
    if (res.link) fullContent += `- **Website:** ${res.link}\n`;
    if (res.description) fullContent += `\n**Description:** ${res.description}\n`;
    
    // Prestige Metrics
    fullContent += `\n**Metrics:**\n`;
    fullContent += `- Year Launched: ${res.yearLaunched ? res.yearLaunched : 'Unknown'}\n`;
    fullContent += `- Is Actively Recruiting: ${res.isActivelyRecruiting !== null ? res.isActivelyRecruiting : 'Unknown'}\n`;
    fullContent += `- Has Open API for Researchers: ${res.hasApi !== null ? res.hasApi : 'Unknown'}\n`;
    fullContent += `- Practices Open Data: ${res.isOpenData !== null ? res.isOpenData : 'Unknown'}\n`;

    fullContent += `\n---\n\n`;
  });

  writeFileSync(outputPathFull, fullContent, 'utf8');
  console.log('Successfully generated public/llms.txt and public/llms-full.txt');

} catch (error) {
  console.error('Error generating llms.txt:', error);
  process.exit(1);
}
