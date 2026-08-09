import {
  RequestValidationError,
  badRequest,
  json,
  loadResources,
  matches,
  options,
  parseSearchParams,
  serviceUnavailable,
  summarize,
} from '@/lib/agentApi';
export const dynamic = 'force-dynamic';

export function OPTIONS() { return options(); }

export async function GET(request) {
  try {
    const filters = parseSearchParams(new URL(request.url).searchParams);
    const resources = (await loadResources()).filter(resource => matches(resource, filters));
    const page = resources.slice(filters.offset, filters.offset + filters.limit);
    const items = filters.view === 'full' ? page : page.map(summarize);
    const nextOffset = filters.offset + filters.limit < resources.length
      ? filters.offset + filters.limit
      : null;

    return json({
      data: items,
      meta: {
        total: resources.length,
        count: items.length,
        limit: filters.limit,
        offset: filters.offset,
        nextOffset,
        schemaVersion: '1.0.0',
        source: 'https://yourselftoscience.org/resources.json',
      },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) return badRequest(error);
    return serviceUnavailable(error, 'resource search failed');
  }
}
