import { execSync } from 'child_process';
import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateSitemap } from './generateSitemap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting watch for PDF and sitemap updates...');

// Function to generate PDF
async function generatePdf() {
  console.log('Generating PDF...');
  try {
    // Generate PDF
    execSync('node scripts/updatePdfPage.js', { stdio: 'inherit' });
    console.log('PDF generated successfully');
    
    // Generate sitemap using the imported function
    console.log('Updating sitemap...');
    await generateSitemap();
    
    // Touch the deployed files to trigger any watchers
    const now = new Date();
    const pdfPath = path.join(__dirname, '../public/yourselftoscience.pdf');
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    
    if (fs.existsSync(pdfPath)) {
      fs.utimesSync(pdfPath, now, now);
    }
    if (fs.existsSync(sitemapPath)) {
      fs.utimesSync(sitemapPath, now, now);
    }
    
    console.log('All updates completed successfully');
  } catch (error) {
    console.error('Error in generation process:', error.message);
  }
}

// Watch for changes to key files
const watcher = chokidar.watch([
  'src/data/resources.js',
  'src/app/**/*.js',
  'src/app/**/*.tsx',
  'src/components/**/*.js'
], {
  persistent: true,
  ignoreInitial: false, // Generate on start
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

// On change event
watcher.on('change', (changedPath) => {
  console.log(`File ${changedPath} changed`);
  generatePdf();
});

console.log('Watcher started - PDF and sitemap will update automatically on file changes');