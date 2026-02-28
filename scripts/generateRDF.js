import { readFileSync, writeFileSync, existsSync } from 'fs';
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
  const idToSlugPath = join(process.cwd(), 'public/id-to-slug.json');
  let idToSlug = {};
  if (existsSync(idToSlugPath)) {
    idToSlug = JSON.parse(readFileSync(idToSlugPath, 'utf8'));
  }

  let ttlContent = `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix wd: <http://www.wikidata.org/entity/> .
@prefix yts: <https://yourselftoscience.org/ontology#> .

yts:compensationWikidataId a rdfs:Property ;
  rdfs:label "compensation Wikidata ID" ;
  rdfs:comment "The Wikidata QID corresponding to the compensation type." ;
  schema:domainIncludes schema:Dataset ;
  schema:rangeIncludes schema:URL .

`;

  wikidataResources.forEach(resource => {
    const resourceUri = `<${BASE_URI}${resource.id}>`;
    ttlContent += `${resourceUri} a schema:Dataset ;\n`;
    ttlContent += `  schema:identifier "${resource.id}" ;\n`;
    ttlContent += `  schema:mainEntityOfPage <${BASE_URI}${resource.id}> ;\n`;
    
    if (idToSlug[resource.id]) {
        ttlContent += `  schema:sameAs <${BASE_URI}${idToSlug[resource.id]}> ;\n`;
    }

    ttlContent += `  rdfs:label "${escapeRDFString(resource.title)}" ;\n`;

    if (resource.description) {
      ttlContent += `  schema:description "${escapeRDFString(resource.description)}" ;\n`;
    }

    if (resource.resourceWikidataId) {
      ttlContent += `  schema:sameAs wd:${resource.resourceWikidataId} ;\n`;
    }

    if (resource.organizations && resource.organizations.length > 0) {
      const orgType = resource.entityCategory === 'Government' ? 'schema:GovernmentOrganization' : 'schema:Organization';

      resource.organizations.forEach((org, index) => {
        ttlContent += `  schema:creator [ a ${orgType}; rdfs:label "${escapeRDFString(org.name)}"`;
        if (org.wikidataId) {
          ttlContent += ` ; schema:sameAs wd:${org.wikidataId}`;
        }

        if (resource.entityCategoryWikidataId) {
          ttlContent += ` ; schema:additionalType wd:${resource.entityCategoryWikidataId}`;
        }

        if (resource.entitySubTypeWikidataId) {
          ttlContent += ` ; schema:additionalType wd:${resource.entitySubTypeWikidataId}`;
        }

        // Add origin only to first org to avoid duplication
        if (index === 0 && resource.origin) {
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
      });
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
        if (citation.wikidataId) {
          ttlContent += `  schema:citation wd:${citation.wikidataId} ;\n`;
        }
      });
    }

    if (resource.compensationType) {
      ttlContent += `  yts:compensationType "${resource.compensationType}" ;\n`;
    }

    if (resource.compensationWikidataId) {
      if (Array.isArray(resource.compensationWikidataId)) {
        const qids = resource.compensationWikidataId.map(q => `wd:${q}`).join(', ');
        ttlContent += `  yts:compensationWikidataId ${qids} .\n\n`;
      } else {
        ttlContent += `  yts:compensationWikidataId wd:${resource.compensationWikidataId} .\n\n`;
      }
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