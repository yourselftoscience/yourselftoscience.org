import { clampInt, json, loadResources, matches, options, summarize } from '@/lib/agentApi';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export function OPTIONS() { return options(); }

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = clampInt(url.searchParams.get('limit'), 25, 1, 100);
    const offset = clampInt(url.searchParams.get('offset'), 0, 0, 1000000);
    const fields = url.searchParams.get('view') === 'full' ? 'full' : 'summary';
    const resources = (await loadResources()).filter(resource => matches(resource, url.searchParams));
    const page = resources.slice(offset, offset + limit);
    const items = fields === 'full' ? page : page.map(summarize);
    const nextOffset = offset + limit < resources.length ? offset + limit : null;

    return json({
      data: items,
      meta: {
        total: resources.length,
        count: items.length,
        limit,
        offset,
        nextOffset,
        schemaVersion: '1.0.0',
        source: 'https://yourselftoscience.org/resources.json',
      },
    });
  } catch (error) {
    return json({ error: 'dataset_unavailable', message: error.message }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
