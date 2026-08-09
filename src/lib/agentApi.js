const DATA_URL = 'https://yourselftoscience.org/resources.json';
const DATA_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_QUERY_LENGTH = 256;
const MAX_FILTER_LENGTH = 128;
const MAX_LOOKUP_KEY_LENGTH = 160;

let cachedResources = null;
let cacheExpiresAt = 0;
let inFlightResourceRequest = null;
const searchTextCache = new WeakMap();

export const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Accept',
  'access-control-max-age': '86400',
  'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
};

export class RequestValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestValidationError';
  }
}

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...jsonHeaders, ...(init.headers || {}) },
  });
}

export function options() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

export function badRequest(error) {
  return json(
    { error: 'invalid_request', message: error.message },
    { status: 400, headers: { 'cache-control': 'no-store' } },
  );
}

export function logInternalError(context, error) {
  console.error(`[agent-api] ${context}`, error);
}

export function serviceUnavailable(error, context = 'request failed') {
  logInternalError(context, error);
  return json(
    { error: 'dataset_unavailable', message: 'The catalogue is temporarily unavailable.' },
    { status: 503, headers: { 'cache-control': 'no-store' } },
  );
}

async function fetchResources() {
  const response = await fetch(DATA_URL, {
    headers: { accept: 'application/json' },
    cf: { cacheEverything: true, cacheTtl: 300 },
  });
  if (!response.ok) throw new Error(`Dataset request failed with ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Dataset is not an array');
  cachedResources = data;
  cacheExpiresAt = Date.now() + DATA_CACHE_TTL_MS;
  return data;
}

export async function loadResources() {
  if (cachedResources && Date.now() < cacheExpiresAt) return cachedResources;
  if (!inFlightResourceRequest) {
    inFlightResourceRequest = fetchResources().finally(() => {
      inFlightResourceRequest = null;
    });
  }
  return inFlightResourceRequest;
}

const values = value => Array.isArray(value) ? value : value == null ? [] : [value];
const norm = value => String(value ?? '').trim().toLowerCase();
const containsControlCharacters = value => /[\u0000-\u001F\u007F]/u.test(value);

function getSingleParameter(params, name) {
  const allValues = params.getAll(name);
  if (allValues.length > 1) throw new RequestValidationError(`${name} must be provided at most once.`);
  return allValues.length === 1 ? allValues[0] : null;
}

function parseTextParameter(params, name, maxLength) {
  const value = getSingleParameter(params, name);
  if (value === null) return '';
  if (value.length > maxLength) throw new RequestValidationError(`${name} must be at most ${maxLength} characters.`);
  if (containsControlCharacters(value)) throw new RequestValidationError(`${name} contains invalid control characters.`);
  return value.trim();
}

function parseBooleanParameter(params, name) {
  const value = getSingleParameter(params, name);
  if (value === null) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new RequestValidationError(`${name} must be true or false.`);
}

function parseIntegerParameter(params, name, fallback, min, max) {
  const value = getSingleParameter(params, name);
  if (value === null) return fallback;
  if (!/^(0|[1-9]\d*)$/u.test(value)) throw new RequestValidationError(`${name} must be an integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new RequestValidationError(`${name} must be between ${min} and ${max}.`);
  }
  return parsed;
}

export function parseSearchParams(params) {
  const view = parseTextParameter(params, 'view', 16) || 'summary';
  if (view !== 'summary' && view !== 'full') {
    throw new RequestValidationError('view must be summary or full.');
  }

  return {
    q: parseTextParameter(params, 'q', MAX_QUERY_LENGTH),
    country: parseTextParameter(params, 'country', MAX_FILTER_LENGTH),
    dataType: parseTextParameter(params, 'dataType', MAX_FILTER_LENGTH),
    compensation: parseTextParameter(params, 'compensation', MAX_FILTER_LENGTH),
    category: parseTextParameter(params, 'category', MAX_FILTER_LENGTH),
    activelyRecruiting: parseBooleanParameter(params, 'activelyRecruiting'),
    openData: parseBooleanParameter(params, 'openData'),
    hasApi: parseBooleanParameter(params, 'hasApi'),
    limit: parseIntegerParameter(params, 'limit', 25, 1, 100),
    offset: parseIntegerParameter(params, 'offset', 0, 0, 1000000),
    view,
  };
}

export function parseLookupKey(rawValue) {
  const value = String(rawValue ?? '').trim();
  if (!value) throw new RequestValidationError('id is required.');
  if (value.length > MAX_LOOKUP_KEY_LENGTH) {
    throw new RequestValidationError(`id must be at most ${MAX_LOOKUP_KEY_LENGTH} characters.`);
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._~-]*$/u.test(value)) {
    throw new RequestValidationError('id contains invalid characters.');
  }
  return value.toLowerCase();
}

function getSearchText(resource) {
  const cached = searchTextCache.get(resource);
  if (cached) return cached;
  const searchable = {
    title: resource.title,
    displayTitle: resource.displayTitle,
    description: resource.description,
    link: resource.link,
    origin: resource.origin,
    originCode: resource.originCode,
    dataTypes: resource.dataTypes,
    countries: resource.countries,
    excludedCountries: resource.excludedCountries,
    locations: resource.locations,
    compensationType: resource.compensationType,
    entityCategory: resource.entityCategory,
    entitySubType: resource.entitySubType,
    compatibleSources: resource.compatibleSources,
    organizations: resource.organizations,
    citations: resource.citations,
    instructions: resource.instructions,
    macroCategories: resource.macroCategories,
  };
  const text = JSON.stringify(searchable).toLowerCase();
  searchTextCache.set(resource, text);
  return text;
}

export function matches(resource, filters) {
  const q = norm(filters.q);
  const country = norm(filters.country);
  const dataType = norm(filters.dataType);
  const compensation = norm(filters.compensation);
  const category = norm(filters.category);

  if (q && !getSearchText(resource).includes(q)) return false;
  if (country && !values(resource.countries).some(v => norm(v) === country)) return false;
  if (dataType && !values(resource.dataTypes).some(v => norm(v) === dataType)) return false;
  if (compensation && norm(resource.compensationType) !== compensation) return false;
  if (category && norm(resource.entityCategory) !== category) return false;
  if (filters.activelyRecruiting !== null && resource.isActivelyRecruiting !== filters.activelyRecruiting) return false;
  if (filters.openData !== null && resource.isOpenData !== filters.openData) return false;
  if (filters.hasApi !== null && resource.hasApi !== filters.hasApi) return false;
  return true;
}

export function summarize(resource) {
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    link: resource.link,
    permalink: resource.permalink || (resource.id ? `https://yourselftoscience.org/resource/${resource.id}` : null),
    countries: resource.countries || [],
    dataTypes: resource.dataTypes || [],
    compensationType: resource.compensationType ?? null,
    isActivelyRecruiting: resource.isActivelyRecruiting ?? null,
    hasApi: resource.hasApi ?? null,
    isOpenData: resource.isOpenData ?? null,
  };
}
