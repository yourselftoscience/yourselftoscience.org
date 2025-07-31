export const runtime = 'edge';

// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host');
  const pathname = request.nextUrl.pathname;

  // This middleware should only run for the id.yourselftoscience.org subdomain
  if (host === 'id.yourselftoscience.org') {
    // If the request is for our specific API route, let it pass through
    if (pathname.startsWith('/api/resource/')) {
      return NextResponse.next();
    }

    // For any other path on the id.* subdomain, redirect to the main site's homepage.
    // This prevents duplicate content for SEO.
    const destinationURL = 'https://yourselftoscience.org';
    return Response.redirect(destinationURL, 308);
  }

  // For any other host, do nothing.
  return NextResponse.next();
}

// Define which paths this middleware should apply to.
export const config = {
  matcher: '/:path*',
};
