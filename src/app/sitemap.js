import { activeResources } from '@/data/resources';
import { dataTypesOntology } from '@/data/ontology';
import lastUpdatedMeta from '@/data/lastUpdated.json';

export default function sitemap() {
  const baseUrl = 'https://yourselftoscience.org';
  const lastModified = lastUpdatedMeta.dateModified ? new Date(lastUpdatedMeta.dateModified) : new Date();

  // Core Static Pages
  const staticPages = [
    '',
    '/explore',
    '/data',
    '/data-types',
    '/resources',
    '/stats',
    '/mission',
    '/get-involved',
    '/open-data',
    '/clinical-trials',
    '/genetic-data',
    '/organ-body-tissue-donation',
    '/what-can-i-do-with-my-genetic-data',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Individual Resource Pages
  const resourcePages = activeResources.map((resource) => ({
    url: `${baseUrl}/resource/${resource.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Individual Data-Type Ontology Pages
  const dataTypePages = dataTypesOntology.map((dataType) => ({
    url: `${baseUrl}/data-types/${dataType.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...resourcePages, ...dataTypePages];
}
