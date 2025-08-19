export async function onRequestPost({ request }) {
  const upstreamUrl = 'https://cloud.umami.is/api/send';

  const body = await request.arrayBuffer();

  // Derive the best-guess client IP to help Umami geolocate correctly
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  const xff = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const clientIp = (cfConnectingIp || (xff ? xff.split(',')[0].trim() : '') || xRealIp || '').trim();

  const response = await fetch(upstreamUrl, {
    method: 'POST',
    headers: (() => {
      const headers = new Headers();
      // Pass through the content type so Umami can parse JSON
      headers.set('Content-Type', request.headers.get('content-type') || 'application/json');
      headers.set('User-Agent', request.headers.get('user-agent') || '');
      headers.set('Accept', request.headers.get('accept') || '*/*');
      // Help upstream identify original client IP for accurate country detection
      if (clientIp) {
        headers.set('X-Forwarded-For', clientIp);
        headers.set('X-Real-IP', clientIp);
      }
      // Optional: forward scheme/host context (not required, but harmless)
      const url = new URL(request.url);
      headers.set('X-Forwarded-Proto', url.protocol.replace(':', '') || 'https');
      headers.set('X-Forwarded-Host', url.host);
      return headers;
    })(),
    body,
  });

  const newHeaders = new Headers(response.headers);
  // Remove CORS/CORP headers from upstream as we serve same-origin
  newHeaders.delete('Access-Control-Allow-Origin');
  newHeaders.delete('Cross-Origin-Resource-Policy');
  newHeaders.set('Cache-Control', 'no-cache');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}


