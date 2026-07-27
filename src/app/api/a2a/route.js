import { enrichedResourcesWithMacro as resources } from '@/data/resources';

export const runtime = 'edge';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'no-store',
  'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'can', 'do', 'find', 'for', 'i', 'in', 'is', 'me',
  'my', 'of', 'on', 'opportunities', 'opportunity', 'or', 'please', 'program',
  'programs', 'project', 'projects', 'research', 'show', 'study', 'the', 'to',
  'want', 'what', 'where', 'which', 'with',
]);

const lower = (value) => String(value ?? '').toLowerCase();

function availableIn(resource) {
  const values = resource.countries ?? resource.locations ?? [];
  return values.length ? values : ['Worldwide'];
}

function canonicalUrl(resource) {
  return resource.permalink || `https://yourselftoscience.org/resource/${resource.slug}`;
}

function compact(resource) {
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

function extractInput(message) {
  const parts = Array.isArray(message?.parts) ? message.parts : [];
  const text = parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join(' ')
    .trim();

  const structured = parts.reduce((result, part) => {
    if (part?.data && typeof part.data === 'object' && !Array.isArray(part.data)) {
      return { ...result, ...part.data };
    }
    return result;
  }, {});

  return {
    query: structured.query || text,
    idOrSlug: structured.idOrSlug || structured.id || structured.slug,
    country: structured.country,
    dataType: structured.dataType,
    compensationType: structured.compensationType,
    category: structured.category,
    macroCategory: structured.macroCategory,
    limit: Number.isInteger(structured.limit)
      ? Math.min(Math.max(structured.limit, 1), 50)
      : 10,
  };
}

function scoreResource(resource, input) {
  let score = 0;
  const queryTokens = lower(input.query)
    .split(/[^a-z0-9+.-]+/)
    .filter((token) => token && !STOP_WORDS.has(token));

  const title = lower(resource.title);
  const haystack = lower([
    resource.title,
    resource.description,
    ...(resource.dataTypes ?? []),
    ...(resource.organizations?.map((organization) => organization.name) ?? []),
    ...availableIn(resource),
    ...(resource.macroCategories ?? []),
    resource.compensationType,
    resource.entityCategory,
    resource.entitySubType,
  ].filter(Boolean).join(' '));

  for (const token of queryTokens) {
    if (title === token) score += 100;
    if (title.includes(token)) score += 20;
    if (haystack.includes(token)) score += 4;
  }

  if (input.country) {
    const country = lower(input.country);
    const excluded = (resource.excludedCountries ?? []).map(lower);
    if (excluded.includes(country)) return -1;
    const availability = availableIn(resource).map(lower);
    if (availability.some((value) => value.includes(country))) score += 30;
    else if (availability.includes('worldwide')) score += 15;
    else return -1;
  }

  if (input.dataType) {
    const wanted = lower(input.dataType);
    if ((resource.dataTypes ?? []).some((value) => lower(value).includes(wanted))) score += 25;
    else return -1;
  }

  if (input.compensationType) {
    if (lower(resource.compensationType) === lower(input.compensationType)) score += 25;
    else return -1;
  }

  if (input.category) {
    if (lower(resource.entityCategory).includes(lower(input.category))) score += 20;
    else return -1;
  }

  if (input.macroCategory) {
    const wanted = lower(input.macroCategory);
    if ((resource.macroCategories ?? []).some((value) => lower(value).includes(wanted))) score += 20;
    else return -1;
  }

  return score;
}

function searchResources(input) {
  return resources
    .map((resource) => ({ resource, score: scoreResource(resource, input) }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => right.score - left.score || left.resource.title.localeCompare(right.resource.title))
    .slice(0, input.limit)
    .map(({ resource }) => compact(resource));
}

function responseMessage(text, data) {
  const parts = [{ text }];
  if (data !== undefined) parts.push({ data, mediaType: 'application/json' });

  return {
    message: {
      messageId: crypto.randomUUID(),
      role: 'ROLE_AGENT',
      parts,
    },
  };
}

function jsonRpcResult(id, result, status = 200) {
  return Response.json(
    { jsonrpc: '2.0', id: id ?? null, result },
    { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  );
}

function jsonRpcError(id, code, message, data, status = 400) {
  return Response.json(
    {
      jsonrpc: '2.0',
      id: id ?? null,
      error: { code, message, ...(data === undefined ? {} : { data }) },
    },
    { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function HEAD() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

export function GET() {
  return Response.json(
    {
      name: 'Yourself to Science Catalogue Agent',
      protocol: 'A2A',
      protocolVersion: '1.0',
      binding: 'JSONRPC',
      agentCard: 'https://yourselftoscience.org/.well-known/agent-card.json',
      method: 'SendMessage',
      authenticationRequired: false,
    },
    { status: 200, headers: CORS_HEADERS },
  );
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRpcError(null, -32700, 'Parse error', undefined, 400);
  }

  if (body?.jsonrpc !== '2.0') {
    return jsonRpcError(body?.id, -32600, 'Invalid Request', 'jsonrpc must be "2.0"', 400);
  }

  // SendMessage is the A2A 1.0 JSON-RPC method. The legacy alias remains
  // accepted for older clients during the protocol transition.
  if (!['SendMessage', 'message/send'].includes(body.method)) {
    return jsonRpcError(body.id, -32601, 'Method not found', {
      supportedMethods: ['SendMessage'],
    }, 404);
  }

  const message = body.params?.message;
  if (!message || !Array.isArray(message.parts) || message.parts.length === 0) {
    return jsonRpcError(body.id, -32602, 'Invalid params', 'params.message.parts is required', 400);
  }

  const input = extractInput(message);

  if (input.idOrSlug) {
    const resource = resources.find(
      (item) => item.id === input.idOrSlug || item.slug === input.idOrSlug,
    );

    if (!resource) {
      return jsonRpcResult(
        body.id,
        responseMessage(`No catalogue resource was found for "${input.idOrSlug}".`, {
          error: 'not_found',
          idOrSlug: input.idOrSlug,
        }),
      );
    }

    const result = compact(resource);
    return jsonRpcResult(
      body.id,
      responseMessage(
        `${result.title}: ${result.description}\n\nAvailability: ${result.availableIn.join(', ')}\nData types: ${result.dataTypes.join(', ')}\nCompensation: ${result.compensationType}\nCanonical URL: ${result.url}`,
        { resource: result },
      ),
    );
  }

  const results = searchResources(input);
  const summary = results.length
    ? `Found ${results.length} matching Yourself to Science catalogue resource${results.length === 1 ? '' : 's'}. Catalogue records describe programmes but do not guarantee eligibility or current enrolment.\n\n${results.map((result, index) => `${index + 1}. ${result.title} — ${result.url}`).join('\n')}`
    : 'No matching catalogue resources were found. Try a broader query or remove one of the filters.';

  return jsonRpcResult(
    body.id,
    responseMessage(summary, {
      count: results.length,
      query: input.query || null,
      filters: {
        country: input.country || null,
        dataType: input.dataType || null,
        compensationType: input.compensationType || null,
        category: input.category || null,
        macroCategory: input.macroCategory || null,
      },
      results,
      datasetLicense: 'CC0-1.0',
    }),
  );
}
