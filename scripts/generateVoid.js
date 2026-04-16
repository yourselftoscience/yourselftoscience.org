import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const outputPath = join(process.cwd(), 'public/void.ttl');
const resourcesPath = join(process.cwd(), 'public/resources_wikidata.json');
const lastUpdatedPath = join(process.cwd(), 'src/data/lastUpdated.json');

try {
  const resources = JSON.parse(readFileSync(resourcesPath, 'utf8'));
  const { dateModified } = JSON.parse(readFileSync(lastUpdatedPath, 'utf8'));
  const entityCount = resources.length;

  const voidContent = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix void: <http://rdfs.org/ns/void#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://yourselftoscience.org/resources.ttl#dataset> a void:Dataset, schema:Dataset ;
    dcterms:title "Yourself to Science Dataset" ;
    dcterms:description "Yourself to Science™ is an open-source project providing a comprehensive list of services that allow individuals to contribute to scientific research with their biological and digital selves."@en ;
    dcterms:license <http://creativecommons.org/publicdomain/zero/1.0/> ;
    dcterms:creator [
        a foaf:Person ;
        foaf:name "Mario Marcolongo" ;
        foaf:mbox <mailto:hello@yourselftoscience.org> ;
        schema:sameAs <https://orcid.org/0000-0003-2846-7115>
    ] ;
    dcterms:publisher [
        a foaf:Organization ;
        foaf:name "Yourself to Science" ;
        foaf:homepage <https://yourselftoscience.org/> ;
        schema:sameAs <https://fairsharing.org/organisations/5676>
    ] ;
    dcterms:created "2025-01-31"^^xsd:date ;
    dcterms:modified "${dateModified}"^^xsd:date ;
    schema:version "2.0" ;
    dcterms:identifier <https://doi.org/10.5281/zenodo.15109359> ;
    schema:identifier "10.5281/zenodo.15110328" ;
    void:dataDump <https://yourselftoscience.org/resources.ttl> ;
    void:dataDump <https://yourselftoscience.org/resources.json> ;
    void:dataDump <https://yourselftoscience.org/resources.csv> ;
    schema:distribution [
        a schema:DataDownload ;
        schema:encodingFormat "text/turtle" ;
        schema:contentUrl <https://yourselftoscience.org/resources.ttl>
    ], [
        a schema:DataDownload ;
        schema:encodingFormat "application/json" ;
        schema:contentUrl <https://yourselftoscience.org/resources.json>
    ], [
        a schema:DataDownload ;
        schema:encodingFormat "text/csv" ;
        schema:contentUrl <https://yourselftoscience.org/resources.csv>
    ] ;
    void:entities ${entityCount} ;
    void:sparqlEndpoint <https://query.wikidata.org/> ;
    void:uriSpace <https://yourselftoscience.org/resource/> ;
    void:linkPredicate schema:sameAs ;
    void:target <http://www.wikidata.org/entity/Q2013> ;
    foaf:homepage <https://yourselftoscience.org/> .
`;

  writeFileSync(outputPath, voidContent, 'utf8');
  console.log(`Successfully generated ${outputPath} (${entityCount} entities, modified ${dateModified})`);

} catch (error) {
  console.error('Error generating void.ttl:', error);
  process.exit(1);
}
