import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define your site URL
const SITE_URL = 'https://yourselftoscience.org';

// Generate the sitemap XML
async function generateSitemap() {
  console.log('Generating sitemap.xml...');
  
  try {
    // Create a temporary script to handle CommonJS modules properly
    const tempScriptPath = path.join(__dirname, 'temp-extract.mjs');
    
    fs.writeFileSync(tempScriptPath, `
      import { resources } from '../src/data/resources.js';
      const clinicalTrialResources = resources.filter(resource => resource.dataTypes.includes('Clinical trials'));
      const countryOptions = Array.from(new Set(clinicalTrialResources.flatMap(r => r.countries || []))).sort();

      console.log(JSON.stringify({
        resources: resources.map(r => ({
          id: r.id,
          lastModified: new Date().toISOString().split('T')[0]
        })),
        clinicalTrialCountries: countryOptions
      }));
    `);
    
    // Execute the temporary script to get resource data
    const output = execSync('node --experimental-modules ' + tempScriptPath).toString();
    const { resources: resourcesData, clinicalTrialCountries } = JSON.parse(output);
    
    // Delete the temporary script
    fs.unlinkSync(tempScriptPath);
    
    const today = new Date().toISOString().split('T')[0];
    
    const staticPages = [
      { url: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
      { url: `${SITE_URL}/stats`, priority: '0.9', changefreq: 'weekly' },
      { url: `${SITE_URL}/contribute`, priority: '0.9', changefreq: 'weekly' },
      { url: `${SITE_URL}/clinical-trials`, priority: '0.8', changefreq: 'weekly' },
      { url: `${SITE_URL}/resources`, priority: '0.5', changefreq: 'monthly' }, // SEO-only page
      { url: `${SITE_URL}/yourselftoscience.pdf`, priority: '0.7', changefreq: 'weekly' }
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add clinical trial country pages
    clinicalTrialCountries.forEach(country => {
      sitemap += `
  <url>
    <loc>${SITE_URL}/clinical-trials?countries=${encodeURIComponent(country)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    resourcesData.forEach(resource => {
      sitemap += `
  <url>
    <loc>${SITE_URL}/resource/${resource.id}</loc>
    <lastmod>${resource.lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;
    
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    
    console.log(`Sitemap with ${staticPages.length + clinicalTrialCountries.length + resourcesData.length} total URLs written to ${sitemapPath}`);
    return true;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback: create a basic sitemap with just the main URLs
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/resources</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/yourselftoscience.pdf</loc>
    <priority>0.8</priority>
  </url>
</urlset>`;
    
    fs.writeFileSync(sitemapPath, basicSitemap);
    console.log(`Created basic sitemap as fallback at ${sitemapPath}`);
    return true;
  }
}

async function checkIsMain(metaUrl) {
    if (!metaUrl.startsWith('file://')) {
        return false;
    }
    
    // In Node.js, process will be defined.
    // In edge environments, it might not be.
    if (typeof process === 'undefined' || !process.argv || !process.argv[1]) {
        return false;
    }

    const modulePath = await import('url').then(url => url.fileURLToPath(metaUrl));
    return process.argv[1] === modulePath;
}

// Export and direct execution
// Check if this is the main module being executed directly
checkIsMain(import.meta.url).then(isMain => {
    if (isMain) {
        generateSitemap();
    }
});

export { generateSitemap };