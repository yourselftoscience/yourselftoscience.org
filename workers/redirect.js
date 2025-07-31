let resourceMap = null;

async function getResourceMap() {
  if (resourceMap) return resourceMap;
  try {
    const response = await fetch('https://yourselftoscience.org/resources.json');
    if (!response.ok) throw new Error(`Failed to fetch resources: ${response.statusText}`);
    const resources = await response.json();
    const newMap = new Map();
    for (const resource of resources) {
      if (resource.id && resource.slug) {
        newMap.set(resource.id, resource.slug);
      }
    }
    resourceMap = newMap;
    return resourceMap;
  } catch (error) {
    console.error('Error building resource map:', error);
    return new Map();
  }
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const pathParts = pathname.split('/').filter(Boolean);

    // If the URL matches /resource/<uuid>
    if (pathParts.length === 2 && pathParts[0] === 'resource') {
      const uuid = pathParts[1];
      const map = await getResourceMap();
      const slug = map.get(uuid);
      if (slug) {
        const destinationURL = `https://yourselftoscience.org/resource/${slug}`;
        return Response.redirect(destinationURL, 308);
      }
    }
    // Fallback in case no match is found.
    return Response.redirect('https://yourselftoscience.org', 301);
  },
};