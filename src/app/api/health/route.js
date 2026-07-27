export const runtime = 'edge';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'no-store',
  'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers });
}

export function HEAD() {
  return new Response(null, { status: 200, headers });
}

export function GET() {
  return Response.json(
    {
      status: 'ok',
      service: 'Yourself to Science',
      website: 'https://yourselftoscience.org',
      dataset: 'https://yourselftoscience.org/resources.json',
      mcp: 'https://mcp.yourselftoscience.org/mcp',
    },
    { status: 200, headers },
  );
}
