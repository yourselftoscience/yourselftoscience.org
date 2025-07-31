// File: src/app/api/resource/[uuid]/route.js

export const runtime = 'edge';

// A simple in-memory cache for the resource map
let resourceMap = null;

async function getResourceMap() {
  // Use a simple cache to avoid re-fetching on every call
  if (resourceMap) {
    return resourceMap;
  }

  try {
    const response = await fetch('https://yourselftoscience.org/resources.json', {
      // Revalidate the data every 5 minutes
      next: { revalidate: 300 },
    });
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
    // Return an empty map on error to prevent crashes
    return new Map();
  }
}

export async function GET(request, { params }) {
  // Ensure the request is coming to the id.yourselftoscience.org host
  const host = request.headers.get('host');
  if (host !== 'id.yourselftoscience.org') {
    return new Response('This endpoint is only for the id.yourselftoscience.org domain.', { status: 404 });
  }

  const map = await getResourceMap();
  const slug = map.get(params.uuid);

  if (slug) {
    const destinationURL = `https://yourselftoscience.org/resource/${slug}`;
    // Use a 308 redirect, which is better for permanently moved resources
    return Response.redirect(destinationURL, 308);
  }

  return new Response('Persistent identifier not found.', { status: 404 });
}
