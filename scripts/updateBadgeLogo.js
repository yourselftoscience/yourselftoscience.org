import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOGO_PATH = join(process.cwd(), 'public/logo-tm.svg');
const OUTPUT_PATH = join(process.cwd(), 'src/data/badgeLogo.js');

async function updateBadgeLogo() {
  console.log('Synchronizing Badge Logo Assets...');
  try {
    let logoSvgContent = readFileSync(LOGO_PATH, 'utf8');
    
    // Extract only the content within the root <svg> tag while preserving nested graphical elements
    const svgMatch = logoSvgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
    if (!svgMatch) throw new Error('Could not find SVG content');
    
    logoSvgContent = svgMatch[1]
      .replace(/<\?xml.*\?>/g, '')
      .replace(/<!DOCTYPE.*?>/g, '')
      .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
      .replace(/<defs[\s\S]*?<\/defs>/gi, '')
      .replace(/<mask[\s\S]*?<\/mask>/gi, '')
      .replace(/\s(id|mask|filter|viewBox)="[^"]*"/gi, ' ') // Strip problematic attributes
      .replace(/\sstyle="[^"]*"/gi, (match) => match.includes('fill') ? match : ' ') // Keep styles only if they define fill
      .replace(/>\s+</g, '><') // Minify whitespace
      .trim();

    const outputContent = `// Auto-generated build-time asset. Do not edit manually.
// Sanitized to remove masks, filters, and metadata for Cloudflare Edge stability.
export const logoSvgContent = \`${logoSvgContent}\`;
`;

    // Ensure directory exists
    mkdirSync(join(process.cwd(), 'src/data'), { recursive: true });
    
    writeFileSync(OUTPUT_PATH, outputContent);
    console.log(`Successfully synchronized logo to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Failed to synchronize badge logo:', error);
    process.exit(1);
  }
}

updateBadgeLogo();
