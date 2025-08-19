export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const imagePath = url.pathname.replace(/^\/umami\/images\/country\//, '') || '';

  // If the path is missing or just ".png", return a 1x1 transparent PNG as a graceful fallback
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

  // Try EU asset host first, then fallback to cloud
  const candidates = [
    `https://eu.umami.is/images/country/${imagePath}`,
    `https://cloud.umami.is/images/country/${imagePath}`,
  ];

  for (const upstream of candidates) {
    const res = await fetch(upstream, { method: 'GET' });
    if (res.ok) {
      const headers = new Headers(res.headers);
      headers.delete('Cross-Origin-Resource-Policy');
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }
  }

  // If no candidate works, respond with transparent fallback
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


