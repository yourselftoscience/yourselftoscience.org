// A map to cache the UUID-to-slug mapping.
let resourceMap = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutes

async function buildResourceMap() {
  const now = Date.now();
  if (resourceMap && now - lastFetchTime < CACHE_DURATION) {
    return;
  }
  try {
    // NOTE: Using a direct path to the production URL.
    const response = await fetch('https://yourselftoscience.org/resources.json');
    if (!response.ok) return;
    const resources = await response.json();
    const newMap = new Map();
    for (const resource of resources) {
      if (resource.id && resource.slug) {
        newMap.set(resource.id, resource.slug);
      }
    }
    resourceMap = newMap;
    lastFetchTime = now;
  } catch (error) {
    console.error('Error building resource map:', error);
  }
}

/**
 * This is the entry point for the Pages Function.
 * It will handle requests to /resource/*
 */
export async function onRequest(context) {
  if (!resourceMap) {
    await buildResourceMap();
  } else {
    context.waitUntil(buildResourceMap());
  }

  const { uuid } = context.params;
  // Ensure uuid is a string before using it
  const slug = resourceMap.get(Array.isArray(uuid) ? uuid[0] : uuid);

  if (slug) {
    const destinationURL = `https://yourselftoscience.org/resource/${slug}`;
    // This 303 redirect is the key.
    return Response.redirect(destinationURL, 303);
  }

  return new Response('Persistent identifier not found.', { status: 404 });
}