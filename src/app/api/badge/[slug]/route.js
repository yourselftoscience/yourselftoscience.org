import { readFileSync } from 'fs';
import { join } from 'path';
import ObjectData from '@/../public/resources_wikidata.json';

// We remove 'edge' runtime to allow Node.js 'fs' access during the 'next build' 
// static generation phase for the 'output: export' configuration.
export const runtime = 'nodejs';

// Optionally statically generate standard badges
export async function generateStaticParams() {
  return ObjectData.map((resource) => ({ slug: resource.id }));
}

export async function GET(request, { params }) {
  const { slug } = params;
  const resource = ObjectData.find(r => r.slug === slug || r.id === slug);

  if (!resource) {
    return new Response('Not Found', { status: 404 });
  }

  // Read official logo content from public directory
  let logoSvgContent = '';
  try {
    const logoPath = join(process.cwd(), 'public/logo-tm.svg');
    logoSvgContent = readFileSync(logoPath, 'utf8');
    // Clean up the SVG for nesting: remove XML declaration and doctype
    logoSvgContent = logoSvgContent.replace(/<\?xml.*\?>/g, '').replace(/<!DOCTYPE.*?>/g, '');
  } catch (error) {
    console.error('Failed to read logo-tm.svg:', error);
  }

  // Calculate prestige completeness
  const isComplete = resource.yearLaunched != null && 
                     resource.isActivelyRecruiting != null && 
                     resource.hasApi != null && 
                     resource.isOpenData != null;

  const leftText = "Yourself to Science";
  const rightText = isComplete ? "Complete Research Program" : "Indexed Research Program";
  
  // Approximate width calculation (standard fonts)
  const logoWidth = 24;
  const leftTextWidth = 185; // Increased to fit "Yourself to Science™" comfortably
  const leftWidth = logoWidth + leftTextWidth;
  const rightWidth = isComplete ? 170 : 165;
  const totalWidth = leftWidth + rightWidth;

  // Official Theme Colors
  const colorLeft = "#ffffff"; // Header match (white)
  const textColor = "#202124"; // google-text
  // Gold badge vs standard blue badge
  const colorRight = isComplete ? "#FDBB2D" : "#1156B0"; // stroke-yellow-dark / google-blue

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${leftText}: ${rightText}">
    <title>${leftText}: ${rightText}</title>
    <linearGradient id="s" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffd92d"/>
      <stop offset="100%" stop-color="#B35F00"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
      <rect width="${leftWidth}" height="20" fill="${colorLeft}"/>
      <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${colorRight}"/>
      <rect width="${totalWidth}" height="20" fill="url(#s)"/>
    </g>
    <g font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
      <!-- Official 'Yourself to Science' Logo Integrated via File Read -->
      <g transform="translate(4, 2) scale(0.069)">
        ${logoSvgContent}
      </g>
      
      <g transform="scale(.1)">
        <text x="${(logoWidth + (leftTextWidth / 2)) * 10}" y="140" fill="${textColor}" text-anchor="middle">
          <tspan font-weight="500">Your</tspan><tspan fill="url(#g)" stroke="#ffd92d" stroke-width="3" font-weight="bold">self</tspan><tspan font-weight="500"> to Science</tspan>
          <tspan font-size="70" baseline-shift="super">™</tspan>
        </text>
      </g>
      
      <text x="${(leftWidth + rightWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff" text-anchor="middle" textLength="${(rightWidth - 20) * 10}">${rightText}</text>
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
