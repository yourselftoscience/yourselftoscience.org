// src/app/umami/script.js
export const runtime = 'edge';

export async function GET(request) {
  const upstreamUrl = 'https://cloud.umami.is/script.js';

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      'User-Agent': request.headers.get('user-agent') || '',
      'Accept': request.headers.get('accept') || '*/*',
    },
  });

  const headers = new Headers(upstreamResponse.headers);
  headers.set('Cache-Control', 'public, max-age=3600');

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}
