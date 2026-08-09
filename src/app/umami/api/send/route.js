const UPSTREAM_EVENT_URL = 'https://cloud.umami.is/api/send';
const MAX_EVENT_BYTES = 64 * 1024;
export const dynamic = 'force-dynamic';

async function readLimitedBody(request) {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_EVENT_BYTES) return null;
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_EVENT_BYTES) {
      await reader.cancel('analytics event exceeds maximum size');
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function POST(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return new Response('Unsupported media type.', {
      status: 415,
      headers: { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const body = await readLimitedBody(request);
  if (body === null) {
    return new Response('Analytics event is too large.', {
      status: 413,
      headers: { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  try {
    const clientIp = request.headers.get('cf-connecting-ip');
    const upstreamHeaders = new Headers({
      accept: 'application/json',
      'content-type': 'application/json',
      'user-agent': request.headers.get('user-agent') || '',
    });
    if (clientIp) {
      upstreamHeaders.set('x-forwarded-for', clientIp);
      upstreamHeaders.set('x-real-ip', clientIp);
    }

    const upstreamResponse = await fetch(UPSTREAM_EVENT_URL, {
      method: 'POST',
      headers: upstreamHeaders,
      body,
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        'cache-control': 'no-store',
        'content-type': upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[umami-proxy] event forwarding failed', error);
    return new Response('Analytics service temporarily unavailable.', {
      status: 502,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'text/plain; charset=utf-8',
        'x-content-type-options': 'nosniff',
      },
    });
  }
}
