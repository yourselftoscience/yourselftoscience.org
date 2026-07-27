import { enrichedResourcesWithMacro as resources } from '@/data/resources';
import {
  compactResource,
  findCatalogueResource,
  searchCatalogue,
} from '@/lib/catalogueAgent';

export const runtime = 'edge';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'no-store',
  'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
};

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
    const resource = findCatalogueResource(resources, input.idOrSlug);

    if (!resource) {
      return jsonRpcResult(
        body.id,
        responseMessage(`No catalogue resource was found for "${input.idOrSlug}".`, {
          error: 'not_found',
          idOrSlug: input.idOrSlug,
        }),
      );
    }

    const result = compactResource(resource);
    return jsonRpcResult(
      body.id,
      responseMessage(
        `${result.title}: ${result.description}\n\nAvailability: ${result.availableIn.join(', ')}\nData types: ${result.dataTypes.join(', ')}\nCompensation: ${result.compensationType}\nCanonical URL: ${result.url}`,
        { resource: result },
      ),
    );
  }

  const results = searchCatalogue(resources, input);
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
