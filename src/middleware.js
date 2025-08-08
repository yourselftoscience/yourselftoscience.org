export const runtime = 'experimental-edge';

// src/middleware.js
import { NextResponse } from 'next/server';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Simple in-memory cache for id->slug
let resourceMapCache = null;
let resourceMapLastFetchMs = 0;
const RESOURCE_MAP_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getResourceMap() {
  const now = Date.now();
  if (resourceMapCache && now - resourceMapLastFetchMs < RESOURCE_MAP_TTL_MS) {
    return resourceMapCache;
  }
  try {
    const resp = await fetch('https://yourselftoscience.org/resources.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error('Failed to fetch resources.json');
    const list = await resp.json();
    const map = new Map();
    for (const r of list) {
      if (r.id && r.slug) map.set(r.id, r.slug);
    }
    resourceMapCache = map;
    resourceMapLastFetchMs = now;
    return resourceMapCache;
  } catch (_e) {
    // On error, return previous cache if any, otherwise empty map
    return resourceMapCache || new Map();
  }
}

export async function middleware(request) {
  const host = request.headers.get('host');
  const pathname = request.nextUrl.pathname;

  // 1) Handle the id.yourselftoscience.org subdomain
  if (host === 'id.yourselftoscience.org') {
    // Allow the API route to perform UUID->slug redirect lookups
    if (pathname.startsWith('/api/resource/')) {
      return NextResponse.next();
    }

    // If the request is for a specific resource UUID, redirect to canonical slug on main domain
    if (pathname.startsWith('/resource/')) {
      const parts = pathname.split('/');
      const idCandidate = parts[2] || '';
      if (UUID_REGEX.test(idCandidate)) {
        const map = await getResourceMap();
        const slug = map.get(idCandidate);
        if (slug) {
          return NextResponse.redirect(new URL(`/resource/${slug}`, 'https://yourselftoscience.org'), 308);
        }
      }
      // If it's not a UUID or not found, fall through to main domain root
      return NextResponse.redirect(new URL('/', 'https://yourselftoscience.org'), 308);
    }

    // Redirect all other paths on id.* to the main domain root to avoid mirroring
    return NextResponse.redirect(new URL('/', 'https://yourselftoscience.org'), 308);
  }

  // 2) On the main domain, redirect /resource/<uuid> to /resource/<slug>
  if (pathname.startsWith('/resource/')) {
    const parts = pathname.split('/');
    const idOrSlug = parts[2] || '';
    if (UUID_REGEX.test(idOrSlug)) {
      const map = await getResourceMap();
      const slug = map.get(idOrSlug);
      if (slug) {
        // Preserve the current host in case of custom domains/aliases
        return NextResponse.redirect(new URL(`/resource/${slug}`, `https://${host}`), 308);
      }
    }
  }

  // Default: allow request
  return NextResponse.next();
}

// Apply to all paths
export const config = {
  matcher: '/:path*',
};
