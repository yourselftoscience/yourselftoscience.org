const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define your site URL
const SITE_URL = 'https://yourselftoscience.org';

// Generate the sitemap XML
async function generateSitemap() {
  console.log('Generating sitemap.xml...');
  
  try {
    // Create a temporary script to handle CommonJS modules properly
    const tempScriptPath = path.join(__dirname, 'temp-extract.mjs');
    
    // Use dynamic import for CommonJS modules
    fs.writeFileSync(tempScriptPath, `
      import pkg from '../src/data/resources.js';
      const { resources } = pkg;
      console.log(JSON.stringify(resources.map(r => ({
        id: r.id,
        title: r.title,
        lastModified: new Date().toISOString().split('T')[0]
      }))));
    `);
    
    // Execute the temporary script to get resource data
    const output = execSync('node --experimental-modules ' + tempScriptPath).toString();
    const resourcesData = JSON.parse(output);
    
    // Delete the temporary script
    fs.unlinkSync(tempScriptPath);
    
    // Current date for lastmod
    const today = new Date().toISOString().split('T')[0];
    
    // Start the XML string
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/resources</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/yourselftoscience.pdf</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    
    // Add each resource URL
    resourcesData.forEach(resource => {
      sitemap += `
  <url>
    <loc>${SITE_URL}/resource/${resource.id}</loc>
    <lastmod>${resource.lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
    
    // Close the XML
    sitemap += `
</urlset>`;
    
    // Write the sitemap file
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    
    console.log(`Sitemap with ${resourcesData.length} resources written to ${sitemapPath}`);
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

// Export and direct execution
if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap };