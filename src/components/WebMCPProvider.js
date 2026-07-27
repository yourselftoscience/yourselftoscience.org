'use client';

import { useEffect } from 'react';
import {
  buildCatalogueFacets,
  compactResource,
  findCatalogueResource,
  searchCatalogue,
} from '@/lib/catalogueAgent';

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

function textResult(text, structuredContent) {
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

function reportExperimentalApiFailure(apiName, error) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`${apiName} registration was not accepted by this browser.`, error);
  }
}

function registerCurrentWebMcpTools(context, tools, signal) {
  for (const tool of tools) {
    try {
      Promise.resolve(context.registerTool(tool, { signal })).catch((error) => {
        reportExperimentalApiFailure('WebMCP', error);
      });
    } catch (error) {
      reportExperimentalApiFailure('WebMCP', error);
    }
  }
}

function registerLegacyWebMcpTools(context, tools) {
  try {
    Promise.resolve(context.provideContext({ tools })).catch((error) => {
      reportExperimentalApiFailure('Legacy WebMCP', error);
    });
  } catch (error) {
    reportExperimentalApiFailure('Legacy WebMCP', error);
  }
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
          macroCategory: { type: 'string', description: 'Top-level catalogue grouping.' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
        additionalProperties: false,
      },
      async execute(args = {}) {
        const all = await loadDataset();
        const results = searchCatalogue(all, args);

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
      async execute({ idOrSlug } = {}) {
        const all = await loadDataset();
        const resource = findCatalogueResource(all, idOrSlug);
        if (!resource) return textResult(`No catalogue resource was found for "${idOrSlug}".`, { error: 'not_found', idOrSlug });
        const result = compactResource(resource);
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
        const facets = buildCatalogueFacets(all);
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
      registerCurrentWebMcpTools(currentContext, tools, controller.signal);
    }

    // Compatibility with the earlier WebMCP API still used by some scanners and browsers.
    if (legacyContext?.provideContext) {
      registerLegacyWebMcpTools(legacyContext, tools);
    }

    return () => controller.abort();
  }, []);

  return null;
}
