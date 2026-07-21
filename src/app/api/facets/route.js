import { json, loadResources, options } from '@/lib/agentApi';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export function OPTIONS() { return options(); }

function countBy(resources, selector) {
  const counts = new Map();
  for (const resource of resources) {
    const raw = selector(resource);
    const values = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
    for (const value of values) {
      const label = String(value).trim();
      if (label) counts.set(label, (counts.get(label) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export async function GET() {
  try {
    const resources = await loadResources();
    return json({
      data: {
        countries: countBy(resources, r => r.countries),
        dataTypes: countBy(resources, r => r.dataTypes),
        compensationTypes: countBy(resources, r => r.compensationType),
        entityCategories: countBy(resources, r => r.entityCategory),
        recruitingStatus: countBy(resources, r => r.isActivelyRecruiting == null ? 'unknown' : String(r.isActivelyRecruiting)),
      },
      meta: { totalResources: resources.length, schemaVersion: '1.0.0' },
    });
  } catch (error) {
    return json({ error: 'dataset_unavailable', message: error.message }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
