export const runtime = 'edge';

export async function GET(request, { params }) {
  const url = new URL(request.url);
  const suffix = '/' + ((params && Array.isArray(params.path)) ? params.path.join('/') : '');
  const upstreamUrl = `https://cloud.umami.is/share${suffix}${url.search}`;

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      'User-Agent': request.headers.get('user-agent') || '',
      'Accept': request.headers.get('accept') || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  const contentType = upstreamResponse.headers.get('content-type') || '';
  const headers = new Headers(upstreamResponse.headers);
  headers.delete('Cross-Origin-Resource-Policy');
  headers.delete('Content-Security-Policy');

  if (contentType.includes('text/html')) {
    let html = await upstreamResponse.text();

    // Rewrite flag image URLs to local proxy
    html = html
      .replace(/https:\/\/eu\.umami\.is\/images\/country\//g, '/umami/images/country/')
      .replace(/https:\/\/cloud\.umami\.is\/images\/country\//g, '/umami/images/country/')
      .replace(/src=("|')\/images\/country\//g, 'src=$1/umami/images/country/');

    // Force light theme via meta, inline style, and localStorage hints
    const meta = '<meta name="color-scheme" content="light">';
    const style = '<style id="umami-force-light">:root,html,body,[data-theme],html[data-theme],body[data-theme]{--theme:light !important;color-scheme:light !important;}html[data-theme="dark"],body[data-theme="dark"],html.dark,body.dark{--theme:light !important;color-scheme:light !important;}@media (prefers-color-scheme: dark){:root,html,body,[data-theme],html[data-theme],body[data-theme]{--theme:light !important;color-scheme:light !important;}}</style>';
    const script = '<script>(function(){try{localStorage.setItem("theme","light");localStorage.setItem("color-mode","light");localStorage.setItem("chakra-ui-color-mode","light");document.documentElement.setAttribute("data-theme","light");document.documentElement.classList.remove("dark");}catch(e){}})();</script>';

    if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${meta}${style}${script}</head>`);
    } else {
      html = meta + style + script + html;
    }

    headers.set('Content-Length', String(new TextEncoder().encode(html).length));
    return new Response(html, { status: upstreamResponse.status, statusText: upstreamResponse.statusText, headers });
  }

  return new Response(upstreamResponse.body, { status: upstreamResponse.status, statusText: upstreamResponse.statusText, headers });
}


