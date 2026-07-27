'use client';

import { useEffect } from 'react';

let datasetPromise;

function loadDataset() {
  if (!datasetPromise) {
    datasetPromise = fetch('/resources.json', { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`Dataset request failed: ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        datasetPromise = undefined;
        throw error;
      });
  }
  return datasetPromise;
}

const lower = (value) => String(value ?? '').toLowerCase();

function availableIn(resource) {
  const countries = resource.countries ?? resource.locations ?? [];
  return countries.length ? countries : ['Worldwide'];
}

function canonicalUrl(resource) {
  return resource.permalink || `https://yourselftoscience.org/resource/${resource.slug}`;
}

function brief(resource) {
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    organizations: resource.organizations?.map((organization) => organization.name) ?? [],
    dataTypes: resource.dataTypes ?? [],
    compensationType: resource.compensationType ?? 'donation',
    macroCategories: resource.macroCategories ?? [],
    availableIn: availableIn(resource),
    excludedCountries: resource.excludedCountries ?? [],
    entityCategory: resource.entityCategory,
    url: canonicalUrl(resource),
    participationUrl: resource.link,
  };
}

function matchesFilters(resource, args) {
  if (args.country) {
    const requestedCountry = lower(args.country);
    const excluded = (resource.excludedCountries ?? []).map(lower);
    if (excluded.includes(requestedCountry)) return false;
    const availability = availableIn(resource).map(lower);
    if (!availability.includes('worldwide') && !availability.some((country) => country.includes(requestedCountry))) {
      return false;
    }
  }

  if (args.dataType && !(resource.dataTypes ?? []).some((value) => lower(value).includes(lower(args.dataType)))) {
    return false;
  }

  if (args.compensationType && lower(resource.compensationType) !== lower(args.compensationType)) {
    return false;
  }

  if (args.category && !lower(resource.entityCategory).includes(lower(args.category))) {
    return false;
  }

  return true;
}

function score(resource, query) {
  if (!query) return 0;
  const tokens = lower(query).split(/[^a-z0-9+.-]+/).filter(Boolean);
  const title = lower(resource.title);
  const searchable = lower([
    resource.title,
    resource.description,
    ...(resource.dataTypes ?? []),
    ...(resource.organizations?.map((organization) => organization.name) ?? []),
    ...availableIn(resource),
    ...(resource.macroCategories ?? []),
    resource.compensationType,
    resource.entityCategory,
  ].filter(Boolean).join(' '));

  return tokens.reduce((total, token) => {
    if (title === token) return total + 100;
    if (title.includes(token)) return total + 20;
    if (searchable.includes(token)) return total + 4;
    return total;
  }, 0);
}

function textResult(text, structuredContent) {
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

function createTools() {
  return [
    {
      name: 'search_research_opportunities',
      description: 'Search the open Yourself to Science catalogue by free text, country, data type, compensation, or organization category. Returns canonical records and URLs.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text search over titles, descriptions, organizations, countries, and data types.' },
          country: { type: 'string', description: 'Availability country, such as Italy or United States. Worldwide records are also included.' },
          dataType: { type: 'string', description: 'Accepted contribution type, such as Genome, Wearable data, Tissue, or Health data.' },
          compensationType: { type: 'string', enum: ['donation', 'payment', 'mixed'] },
          category: { type: 'string', description: 'Organization category, such as Government, Non-Profit, Commercial, or Academic.' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
        additionalProperties: false,
      },
      async execute(args = {}) {
        const all = await loadDataset();
        const limit = Number.isInteger(args.limit) ? Math.min(Math.max(args.limit, 1), 50) : 20;
        const results = all
          .filter((resource) => matchesFilters(resource, args))
          .map((resource) => ({ resource, score: score(resource, args.query) }))
          .sort((left, right) => right.score - left.score || left.resource.title.localeCompare(right.resource.title))
          .slice(0, limit)
          .map(({ resource }) => brief(resource));

        return textResult(
          results.length
            ? `Found ${results.length} matching catalogue resource${results.length === 1 ? '' : 's'}. Catalogue records do not guarantee eligibility or current enrolment.`
            : 'No matching catalogue resources were found.',
          { count: results.length, results, datasetLicense: 'CC0-1.0' },
        );
      },
    },
    {
      name: 'get_research_opportunity',
      description: 'Return the complete structured Yourself to Science catalogue record for one resource by ID or slug.',
      inputSchema: {
        type: 'object',
        properties: {
          idOrSlug: { type: 'string', description: 'Catalogue resource UUID or canonical slug.' },
        },
        required: ['idOrSlug'],
        additionalProperties: false,
      },
      async execute({ idOrSlug }) {
        const all = await loadDataset();
        const resource = all.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
        if (!resource) return textResult(`No catalogue resource was found for "${idOrSlug}".`, { error: 'not_found', idOrSlug });
        const result = brief(resource);
        return textResult(
          `${result.title}: ${result.description}\nCanonical URL: ${result.url}`,
          { resource: result },
        );
      },
    },
    {
      name: 'get_catalogue_facets',
      description: 'List the data types, countries, compensation types, organization categories, and total records represented in the Yourself to Science catalogue.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      async execute() {
        const all = await loadDataset();
        const countValues = (values) => Object.entries(values.reduce((counts, value) => {
          if (value) counts[value] = (counts[value] ?? 0) + 1;
          return counts;
        }, {})).sort((left, right) => right[1] - left[1]).map(([name, count]) => ({ name, count }));

        const facets = {
          totalResources: all.length,
          dataTypes: countValues(all.flatMap((resource) => resource.dataTypes ?? [])),
          countries: countValues(all.flatMap((resource) => availableIn(resource))),
          compensationTypes: countValues(all.map((resource) => resource.compensationType ?? 'donation')),
          organizationCategories: countValues(all.map((resource) => resource.entityCategory)),
        };

        return textResult(`The catalogue currently contains ${all.length} resources.`, facets);
      },
    },
  ];
}

export default function WebMCPProvider() {
  useEffect(() => {
    const tools = createTools();
    const controller = new AbortController();
    const currentContext = document.modelContext;
    const legacyContext = navigator.modelContext;

    if (currentContext?.registerTool) {
      for (const tool of tools) {
        Promise.resolve(currentContext.registerTool(tool, { signal: controller.signal })).catch(() => {});
      }
    }

    // Compatibility with the earlier WebMCP API still used by some scanners and browsers.
    if (legacyContext?.provideContext) {
      Promise.resolve(legacyContext.provideContext({ tools })).catch(() => {});
    }

    return () => controller.abort();
  }, []);

  return null;
}
