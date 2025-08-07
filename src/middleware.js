export const runtime = 'experimental-edge';

// src/middleware.js
import { NextResponse } from 'next/server';
import { resources } from '@/data/resources';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function middleware(request) {
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
        const match = resources.find((r) => r.id === idCandidate);
        if (match && match.slug) {
          return NextResponse.redirect(new URL(`/resource/${match.slug}`, 'https://yourselftoscience.org'), 308);
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
      const match = resources.find((r) => r.id === idOrSlug);
      if (match && match.slug) {
        // Preserve the current host in case of custom domains/aliases
        return NextResponse.redirect(new URL(`/resource/${match.slug}`, `https://${host}`), 308);
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
