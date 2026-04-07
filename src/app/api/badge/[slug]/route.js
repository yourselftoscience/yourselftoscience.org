import ObjectData from '@/../public/resources_wikidata.json';

export const runtime = 'edge';

// Optionally statically generate standard badges
export async function generateStaticParams() {
  return ObjectData.map((resource) => ({ slug: resource.slug }));
}

export async function GET(request, { params }) {
  const { slug } = params;
  const resource = ObjectData.find(r => r.slug === slug || r.id === slug);

  if (!resource) {
    return new Response('Not Found', { status: 404 });
  }

  // Calculate prestige completeness
  const isComplete = resource.yearLaunched != null && 
                     resource.isActivelyRecruiting != null && 
                     resource.hasApi != null && 
                     resource.isOpenData != null;

  const leftText = "Yourself to Science";
  const rightText = isComplete ? "Complete Data Source" : "Verified Data Source";
  
  // Approximate width calculation (standard fonts)
  const leftWidth = 120;
  const rightWidth = isComplete ? 135 : 130;
  const totalWidth = leftWidth + rightWidth;

  // Official Theme Colors
  const colorLeft = "#1A1C1E"; // m3-on-surface (black title color)
  // Gold badge vs standard blue badge
  const colorRight = isComplete ? "#FDBB2D" : "#1156B0"; // stroke-yellow-dark / google-blue

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${leftText}: ${rightText}">
    <title>${leftText}: ${rightText}</title>
    <linearGradient id="s" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
      <rect width="${leftWidth}" height="20" fill="${colorLeft}"/>
      <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${colorRight}"/>
      <rect width="${totalWidth}" height="20" fill="url(#s)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
      <text aria-hidden="true" x="${leftWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(leftWidth - 20) * 10}">${leftText}</text>
      <text x="${leftWidth * 5}" y="140" transform="scale(.1)" fill="#fff" textLength="${(leftWidth - 20) * 10}">${leftText}</text>
      <text aria-hidden="true" x="${(leftWidth + rightWidth / 2) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(rightWidth - 20) * 10}">${rightText}</text>
      <text x="${(leftWidth + rightWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff" textLength="${(rightWidth - 20) * 10}">${rightText}</text>
    </g>
  </svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
      'Content-Disposition': `inline; filename="${slug}-badge.svg"`
    },
  });
}
