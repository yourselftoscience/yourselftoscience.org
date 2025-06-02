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
  await page.evaluate(async (date, year, siteUrl, doiLinkArg, latestDoiArg) => { // Made async
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
    citationDiv.textContent = `Yourself To Science (${year}). A Comprehensive Open-Source List of Services for Contributing to Science with Your Data, Genome, Body, and More. PDF Version (${date}).`;
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
          citation: `Marcolongo, M. (${year}). Yourself To Science: A Comprehensive Open-Source List of Services for Contributing to Science with Your Data, Genome, Body, and More. PDF Version (${date}). ${siteUrl}. ${doiLinkArg}`
        },
        {
          name: 'MLA',
          citation: `Marcolongo, Mario. "Yourself To Science: A Comprehensive Open-Source List of Services for Contributing to Science with Your Data, Genome, Body, and More." Yourself To Science, ${year}, PDF Version (${date}). ${siteUrl}, ${doiLinkArg}.`
        },
        {
          name: 'Chicago',
          citation: `Marcolongo, Mario. ${year}. "Yourself To Science: A Comprehensive Open-Source List of Services for Contributing to Science with Your Data, Genome, Body, and More." Yourself To Science. PDF Version (${date}). ${siteUrl}. ${doiLinkArg}.`
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

    // --- Replace Compensation Emojis in Grid with Plain Text for PDF ---
    document.querySelectorAll('span').forEach(span => {
      const txt = (span.textContent || '').trim();
      let replacement = null;

      // detect Mixed first (parent span with both emojis)
      if (txt.includes('❤️') && txt.includes('💵')) {
        replacement = 'Mixed';
      }
      // single cases
      else if (txt === '❤️') {
        replacement = 'Donation';
      }
      else if (txt === '💵') {
        replacement = 'Payment';
      }

      if (replacement) {
        // find and remove the pill background
        const pill = span.closest('.tag');

        // build container
        const container = document.createElement('div');
        container.style.cssText = `
          color: #6b7280;
          font-size: 11pt;
          margin-bottom: 4px;
        `;

        // label line (bigger & bolder)
        const label = document.createElement('div');
        label.textContent = 'Compensation:';
        label.style.cssText = `
          font-weight: 600;
          font-size: 11pt;
        `;

        // type line
        const value = document.createElement('div');
        value.textContent = replacement;

        container.append(label, value);

        if (pill) pill.replaceWith(container);
        else span.replaceWith(container);
      }
    });
    // --- End Compensation Replacement ---

    // --- Replace interactive citation buttons with all footnotes from the panel ---
    // 1) Open all popovers so their panels are injected into the DOM
    document.querySelectorAll('button[aria-label*="reference"]').forEach(btn => {
      if (btn.getAttribute('aria-expanded') !== 'true') {
        btn.click();
      }
    });

    // Wait for panels to potentially render after clicks
    await new Promise(r => setTimeout(r, 1000)); // 1-second delay, adjust if needed

    // 2) Now replace each button with one or more [ref] links
    document.querySelectorAll('button[aria-label*="reference"]').forEach(btn => {
      const panelId = btn.getAttribute('aria-controls');
      let panel = panelId ? document.getElementById(panelId) : null;
      if (!panel && btn.id) panel = document.querySelector(`div[aria-labelledby="${btn.id}"]`);

      const refs = [];
      if (panel && panel.getAttribute('data-headlessui-state') === 'open') {
        panel.querySelectorAll('a[href^="#ref-"]').forEach(orig => {
          const match = orig.getAttribute('href').match(/#ref-(\d+)/);
          if (match) {
            const num = match[1];
            const a = document.createElement('a');
            a.href = `#ref-${num}`;
            a.textContent = `[${num}]`;
            a.style.cssText = 'text-decoration:none;color:inherit;font-size:0.8em;vertical-align:super;';
            refs.push(a);
          }
        });
      }

      if (refs.length > 0) {
        const container = document.createElement('span');
        container.style.cssText = 'margin-left:0.25em;vertical-align:super;'; // Keep overall container style

        // Create and style the "Ref(s):" label
        const refLabel = document.createElement('span');
        refLabel.textContent = 'Ref(s): ';
        refLabel.style.cssText = 'font-weight:600;color:#6b7280;font-size:0.8em;margin-right:0.1em;vertical-align:super;'; // Style for label
        container.appendChild(refLabel); // Add label to container first

        refs.forEach((link,i) => {
          if (i > 0) link.style.marginLeft = '0.15em'; // Add margin for subsequent links, not the first one after label
          container.appendChild(link);
        });
        if (btn.parentNode) { // Ensure button is still part of the DOM
            btn.parentNode.replaceChild(container, btn);
        }
      }
    });
    // --- End Replace citation buttons ---

    // --- Expand instruction buttons into visible instructions for PDF ---
    // 1) First, open all instruction popovers so their panels are injected into the DOM
    document.querySelectorAll('button[title="View Instructions"]').forEach(btn => {
      if (btn.getAttribute('aria-expanded') !== 'true') {
        btn.click();
      }
    });

    // Wait for instruction panels to potentially render after clicks
    await new Promise(r => setTimeout(r, 1000)); // 1-second delay for popovers to open

    // 2) Now replace each instruction button with expanded instruction content
    document.querySelectorAll('button[title="View Instructions"]').forEach(btn => {
      try {
        const panelId = btn.getAttribute('aria-controls');
        let panel = panelId ? document.getElementById(panelId) : null;
        
        // Try alternative ways to find the instruction panel
        if (!panel && btn.id) {
          panel = document.querySelector(`div[aria-labelledby="${btn.id}"]`);
        }
        if (!panel) {
          // Look for nearby popover panels that are open
          const nearbyPanel = btn.parentElement.querySelector('div[data-headlessui-state="open"]');
          if (nearbyPanel) panel = nearbyPanel;
        }

        let instructionSteps = [];
        
        if (panel && panel.getAttribute('data-headlessui-state') === 'open') {
          // Extract instruction steps from the opened panel, but exclude icon text
          const stepElements = panel.querySelectorAll('ol li, ul li, li, div[class*="step"], p');
          instructionSteps = Array.from(stepElements).map(element => {
            // Clone the element to avoid modifying the original
            const clonedElement = element.cloneNode(true);
            
            // Remove all icon elements and their titles from the cloned element
            const iconElements = clonedElement.querySelectorAll('svg, .fa, [class*="fa-"], [title*="Step"], [title*="Icon"]');
            iconElements.forEach(icon => icon.remove());
            
            // Also remove any spans that might contain icon titles
            const titleSpans = clonedElement.querySelectorAll('span[class*="text-"], span[title]');
            titleSpans.forEach(span => {
              const spanText = span.textContent || '';
              // Remove spans that look like icon labels
              if (spanText.includes('Step') || spanText.includes('Icon') || spanText.length < 3) {
                span.remove();
              }
            });
            
            let text = clonedElement.textContent || '';
            
            // Clean up the text - remove step numbers, extra whitespace, and icon-related text
            text = text.replace(/^\d+\.\s*/, '').trim();
            
            // Remove common icon alt text patterns
            text = text.replace(/Mobile App Step,?\s*/gi, '');
            text = text.replace(/Settings Step,?\s*/gi, '');
            text = text.replace(/Privacy Step,?\s*/gi, '');
            text = text.replace(/Action Step,?\s*/gi, '');
            text = text.replace(/Step,?\s*/gi, '');
            text = text.replace(/Icon,?\s*/gi, '');
            
            // Remove any remaining comma artifacts and clean whitespace
            text = text.replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
            
            return text;
          }).filter(step => {
            // Filter out very short text, empty strings, and icon-related text
            return step.length > 10 && 
                   !step.match(/^(Mobile App|Settings|Privacy|Action)?\s*Step$/i) &&
                   !step.match(/^(Step|Icon)$/i);
          });
        }

        // If we found instruction steps, create a static display
        if (instructionSteps.length > 0) {
          // Create the expanded instructions container
          const instructionsDiv = document.createElement('div');
          instructionsDiv.style.cssText = `
            margin-top: 0.75rem;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 0.75rem;
            font-size: 0.875rem;
            color: #374151;
            line-height: 1.5;
            page-break-inside: avoid;
          `;
          
          // Add title
          const title = document.createElement('div');
          title.textContent = 'Instructions:';
          title.style.cssText = 'font-weight: 600; margin-bottom: 0.5rem; color: #1f2937;';
          instructionsDiv.appendChild(title);
          
          // Add instruction steps as an ordered list
          const ol = document.createElement('ol');
          ol.style.cssText = 'margin: 0; padding-left: 1.25rem; list-style-type: decimal;';
          
          instructionSteps.forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = step;
            li.style.cssText = 'margin-bottom: 0.375rem; line-height: 1.5;';
            ol.appendChild(li);
          });
          
          instructionsDiv.appendChild(ol);
          
          // Insert the instructions after the button's container
          const buttonContainer = btn.closest('div.flex.justify-between') || btn.closest('div');
          if (buttonContainer && buttonContainer.parentNode) {
            buttonContainer.parentNode.insertBefore(instructionsDiv, buttonContainer.nextSibling);
          }
        } else {
          // If no instructions found, create a helpful placeholder
          const placeholder = document.createElement('div');
          placeholder.style.cssText = `
            margin-top: 0.75rem;
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            padding: 0.75rem;
            font-size: 0.875rem;
            color: #6b7280;
            font-style: italic;
          `;
          placeholder.textContent = 'Instructions: Please visit the service website for detailed step-by-step instructions.';
          
          const buttonContainer = btn.closest('div.flex.justify-between') || btn.closest('div');
          if (buttonContainer && buttonContainer.parentNode) {
            buttonContainer.parentNode.insertBefore(placeholder, buttonContainer.nextSibling);
          }
        }
        
        // Hide the original button since it's not interactive in PDF
        btn.style.display = 'none';
        
        // Hide any opened instruction panels to clean up the DOM
        if (panel) {
          panel.style.display = 'none';
        }
        
      } catch (error) {
        console.warn('Error processing instruction button:', error);
        // Just hide the button if we can't process it
        btn.style.display = 'none';
      }
    });
    // --- End expand instructions for PDF ---

  }, currentDate, year, siteUrl, doiLink, latestDoi);
  
  // --- REMOVED Redundant Metadata Section ---
  // The following block was removed as the information is already present
  // in the header and citation formats for Google Scholar.
  /*
  await page.evaluate(() => {
    // Add metadata in a format Google Scholar can extract
    const metaSection = document.createElement('div');
    metaSection.style.cssText = `
      font-size: 16px;
      line-height: 1.6;
      margin-top: 15px; // Adjust margin
      margin-bottom: 15px; // Adjust margin
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    `;
    
    const title = document.createElement('h1');
    title.textContent = 'Yourself To Science: A Comprehensive Open-Source List of Services for Contributing to Science';
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
  */
  // --- END REMOVED Section ---

  // --- Hide Search and Mobile Filter Button in PDF ---
  await page.evaluate(() => {
    // Hide the search input container
    const searchInputContainer = document.querySelector('main > div:first-child'); // Adjust selector if needed
    if (searchInputContainer && searchInputContainer.querySelector('input[type="text"]')) {
      searchInputContainer.style.display = 'none';
    }

    // Hide the mobile filter button specifically (it might be inside the same container)
    const mobileFilterButton = document.querySelector('button.lg\\:hidden'); // Selector for the mobile filter button
     if (mobileFilterButton && mobileFilterButton.textContent.includes('Filters')) {
       // If the button is not inside the already hidden container, hide it separately
       if (!searchInputContainer || !searchInputContainer.contains(mobileFilterButton)) {
          mobileFilterButton.style.display = 'none';
       }
     }
  });
  // --- END Hide Elements ---

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