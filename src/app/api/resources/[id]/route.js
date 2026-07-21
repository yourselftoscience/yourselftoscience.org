import { json, loadResources, options } from '@/lib/agentApi';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export function OPTIONS() { return options(); }

export async function GET(_request, { params }) {
  try {
    const key = decodeURIComponent(params.id).toLowerCase();
    const resource = (await loadResources()).find(item =>
      String(item.id || '').toLowerCase() === key || String(item.slug || '').toLowerCase() === key
    );
    if (!resource) return json({ error: 'not_found', message: 'Resource not found.' }, { status: 404 });
    return json({ data: resource, meta: { schemaVersion: '1.0.0' } });
  } catch (error) {
    return json({ error: 'dataset_unavailable', message: error.message }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
