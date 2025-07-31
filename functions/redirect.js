// functions/redirect.js

// A map to cache the UUID-to-slug mapping.
let resourceMap = null;
let lastFetchTime = 0;

// Cache the mapping for 5 minutes (300,000 milliseconds) to avoid refetching on every request.
const CACHE_DURATION = 300000; 

/**
 * Fetches the resources.json file and builds the UUID -> slug map.
 * The result is cached in memory to improve performance.
 */
async function buildResourceMap() {
  const now = Date.now();
  // If the cache is recent enough, do nothing.
  if (resourceMap && (now - lastFetchTime < CACHE_DURATION)) {
    return;
  }

  try {
    // Fetch the JSON file containing all resource data.
    const response = await fetch('https://yourselftoscience.org/resources.json');
    if (!response.ok) {
      console.error('Failed to fetch resources.json:', response.statusText);
      // If fetching fails but we have a stale cache, we'll keep using it for now.
      return;
    }
    const resources = await response.json();

    // Create a new Map for efficient lookups.
    const newMap = new Map();
    for (const resource of resources) {
      if (resource.id && resource.slug) {
        newMap.set(resource.id, resource.slug);
      }
    }

    // Atomically update the map and timestamp.
    resourceMap = newMap;
    lastFetchTime = now;
    console.log(`Successfully built resource map with ${resourceMap.size} entries.`);

  } catch (error) {
    console.error('Error building resource map:', error);
    // In case of an error, we keep the old map if it exists.
  }
}

export default {
  /**
   * The main fetch handler for the Cloudflare Worker.
   * @param {Request} request - The incoming request.
   * @param {Env} env - The environment variables.
   * @param {ExecutionContext} ctx - The execution context.
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    // We build/update the map in the background, without blocking the request.
    // The `waitUntil` ensures this task completes even if the response is sent.
    ctx.waitUntil(buildResourceMap());

    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean); // e.g., ['resource', 'UUID']

    // Check if the path matches the expected format: /resource/<uuid>
    if (pathSegments.length === 2 && pathSegments[0] === 'resource' && resourceMap) {
      const uuid = pathSegments[1];
      const slug = resourceMap.get(uuid);

      if (slug) {
        // If a slug is found, perform a 303 "See Other" redirect.
        const destinationURL = `https://yourselftoscience.org/resource/${slug}`;
        return Response.redirect(destinationURL, 303);
      }
    }

    // If the UUID is not found or the path is incorrect, return a 404 Not Found response.
    return new Response('Persistent identifier not found.', { status: 404 });
  },
}; 