// export const runtime = 'experimental-edge';

// src/middleware.js
import { NextResponse } from 'next/server';
import { resources } from '@/data/resources';

// Accept hyphenated 36-char IDs with letters & digits to support non-hex UUID-style IDs
const UUID_REGEX = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/;

// Build an in-process id -> slug map at edge init time (no network calls)
const ID_TO_SLUG = (() => {
  const map = new Map();
  for (const resource of resources) {
    if (resource.id && resource.slug) map.set(resource.id, resource.slug);
  }
  return map;
})();

function noStoreRedirect(url, status = 308) {
  const response = NextResponse.redirect(url, status);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Vary', 'x-nextjs-data');
  return response;
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
        const slug = ID_TO_SLUG.get(idCandidate);
        if (slug) {
          return noStoreRedirect(new URL(`/resource/${slug}`, 'https://yourselftoscience.org'));
        }
      }
      // If it's not a UUID or not found, fall through to main domain root
      return noStoreRedirect(new URL('/', 'https://yourselftoscience.org'));
    }

    // Redirect all other paths on id.* to the main domain root to avoid mirroring
    return noStoreRedirect(new URL('/', 'https://yourselftoscience.org'));
  }

  // 2) On the main domain, redirect /resource/<uuid> to /resource/<slug>
  if (pathname.startsWith('/resource/')) {
    const parts = pathname.split('/');
    const idOrSlug = parts[2] || '';
    if (UUID_REGEX.test(idOrSlug)) {
      const slug = ID_TO_SLUG.get(idOrSlug);
      if (slug) {
        // Preserve the current host in case of custom domains/aliases
        return noStoreRedirect(new URL(`/resource/${slug}`, `https://${host}`));
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
