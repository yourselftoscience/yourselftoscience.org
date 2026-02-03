import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const outputPath = join(process.cwd(), 'public/resources.ttl');
const jsonPath = join(process.cwd(), 'public/resources_wikidata.json');
const BASE_URI = 'https://yourselftoscience.org/resource/';

function escapeRDFString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

try {
  const wikidataResources = JSON.parse(readFileSync(jsonPath, 'utf8'));

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
    ttlContent += `  rdfs:label "${escapeRDFString(resource.title)}" ;\n`;

    if (resource.description) {
      ttlContent += `  schema:description "${escapeRDFString(resource.description)}" ;\n`;
    }

    if (resource.resourceWikidataId) {
      ttlContent += `  schema:sameAs wd:${resource.resourceWikidataId} ;\n`;
    }

    if (resource.organization) {
      const orgType = resource.entityCategory === 'Government' ? 'schema:GovernmentOrganization' : 'schema:Organization';

      ttlContent += `  schema:creator [ a ${orgType}; rdfs:label "${escapeRDFString(resource.organization)}"`;
      if (resource.wikidataId) {
        ttlContent += ` ; schema:sameAs wd:${resource.wikidataId}`;
      }

      if (resource.entityCategoryWikidataId) {
        ttlContent += ` ; schema:additionalType wd:${resource.entityCategoryWikidataId}`;
      }

      if (resource.entitySubTypeWikidataId) {
        ttlContent += ` ; schema:additionalType wd:${resource.entitySubTypeWikidataId}`;
      }

      if (resource.origin) {
        ttlContent += ` ; schema:location [ a schema:Place; rdfs:label "${escapeRDFString(resource.origin)}"`;
        if (resource.originCode) {
          ttlContent += ` ; schema:addressCountry "${resource.originCode}"`;
        }
        if (resource.originWikidataId) {
          ttlContent += ` ; schema:sameAs wd:${resource.originWikidataId}`;
        }
        ttlContent += ' ]';
      }

      ttlContent += ' ] ;\n';
    }

    if (resource.link) {
      ttlContent += `  schema:url <${resource.link}> ;\n`;
    }

    if (resource.countries && resource.countries.length > 0) {
      resource.countries.forEach(country => {
        ttlContent += `  schema:spatialCoverage [ a schema:Place; rdfs:label "${escapeRDFString(country)}"`;
        if (resource.countryMappings && resource.countryMappings[country]) {
          ttlContent += ` ; schema:sameAs wd:${resource.countryMappings[country]}`;
        }
        ttlContent += ' ] ;\n';
      });
    }

    if (resource.dataTypes && resource.dataTypes.length > 0) {
      resource.dataTypes.forEach(dataType => {
        ttlContent += `  schema:keywords [ a schema:DefinedTerm; rdfs:label "${escapeRDFString(dataType)}"`;
        if (resource.dataTypeMappings && resource.dataTypeMappings[dataType]) {
          ttlContent += ` ; schema:sameAs wd:${resource.dataTypeMappings[dataType]}`;
        }
        ttlContent += ' ] ;\n';
      });
    }

    if (resource.citations && resource.citations.length > 0) {
      resource.citations.forEach(citation => {
        if (citation.link) {
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

  writeFileSync(outputPath, ttlContent, 'utf8');
  console.log(`Successfully generated Turtle (TTL) file at ${outputPath}`);

} catch (err) {
  console.error('Error generating RDF:', err);
  process.exit(1);
}