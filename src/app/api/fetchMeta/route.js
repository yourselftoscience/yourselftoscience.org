export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doi = searchParams.get('doi');
  const response = await fetch(`https://api.crossref.org/works/${doi}`);
  const data = await response.json();
  return new Response(JSON.stringify(data.message), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
