export async function onRequest({ request }) {
  const url = new URL(request.url);
  // Accept both /umami/script and /umami/script.js
  const upstreamUrl = 'https://cloud.umami.is/script.js';

  // Forward the GET request to Umami and stream back the response
  const response = await fetch(upstreamUrl, {
    method: 'GET',
    headers: (() => {
      const headers = new Headers();
      // Preserve a minimal set of headers; User-Agent helps with CDN variants
      headers.set('User-Agent', request.headers.get('user-agent') || '');
      headers.set('Accept', request.headers.get('accept') || '*/*');
      // Pass through IP hints for potential variant selection/geolocation (harmless if unused)
      const cfConnectingIp = request.headers.get('CF-Connecting-IP');
      const xff = request.headers.get('x-forwarded-for');
      const xRealIp = request.headers.get('x-real-ip');
      const clientIp = (cfConnectingIp || (xff ? xff.split(',')[0].trim() : '') || xRealIp || '').trim();
      if (clientIp) {
        headers.set('X-Forwarded-For', clientIp);
        headers.set('X-Real-IP', clientIp);
      }
      const reqUrl = new URL(request.url);
      headers.set('X-Forwarded-Proto', reqUrl.protocol.replace(':', '') || 'https');
      headers.set('X-Forwarded-Host', reqUrl.host);
      return headers;
    })(),
  });

  // Return response as-is, but ensure caching is friendly on the edge
  const newHeaders = new Headers(response.headers);
  // Avoid exposing cross-origin policy headers that might confuse the browser when proxied
  newHeaders.delete('Cross-Origin-Resource-Policy');
  newHeaders.set('Cache-Control', newHeaders.get('Cache-Control') || 'public, max-age=3600');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}


