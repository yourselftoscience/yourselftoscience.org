import { json, loadResources, options, serviceUnavailable } from '@/lib/agentApi';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export function OPTIONS() { return options(); }

function countBy(resources, selector) {
  const counts = new Map();
  for (const resource of resources) {
    const raw = selector(resource);
    const selectedValues = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
    for (const value of selectedValues) {
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
        countries: countBy(resources, resource => resource.countries),
        dataTypes: countBy(resources, resource => resource.dataTypes),
        compensationTypes: countBy(resources, resource => resource.compensationType),
        entityCategories: countBy(resources, resource => resource.entityCategory),
        recruitingStatus: countBy(
          resources,
          resource => resource.isActivelyRecruiting == null ? 'unknown' : String(resource.isActivelyRecruiting),
        ),
      },
      meta: { totalResources: resources.length, schemaVersion: '1.0.0' },
    });
  } catch (error) {
    return serviceUnavailable(error, 'facet generation failed');
  }
}
