// Canonical identities: live CC0 data, source software and registry record are distinct.
import { permanentDoi } from './config.js';
import { maintainer } from './maintainer.js';

export const catalogueId = 'https://yourselftoscience.org/resources.ttl#dataset';
export const catalogueUrl = 'https://yourselftoscience.org/data';
export const dataCatalogId = 'https://yourselftoscience.org/#catalogue';
export const registryDoi = '10.25504/FAIRsharing.d3d487';
export const registryUrl = `https://doi.org/${registryDoi}`;
export const softwareArchiveUrl = `https://doi.org/${permanentDoi}`;

export function buildCatalogueMetadata(dateModified) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': catalogueId,
    name: 'Yourself to Science Open Dataset',
    description: 'A curated catalogue of research-participation resources, with programme descriptions, source links and structured metadata. These are directory records, not participant-level research data.',
    url: catalogueUrl,
    identifier: catalogueId,
    keywords: ['research participation', 'citizen science', 'open dataset', 'research opportunities', 'JSON', 'CSV', 'linked data'],
    alternateName: ['Yourself to Science Catalogue', 'Yourself to Science Database'],
    creator: maintainer,
    maintainer,
    publisher: { '@type': 'Organization', name: 'Yourself to Science', url: 'https://yourselftoscience.org' },
    includedInDataCatalog: { '@type': 'DataCatalog', '@id': dataCatalogId, name: 'Yourself to Science', url: catalogueUrl },
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    isAccessibleForFree: true,
    ...(dateModified ? { dateModified } : {}),
    subjectOf: { '@type': 'CreativeWork', '@id': registryUrl, name: 'FAIRsharing record for: Yourself to Science', url: registryUrl },
    citation: { '@type': 'SoftwareSourceCode', '@id': softwareArchiveUrl, name: 'Yourself to Science software archive', url: softwareArchiveUrl, identifier: permanentDoi },
    distribution: [
      { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: 'https://yourselftoscience.org/resources.csv' },
      { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: 'https://yourselftoscience.org/resources.json' },
      { '@type': 'DataDownload', encodingFormat: 'text/turtle', contentUrl: 'https://yourselftoscience.org/resources.ttl' }
    ]
  };
}
