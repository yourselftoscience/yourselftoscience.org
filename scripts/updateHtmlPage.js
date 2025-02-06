const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const outputPath = path.join(__dirname, '..', 'public', 'yourselftoscience.html');

  console.log(`Launching headless browser to fetch ${siteUrl}...`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });
  let html = await page.content();

  // Ensure full HTML document
  if (!html.startsWith('<!DOCTYPE html>')) {
    html = '<!DOCTYPE html>\n' + html;
  }

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`HTML output written to ${outputPath}`);
  await browser.close();
})();