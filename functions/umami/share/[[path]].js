export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const suffix = url.pathname.replace(/^\/umami\/share/, '');
  const upstreamUrl = `https://cloud.umami.is/share${suffix}${url.search}`;
  
  // If this is a direct request to a country flag asset (we rewrote HTML to /umami/images/country/xx.png),
  // proxy it explicitly, with a graceful fallback if the country code is missing.
  const imageMatch = url.pathname.match(/^\/umami\/images\/country\/(.*)$/);
  if (imageMatch) {
    const imagePath = imageMatch[1] || '';
    // If the path looks empty like just '.png' (missing code), return a 1x1 transparent PNG
    if (!imagePath || imagePath === '.png') {
      const transparent1x1 = Uint8Array.from([
        137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,10,73,68,65,84,120,156,99,96,0,0,0,2,0,1,226,33,188,33,0,0,0,0,73,69,78,68,174,66,96,130
      ]);
      return new Response(transparent1x1, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    const upstreamImageUrl = `https://cloud.umami.is/images/country/${imagePath}`;
    const imgResp = await fetch(upstreamImageUrl, { method: 'GET' });
    if (imgResp.status === 404) {
      // Same transparent fallback if upstream missing
      const transparent1x1 = Uint8Array.from([
        137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,10,73,68,65,84,120,156,99,96,0,0,0,2,0,1,226,33,188,33,0,0,0,0,73,69,78,68,174,66,96,130
      ]);
      return new Response(transparent1x1, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    const passthroughHeaders = new Headers(imgResp.headers);
    // Sanitize cross-origin policy headers
    passthroughHeaders.delete('Cross-Origin-Resource-Policy');
    return new Response(imgResp.body, {
      status: imgResp.status,
      statusText: imgResp.statusText,
      headers: passthroughHeaders,
    });
  }

  // Forward the GET request to Umami and stream back the response
  const response = await fetch(upstreamUrl, {
    method: 'GET',
    headers: (() => {
      const headers = new Headers();
      headers.set('User-Agent', request.headers.get('user-agent') || '');
      headers.set('Accept', request.headers.get('accept') || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
      // IP forwarding to improve geolocation (affects country flag lookups)
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

  const contentType = response.headers.get('content-type') || '';
  const newHeaders = new Headers(response.headers);
  newHeaders.delete('Cross-Origin-Resource-Policy');
  newHeaders.delete('Content-Security-Policy');
  newHeaders.set('Cache-Control', newHeaders.get('Cache-Control') || 'public, max-age=300');

  if (contentType.includes('text/html')) {
    // Rewrite absolute/relative country flag URLs to our local proxy with a graceful fallback
    let html = await response.text();
    html = html
      .replace(/https:\/\/eu\.umami\.is\/images\/country\//g, '/umami/images/country/')
      .replace(/https:\/\/cloud\.umami\.is\/images\/country\//g, '/umami/images/country/')
      .replace(/src=("|')\/images\/country\//g, 'src=$1/umami/images/country/');

    // Ensure correct content-length after transform
    newHeaders.set('Content-Length', String(new TextEncoder().encode(html).length));
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  // Non-HTML assets are streamed as-is
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}


