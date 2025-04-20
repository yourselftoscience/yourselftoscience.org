// Import only what's used
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import fs from 'fs'; // Import fs module

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Function to read DOI from file ---
function getLatestDoi() {
  const doiFilePath = path.join(__dirname, '..', 'public', 'latest_doi.txt');
  const fallbackDoi = '10.5281/zenodo.15110328'; // Use the latest known version DOI as fallback
  try {
    if (fs.existsSync(doiFilePath)) {
      const doi = fs.readFileSync(doiFilePath, 'utf-8').trim();
      // Basic validation: check if it looks like a DOI prefix/suffix
      if (doi && doi.includes('/') && doi.startsWith('10.')) {
        console.log(`Using DOI from file: ${doi}`);
        return doi;
      } else if (doi) {
         console.warn(`Invalid DOI format found in file: ${doi}. Using fallback.`);
      }
    }
  } catch (error) {
    console.warn(`Error reading DOI file: ${error.message}`);
  }
  console.warn(`DOI file not found or empty/invalid. Using fallback DOI: ${fallbackDoi}`);
  return fallbackDoi;
}
// --- End function ---

(async () => {
  const siteUrl = 'https://yourselftoscience.org';
  const latestDoi = getLatestDoi(); // Get the DOI string
  const doiLink = `https://doi.org/${latestDoi}`; // Construct the full link

  console.log(`Launching headless browser to fetch ${siteUrl}...`);
  
  const browser = await puppeteer.launch({
    headless: 'new'  // Using the new headless mode to avoid deprecation warning
  });
  const page = await browser.newPage();
  
  // Set wider viewport size for better PDF rendering
  await page.setViewport({ width: 1600, height: 1000 });
  
  // Navigate to the site and wait for content to load
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });

  // Wait a bit more for hydration and animations
  await new Promise(r => setTimeout(r, 5000)); // Keep a reasonable wait time
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format date in YYYY/MM/DD format for citation purposes
  const citationDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
  const year = citationDate.split('/')[0];
  
  // Inject proper Google Scholar compatible structure and optimize layout
  await page.evaluate((date, year, siteUrl, doiLinkArg, latestDoiArg) => {
    // First, stop any animations by removing their source intervals
    const stopAllIntervals = () => {
      const interval_id = window.setInterval(function(){}, Number.MAX_SAFE_INTEGER);
      for (let i = 1; i < interval_id; i++) {
        window.clearInterval(i);
      }
    };
    stopAllIntervals();
    
    // Force the title to show "Yourself To Science" with "self" as the yellow word
    const titleElementSpans = document.querySelectorAll('h1 span.text-yellow-400');
    if (titleElementSpans.length > 0) {
      titleElementSpans.forEach(span => {
        span.textContent = 'self';
        span.className = 'text-yellow-400';
      });
    }

    // Force HTML and Body styles for PDF readability
    document.documentElement.style.cssText += `
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
      font-family: Arial, sans-serif; /* Set a common base font */
    `;
    document.body.style.cssText = `
      background-color: #ffffff;
      color: #000000;
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
      font-size: 11pt; /* Increase base font size slightly */
      line-height: 1.4; /* Improve line spacing */
      font-family: Arial, sans-serif; /* Ensure consistent font */
    `;
    
    // Find and modify any container elements to use full width, remove script padding
    const containers = document.querySelectorAll('div[class*="container"], main, section, article');
    containers.forEach(container => {
      container.style.cssText += `
        max-width: 100% !important;
        width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding-left: 0 !important; /* Remove script padding */
        padding-right: 0 !important; /* Remove script padding */
      `;
    });
    
    // Create a scholarly formatted header section
    const scholarHeader = document.createElement('div');
    scholarHeader.style.cssText = `
      padding: 10px; /* Reduced padding */
      margin-bottom: 15px; /* Reduced margin */
      border-bottom: 1px solid #ccc;
      text-align: center;
      background-color: #ffffff;
      color: #000000;
      width: 100% !important;
      box-sizing: border-box;
      font-family: Arial, sans-serif; /* Consistent font */
    `;
    
    // Add title with large font
    const titleDiv = document.createElement('div');
    titleDiv.textContent = 'Yourself To Science';
    titleDiv.style.cssText = `
      font-size: 24pt; /* Keep large for Scholar */
      font-weight: bold;
      margin-bottom: 10px;
      color: #000000;
    `;
    scholarHeader.appendChild(titleDiv);
    
    // Update author div
    const authorsDiv = document.createElement('div');
    authorsDiv.textContent = 'Mario Marcolongo';
    authorsDiv.style.cssText = `
      font-size: 14pt; /* Adjusted size */
      margin-bottom: 10px;
      color: #000000;
    `;
    scholarHeader.appendChild(authorsDiv);
    
    // Add explicit bibliographic citation
    const citationDiv = document.createElement('div');
    citationDiv.textContent = `Yourself To Science (${year}). A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More. PDF Version (${date}).`;
    citationDiv.style.cssText = `
      font-size: 10pt; /* Adjusted size */
      margin-top: 8px;
      color: #000000;
      line-height: 1.3;
    `;
    scholarHeader.appendChild(citationDiv);

    // Add DOI identifier
    const doiDiv = document.createElement('div');
    doiDiv.textContent = latestDoiArg; // Use the argument here
    doiDiv.style.cssText = `
      font-size: 10pt; /* Adjusted size */
      margin-top: 6px;
      color: #000000;
    `;
    scholarHeader.appendChild(doiDiv);

    // Add to page
    document.body.insertBefore(scholarHeader, document.body.firstChild);
    
    // Find the footer element
    const footer = document.querySelector('footer');
    if (footer) {
      // --- Remove original footer to prevent blank space ---
      footer.remove();
      // --- End remove footer ---

      // Add how to cite this page section (now inserted relative to body end)
      const citeSection = document.createElement('div');
      citeSection.style.cssText = `
        padding: 15px;
        margin-top: 30px;
        border-top: 1px solid #ccc;
        background-color: #f8f9fa;
        color: #000000;
        width: 100%;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
        page-break-before: always;
        page-break-inside: avoid;
      `;

      const citeTitle = document.createElement('h2');
      citeTitle.textContent = 'How to Cite This Page';
      citeTitle.style.cssText = `
        font-size: 16pt;
        margin-bottom: 15px;
        color: #000000;
        text-align: center;
      `;
      citeSection.appendChild(citeTitle);

      const citeFormatsDiv = document.createElement('div');
      citeFormatsDiv.style.cssText = `
        font-size: 10pt;
        line-height: 1.5;
        color: #000000;
        width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
        background-color: #ffffff;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        /* Removed margin-bottom as DOI is now inside */
      `;

      // --- Update formats array to use dynamic doiLinkArg ---
      const formats = [
         {
          name: 'APA',
          citation: `Marcolongo, M. (${year}). Yourself To Science: A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More. PDF Version (${date}). ${siteUrl}. ${doiLinkArg}`
        },
        {
          name: 'MLA',
          citation: `Marcolongo, Mario. "Yourself To Science: A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More." Yourself To Science, ${year}, PDF Version (${date}). ${siteUrl}, ${doiLinkArg}.`
        },
        {
          name: 'Chicago',
          citation: `Marcolongo, Mario. ${year}. "Yourself To Science: A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More." Yourself To Science. PDF Version (${date}). ${siteUrl}. ${doiLinkArg}.`
        }
      ];
      // --- End update formats ---

      formats.forEach(format => {
        const formatDiv = document.createElement('div');
        formatDiv.style.cssText = `
          margin-bottom: 15px;
          color: #000000;
          word-wrap: break-word;
          overflow-wrap: break-word;
          width: 100%;
        `;
        const formatTitle = document.createElement('strong');
        formatTitle.textContent = format.name + ': ';
        formatTitle.style.color = '#000000';
        formatDiv.appendChild(formatTitle);

        const formatText = document.createElement('span');
        // --- Make DOI a clickable link within the text ---
        const citationText = format.citation;
        const doiIndex = citationText.lastIndexOf(doiLinkArg); // Use dynamic doiLinkArg
        if (doiIndex !== -1) {
          formatText.appendChild(document.createTextNode(citationText.substring(0, doiIndex)));
          const link = document.createElement('a');
          link.href = doiLinkArg; // Use dynamic doiLinkArg
          link.textContent = doiLinkArg; // Use dynamic doiLinkArg
          link.style.color = '#000000'; // Keep link black
          link.style.textDecoration = 'underline';
          formatText.appendChild(link);
        } else {
          formatText.textContent = citationText; // Fallback if DOI wasn't found
        }
        // --- End make DOI clickable ---
        formatText.style.color = '#000000';
        formatDiv.appendChild(formatText);

        citeFormatsDiv.appendChild(formatDiv);
      });

      citeSection.appendChild(citeFormatsDiv);

      // --- Insert citeSection at the end of the body ---
      document.body.appendChild(citeSection);
      // --- End insert section ---
    }

    // Fix layout issues - Adjust table styles
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.tableLayout = 'auto';
      table.style.wordBreak = 'break-word';
      table.style.fontSize = '10pt';
      table.style.lineHeight = '1.3';
      table.style.borderCollapse = 'collapse';

      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        cells.forEach((cell, index) => {
          cell.style.padding = '5px 8px';
          cell.style.border = '1px solid #ccc';
          cell.style.verticalAlign = 'top';

          // --- Style the last column (Refs.) specifically ---
          if (index === cells.length - 1) { // Check if it's the last cell in the row
            cell.style.whiteSpace = 'nowrap'; // Prevent wrapping of [1], [2] etc.
            cell.style.textAlign = 'center'; // Center the refs
            cell.style.width = '5%'; // Suggest a small, fixed width if needed (optional)
          }
          // --- End Refs column style ---

          // Style headers
          if (cell.tagName === 'TH') {
            cell.style.backgroundColor = '#f2f2f2';
            cell.style.fontWeight = 'bold';
            cell.style.textAlign = 'left';
             // Ensure header for Refs is centered if we centered the cells
            if (index === cells.length - 1) {
               cell.style.textAlign = 'center';
            }
          }
        });
      });
    });

    // Force all flex containers to display as block for better PDF compatibility
    const flexContainers = document.querySelectorAll('div[style*="display: flex"], div[style*="display:flex"]');
    flexContainers.forEach(container => {
      container.style.display = 'block';
    });

    // --- Replace Payment Emojis with Text for PDF ---
    const paymentCells = document.querySelectorAll('table tbody tr td:first-child');
    paymentCells.forEach(cell => {
      const spans = cell.querySelectorAll('span.text-lg > span');
      let hasHeart = false;
      let hasMoney = false;

      spans.forEach(innerSpan => {
        if (innerSpan.textContent.includes('❤️')) hasHeart = true;
        if (innerSpan.textContent.includes('💵')) hasMoney = true;
      });

      cell.innerHTML = ''; // Clear original emoji spans

      if (hasHeart && hasMoney) cell.textContent = 'Mixed';
      else if (hasHeart) cell.textContent = 'Donation';
      else if (hasMoney) cell.textContent = 'Payment';
      else cell.textContent = 'Donation'; // Default

      // Apply styles for PDF rendering (align with other cells)
      cell.style.textAlign = 'center';
      cell.style.verticalAlign = 'top';
      cell.style.fontSize = '9pt'; // Keep this text slightly smaller
      // Padding is handled by the general cell styling loop
    });
    // --- End Emoji Replacement ---

  }, currentDate, year, siteUrl, doiLink, latestDoi);
  
  // Add scholarly metadata to the PDF
  await page.evaluate(() => {
    // Add metadata in a format Google Scholar can extract
    const metaSection = document.createElement('div');
    metaSection.style.cssText = `
      font-size: 16px;
      line-height: 1.6;
      margin-top: 15px; /* Adjust margin */
      margin-bottom: 15px; /* Adjust margin */
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    `;
    
    const title = document.createElement('h1');
    title.textContent = 'Yourself To Science: A Comprehensive List of Services for Contributing to Science';
    title.style.fontSize = '24pt';
    title.style.marginBottom = '10px';
    
    const authors = document.createElement('h2');
    authors.textContent = 'Mario Marcolongo';
    authors.style.fontSize = '18pt';
    authors.style.marginBottom = '10px';
    
    const date = document.createElement('div');
    date.textContent = `Publication Date: ${new Date().toISOString().split('T')[0]}`;
    date.style.fontSize = '14pt';
    
    metaSection.appendChild(title);
    metaSection.appendChild(authors);
    metaSection.appendChild(date);
    
    // Insert at the top of the document
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.parentNode.insertBefore(metaSection, mainContent);
    }
  });

  // Wait for the content modifications to complete using setTimeout instead of deprecated waitForTimeout
  await new Promise(r => setTimeout(r, 3000)); // Wait after DOM manipulation

  // Ensure the reference list is visible before generating PDF
  try {
      await page.waitForSelector('ol li[id^="ref-"]', { timeout: 15000 }); // Increased timeout
      console.log("Reference list found.");
  } catch (e) {
      console.warn("Reference list selector timed out or not found. PDF might be missing references.");
  }
  console.log("Waiting before PDF generation...");
  await new Promise(r => setTimeout(r, 4000)); // Reduced final wait

  // Fix PDF path and generate PDF
  const pdfPath = path.join(__dirname, '..', 'public', 'yourselftoscience.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true, // Important for background colors if any
    margin: {
      top: '15mm',
      right: '10mm', // Reduced
      bottom: '15mm',
      left: '10mm'  // Reduced
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; font-size: 8pt; padding: 3px 10px; background-color: #f0f0f0; border-bottom: 1px solid #ddd; text-align: center; box-sizing: border-box; font-family: Arial, sans-serif;">
        <div style="font-weight: bold;">PDF generated: ${currentDate}</div>
        <div>Source: ${siteUrl}</div>
      </div>
    `,
    footerTemplate: '<div style="width: 100%; font-size: 8pt; text-align: center; box-sizing: border-box; font-family: Arial, sans-serif;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  });

  console.log(`PDF output written to ${pdfPath}`);
  
  await browser.close();
})();