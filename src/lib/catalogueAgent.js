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

function matchesFilters(resource, input) {
  if (input.country) {
    const country = lower(input.country);
    const excluded = (resource.excludedCountries ?? []).map(lower);
    if (excluded.includes(country)) return false;

    const availability = availableIn(resource).map(lower);
    if (!availability.includes('worldwide') && !availability.some((value) => value.includes(country))) {
      return false;
    }
  }

  if (input.dataType) {
    const dataType = lower(input.dataType);
    if (!(resource.dataTypes ?? []).some((value) => lower(value).includes(dataType))) return false;
  }

  if (input.compensationType && lower(resource.compensationType) !== lower(input.compensationType)) {
    return false;
  }

  if (input.category && !lower(resource.entityCategory).includes(lower(input.category))) {
    return false;
  }

  if (input.macroCategory) {
    const macroCategory = lower(input.macroCategory);
    if (!(resource.macroCategories ?? []).some((value) => lower(value).includes(macroCategory))) return false;
  }

  return true;
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

  return tokens.reduce((score, token) => {
    if (title === token) return score + 100;
    if (title.includes(token)) return score + 20;
    if (searchable.includes(token)) return score + 4;
    return score;
  }, 0);
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
