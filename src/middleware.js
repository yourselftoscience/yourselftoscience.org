// src/middleware.js
import { NextResponse } from 'next/server';
import { resources } from '@/data/resources';

// Accept hyphenated 36-char IDs with letters & digits to support non-hex UUID-style IDs
const UUID_REGEX = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/;

// Build in-process lookup tables at edge init time (no network calls).
const { idToSlug: ID_TO_SLUG, slugs: RESOURCE_SLUGS } = (() => {
  const idToSlug = new Map();
  const slugs = new Set();
  for (const resource of resources) {
    if (resource.slug) slugs.add(resource.slug);
    if (resource.id && resource.slug) idToSlug.set(resource.id, resource.slug);
  }
  return { idToSlug, slugs };
})();

// Human-facing routes that already have generated Markdown equivalents in /public.
const MARKDOWN_ROUTES = new Map([
  ['/', '/index.html.md'],
  ['/stats', '/stats.md'],
  ['/data', '/data.md'],
  ['/resources', '/resources.md'],
  ['/resource', '/resources.md'],
  ['/get-involved', '/get-involved.md'],
  ['/mission', '/mission.md'],
  ['/clinical-trials', '/clinical-trials.md'],
  ['/organ-body-tissue-donation', '/organ-body-tissue-donation.md'],
  ['/what-can-i-do-with-my-genetic-data', '/what-can-i-do-with-my-genetic-data.md'],
  ['/data-types', '/data-types.md'],
]);

function requestedMarkdown(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return false;
  return (request.headers.get('accept') || '').toLowerCase().includes('text/markdown');
}

function markdownPathFor(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const staticMatch = MARKDOWN_ROUTES.get(normalized);
  if (staticMatch) return staticMatch;

  const resourceMatch = normalized.match(/^\/resource\/([^/]+)$/);
  if (resourceMatch && RESOURCE_SLUGS.has(resourceMatch[1])) {
    return `/resource/${resourceMatch[1]}.md`;
  }

  return null;
}

function rewriteAsMarkdown(request, markdownPath) {
  const markdownUrl = request.nextUrl.clone();
  markdownUrl.pathname = markdownPath;
  markdownUrl.search = '';

  const response = NextResponse.rewrite(markdownUrl);
  response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
  response.headers.set('Content-Location', markdownPath);
  response.headers.set('Vary', 'Accept');
  response.headers.set('Content-Signal', 'ai-train=yes, search=yes, ai-input=yes');
  response.headers.set('X-Markdown-Source', markdownPath);
  return response;
}

export async function middleware(request) {
  const host = request.headers.get('host');
  const pathname = request.nextUrl.pathname;

  // 1) Handle the id.yourselftoscience.org subdomain.
  if (host === 'id.yourselftoscience.org') {
    // Allow the API route to perform UUID->slug redirect lookups.
    if (pathname.startsWith('/api/resource/')) {
      return NextResponse.next();
    }

    // If the request is for a specific resource UUID, redirect to canonical slug on main domain.
    if (pathname.startsWith('/resource/')) {
      const parts = pathname.split('/');
      const idCandidate = parts[2] || '';
      if (UUID_REGEX.test(idCandidate)) {
        const slug = ID_TO_SLUG.get(idCandidate);
        if (slug) {
          return NextResponse.redirect(new URL(`/resource/${slug}`, 'https://yourselftoscience.org'), 308);
        }
      }
      return NextResponse.redirect(new URL('/', 'https://yourselftoscience.org'), 308);
    }

    return NextResponse.redirect(new URL('/', 'https://yourselftoscience.org'), 308);
  }

  // 2) On the main domain, redirect /resource/<uuid> to /resource/<slug>.
  if (pathname.startsWith('/resource/')) {
    const parts = pathname.split('/');
    const idOrSlug = parts[2] || '';
    if (UUID_REGEX.test(idOrSlug)) {
      const slug = ID_TO_SLUG.get(idOrSlug);
      if (slug) {
        return NextResponse.redirect(new URL(`/resource/${slug}`, `https://${host}`), 308);
      }
    }
  }

  // 3) Content negotiation: browsers still receive HTML, while agents asking for
  // text/markdown receive the generated Markdown representation of the same page.
  if (requestedMarkdown(request)) {
    const markdownPath = markdownPathFor(pathname);
    if (markdownPath) return rewriteAsMarkdown(request, markdownPath);
  }

  return NextResponse.next();
}

// Apply to all paths so content negotiation works on every public page.
export const config = {
  matcher: '/:path*',
};
