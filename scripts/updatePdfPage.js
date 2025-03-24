const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  // Use the production URL instead of localhost
  const siteUrl = 'https://yourselftoscience.org';
  
  console.log(`Launching headless browser to fetch ${siteUrl}...`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport size for better PDF rendering
  await page.setViewport({ width: 1200, height: 800 });
  
  // Navigate to the site and wait for content to load
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });
  
  // Wait a bit more for any animations or delayed content
  await page.waitForTimeout(2000);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Use a more reliable method - add a header to the PDF rather than injecting content
  const pdfPath = path.join(__dirname, '..', 'public', 'yourselftoscience.pdf');
  
  // Enhanced PDF options with custom header that includes date and URL
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '40mm', // Increased top margin to make room for our header
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; font-size: 10px; padding: 5px 20px; background-color: #f0f0f0; border-bottom: 1px solid #ddd; display: flex; flex-direction: column; align-items: center;">
        <div style="margin-bottom: 5px; font-weight: bold;">This PDF was generated on ${currentDate}</div>
        <div>Original page: <a href="${siteUrl}">${siteUrl}</a></div>
        <div style="margin-top: 5px; font-weight: bold;">Yourself To Science</div>
      </div>
    `,
    footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  });
  
  console.log(`PDF output written to ${pdfPath}`);
  
  await browser.close();
})();