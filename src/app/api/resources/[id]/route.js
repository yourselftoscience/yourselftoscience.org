import {
  RequestValidationError,
  badRequest,
  json,
  loadResources,
  options,
  parseLookupKey,
  serviceUnavailable,
} from '@/lib/agentApi';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export function OPTIONS() { return options(); }

export async function GET(_request, { params }) {
  try {
    const key = parseLookupKey(params.id);
    const resource = (await loadResources()).find(item =>
      String(item.id || '').toLowerCase() === key || String(item.slug || '').toLowerCase() === key
    );
    if (!resource) return json({ error: 'not_found', message: 'Resource not found.' }, { status: 404 });
    return json({ data: resource, meta: { schemaVersion: '1.0.0' } });
  } catch (error) {
    if (error instanceof RequestValidationError) return badRequest(error);
    return serviceUnavailable(error, 'resource lookup failed');
  }
}
