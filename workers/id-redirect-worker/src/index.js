// A simple in-memory cache for the resource map
let resourceMap = null;

async function getResourceMap() {
  // Use a simple cache to avoid re-fetching on every call
  if (resourceMap) {
    return resourceMap;
  }
  try {
    const response = await fetch('https://yourselftoscience.org/resources.json');
    if (!response.ok) {
        throw new Error('Failed to fetch resources');
    }
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
    return new Map(); // Return empty map on error to prevent crashes
  }
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const pathParts = pathname.split('/').filter(Boolean);

    // Check for the specific /resource/<uuid> pattern
    if (pathParts.length === 2 && pathParts[0] === 'resource') {
      const uuid = pathParts[1];
      const map = await getResourceMap();
      const slug = map.get(uuid);

      if (slug) {
        const destinationURL = `https://yourselftoscience.org/resource/${slug}`;
        // A 308 redirect is best for permanent moves.
        return Response.redirect(destinationURL, 308);
      }
    }

    // For any other path on id.yourselftoscience.org (like the root),
    // redirect to the main site's homepage to avoid duplicate content.
    return Response.redirect('https://yourselftoscience.org', 301);
  },
};