const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'can', 'do', 'find', 'for', 'i', 'in', 'is', 'me',
  'my', 'of', 'on', 'opportunities', 'opportunity', 'or', 'please', 'program',
  'programs', 'project', 'projects', 'research', 'show', 'study', 'the', 'to',
  'want', 'what', 'where', 'which', 'with',
]);

const lower = (value) => String(value ?? '').toLowerCase();

export function availableIn(resource) {
  const values = resource.countries ?? resource.locations ?? [];
  return values.length ? values : ['Worldwide'];
}

export function canonicalResourceUrl(resource) {
  return resource.permalink || `https://yourselftoscience.org/resource/${resource.slug}`;
}

export function compactResource(resource) {
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
    url: canonicalResourceUrl(resource),
    participationUrl: resource.link,
  };
}

function matchesOptionalText(values, requestedValue) {
  if (!requestedValue) return true;
  const requested = lower(requestedValue);
  return values.some((value) => lower(value).includes(requested));
}

function matchesCountry(resource, requestedCountry) {
  if (!requestedCountry) return true;

  const country = lower(requestedCountry);
  const excluded = (resource.excludedCountries ?? []).map(lower);
  if (excluded.includes(country)) return false;

  const availability = availableIn(resource).map(lower);
  return availability.includes('worldwide')
    || availability.some((value) => value.includes(country));
}

function matchesCompensation(resource, requestedType) {
  return !requestedType
    || lower(resource.compensationType) === lower(requestedType);
}

function matchesFilters(resource, input) {
  return matchesCountry(resource, input.country)
    && matchesOptionalText(resource.dataTypes ?? [], input.dataType)
    && matchesCompensation(resource, input.compensationType)
    && matchesOptionalText([resource.entityCategory], input.category)
    && matchesOptionalText(resource.macroCategories ?? [], input.macroCategory);
}

function scoreToken(title, searchable, token) {
  if (title === token) return 100;
  if (title.includes(token)) return 20;
  return searchable.includes(token) ? 4 : 0;
}

function scoreResource(resource, query) {
  if (!query) return 0;

  const tokens = lower(query)
    .split(/[^a-z0-9+.-]+/)
    .filter((token) => token && !STOP_WORDS.has(token));
  const title = lower(resource.title);
  const searchable = lower([
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

  return tokens.reduce(
    (score, token) => score + scoreToken(title, searchable, token),
    0,
  );
}

export function searchCatalogue(resources, input = {}) {
  const limit = Number.isInteger(input.limit)
    ? Math.min(Math.max(input.limit, 1), 50)
    : 20;

  return resources
    .filter((resource) => matchesFilters(resource, input))
    .map((resource) => ({ resource, score: scoreResource(resource, input.query) }))
    .sort((left, right) => right.score - left.score || left.resource.title.localeCompare(right.resource.title))
    .slice(0, limit)
    .map(({ resource }) => compactResource(resource));
}

export function findCatalogueResource(resources, idOrSlug) {
  return resources.find((resource) => resource.id === idOrSlug || resource.slug === idOrSlug);
}

function countValues(values) {
  const counts = values.reduce((result, value) => {
    if (value) result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .map(([name, count]) => ({ name, count }));
}

export function buildCatalogueFacets(resources) {
  return {
    totalResources: resources.length,
    dataTypes: countValues(resources.flatMap((resource) => resource.dataTypes ?? [])),
    countries: countValues(resources.flatMap((resource) => availableIn(resource))),
    compensationTypes: countValues(resources.map((resource) => resource.compensationType ?? 'donation')),
    organizationCategories: countValues(resources.map((resource) => resource.entityCategory)),
  };
}
