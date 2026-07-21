const UPSTREAM_SCRIPT_URL = 'https://cloud.umami.is/script.js';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const upstreamResponse = await fetch(UPSTREAM_SCRIPT_URL, {
      method: 'GET',
      headers: {
        accept: request.headers.get('accept') || 'application/javascript,*/*;q=0.1',
        'user-agent': request.headers.get('user-agent') || '',
      },
      cf: { cacheEverything: true, cacheTtl: 3600 },
    });

    const headers = new Headers({
      'cache-control': 'public, max-age=3600, s-maxage=3600',
      'content-type': upstreamResponse.headers.get('content-type') || 'application/javascript; charset=utf-8',
      'x-content-type-options': 'nosniff',
    });
    const etag = upstreamResponse.headers.get('etag');
    if (etag) headers.set('etag', etag);

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  } catch (error) {
    console.error('[umami-proxy] script fetch failed', error);
    return new Response('Analytics script temporarily unavailable.', {
      status: 502,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'text/plain; charset=utf-8',
        'x-content-type-options': 'nosniff',
      },
    });
  }
}
