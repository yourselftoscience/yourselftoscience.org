import { writeFile } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const wikidataResources = require('../public/resources_wikidata.json');

const outputPath = './public/resources.ttl';
const BASE_URI = 'https://yourselftoscience.org/resource/';

function generateTurtle() {
  let ttlContent = `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix wd: <http://www.wikidata.org/entity/> .
@prefix yts: <https://yourselftoscience.org/ontology#> .

yts:compensationType a rdfs:Property ;
  rdfs:label "compensation type" ;
  rdfs:comment "The type of compensation offered for the data or resource." ;
  schema:domainIncludes schema:Dataset ;
  schema:rangeIncludes schema:Text .

`;

  wikidataResources.forEach(resource => {
    const resourceUri = `<${BASE_URI}${resource.id}>`;
    ttlContent += `${resourceUri} a schema:Dataset ;\n`;
    ttlContent += `  rdfs:label "${resource.title.replace(/"/g, '\\"')}" ;\n`;

    if (resource.description) {
      ttlContent += `  schema:description "${resource.description.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" ;\n`;
    }

    if (resource.resourceWikidataId) {
      ttlContent += `  schema:sameAs wd:${resource.resourceWikidataId} ;\n`;
    }

    if (resource.organization) {
      // Use a more specific type if available
      const orgType = resource.entityCategory === 'Government' ? 'schema:GovernmentOrganization' : 'schema:Organization';
      
      ttlContent += `  schema:creator [ a ${orgType}; rdfs:label "${resource.organization.replace(/"/g, '\\"')}"`;
      if (resource.wikidataId) {
        ttlContent += ` ; schema:sameAs wd:${resource.wikidataId}`;
      }
      
      // Add the entityCategory as an additionalType if its Wikidata ID exists
      if (resource.entityCategoryWikidataId) {
        ttlContent += ` ; schema:additionalType wd:${resource.entityCategoryWikidataId}`;
      }

      // Add the entitySubType as an additionalType if its Wikidata ID exists
      if (resource.entitySubTypeWikidataId) {
        ttlContent += ` ; schema:additionalType wd:${resource.entitySubTypeWikidataId}`;
      }
      
      ttlContent += ' ] ;\n';
    }

    if (resource.link) {
        ttlContent += `  schema:url <${resource.link}> ;\n`;
    }

    if (resource.countries && resource.countries.length > 0) {
      resource.countries.forEach(country => {
          ttlContent += `  schema:spatialCoverage [ a schema:Place; rdfs:label "${country.replace(/"/g, '\\"')}"`;
          if (resource.countryMappings && resource.countryMappings[country]) {
              ttlContent += ` ; schema:sameAs wd:${resource.countryMappings[country]}`;
          }
          ttlContent += ' ] ;\n';
      });
    }
    
    if (resource.dataTypes && resource.dataTypes.length > 0) {
        resource.dataTypes.forEach(dataType => {
            ttlContent += `  schema:keywords [ a schema:DefinedTerm; rdfs:label "${dataType.replace(/"/g, '\\\\"')}"`;
            if (resource.dataTypeMappings && resource.dataTypeMappings[dataType]) {
                ttlContent += ` ; schema:sameAs wd:${resource.dataTypeMappings[dataType]}`;
            }
            ttlContent += ' ] ;\n';
        });
    }

    if (resource.citations && resource.citations.length > 0) {
        resource.citations.forEach(citation => {
            if(citation.link) {
                ttlContent += `  schema:citation <${citation.link}> ;\n`;
            }
        });
    }

    if (resource.compensationType) {
        ttlContent += `  yts:compensationType "${resource.compensationType}" .\n\n`;
    } else {
        ttlContent = ttlContent.trim().slice(0, -1) + '.\n\n';
    }
  });

  try {
    writeFile(outputPath, ttlContent, 'utf8');
    console.log(`Successfully generated Turtle (TTL) file at ${outputPath}`);
  } catch (error) {
    console.error('Error generating Turtle (TTL) file:', error);
  }
}

generateTurtle(); 