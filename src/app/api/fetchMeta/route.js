export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doi = searchParams.get('doi');

  if (!doi) {
    return new Response(JSON.stringify({ error: 'Missing DOI parameter' }), { status: 400 });
  }

  // Basic DOI validation: must start with 10. and generally contain allowed characters
  // Blocking ".." to prevent path traversal
  const doiRegex = /^10\.\d{3,9}\/[-._;()/:A-Za-z0-9]+$/;
  if (!doiRegex.test(doi) || doi.includes('..')) {
    return new Response(JSON.stringify({ error: 'Invalid DOI format' }), { status: 400 });
  }

  const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const data = await response.json();
  return new Response(JSON.stringify(data.message), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
