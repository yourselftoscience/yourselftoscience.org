const DATA_URL = 'https://yourselftoscience.org/resources.json';

export const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Accept',
  'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
};

export function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: { ...jsonHeaders, ...(init.headers || {}) },
  });
}

export function options() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

export async function loadResources() {
  const response = await fetch(DATA_URL, {
    headers: { accept: 'application/json' },
    cf: { cacheEverything: true, cacheTtl: 300 },
  });
  if (!response.ok) throw new Error(`Dataset request failed with ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Dataset is not an array');
  return data;
}

const values = value => Array.isArray(value) ? value : value == null ? [] : [value];
const norm = value => String(value ?? '').trim().toLowerCase();

export function matches(resource, params) {
  const q = norm(params.get('q'));
  const country = norm(params.get('country'));
  const dataType = norm(params.get('dataType'));
  const compensation = norm(params.get('compensation'));
  const category = norm(params.get('category'));
  const recruiting = params.get('activelyRecruiting');
  const openData = params.get('openData');
  const hasApi = params.get('hasApi');

  if (q) {
    const haystack = JSON.stringify(resource).toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (country && !values(resource.countries).some(v => norm(v) === country)) return false;
  if (dataType && !values(resource.dataTypes).some(v => norm(v) === dataType)) return false;
  if (compensation && norm(resource.compensationType) !== compensation) return false;
  if (category && norm(resource.entityCategory) !== category) return false;
  if (recruiting !== null && String(Boolean(resource.isActivelyRecruiting)) !== recruiting) return false;
  if (openData !== null && String(Boolean(resource.isOpenData)) !== openData) return false;
  if (hasApi !== null && String(Boolean(resource.hasApi)) !== hasApi) return false;
  return true;
}

export function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export function summarize(resource) {
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    link: resource.link,
    permalink: resource.permalink || (resource.slug ? `https://yourselftoscience.org/resource/${resource.slug}` : null),
    countries: resource.countries || [],
    dataTypes: resource.dataTypes || [],
    compensationType: resource.compensationType ?? null,
    isActivelyRecruiting: resource.isActivelyRecruiting ?? null,
    hasApi: resource.hasApi ?? null,
    isOpenData: resource.isOpenData ?? null,
  };
}
