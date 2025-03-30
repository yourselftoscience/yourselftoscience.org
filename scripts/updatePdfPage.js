// Import only what's used
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  // Use the production URL instead of localhost
  const siteUrl = 'https://yourselftoscience.org';
  
  console.log(`Launching headless browser to fetch ${siteUrl}...`);
  
  // Launch with more generous viewport and use new headless mode
  const browser = await puppeteer.launch({
    headless: 'new'  // Using the new headless mode to avoid deprecation warning
  });
  const page = await browser.newPage();
  
  // Set wider viewport size for better PDF rendering
  await page.setViewport({ width: 1600, height: 1000 });
  
  // Navigate to the site and wait for content to load
  await page.goto(siteUrl, { waitUntil: 'networkidle0' });
  
  // Wait a bit more for any animations or delayed content using setTimeout instead of deprecated waitForTimeout
  await new Promise(r => setTimeout(r, 3000));
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format date in YYYY/MM/DD format for citation purposes
  const citationDate = new Date().toISOString().split('T')[0].replace(/-/g, '/');
  const year = citationDate.split('/')[0];
  
  // Inject proper Google Scholar compatible structure and optimize layout
  await page.evaluate((date, year, siteUrl) => {
    // First, stop any animations by removing their source intervals
    // Using a different approach to avoid TypeScript errors
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
        // Always set to "self" to ensure consistent title
        span.textContent = 'self';
        span.className = 'text-yellow-400';
      });
    }

    // Force the body to use full width and set text colors
    document.body.style.cssText = `
      background-color: #ffffff;
      color: #000000;
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 10px !important;
      overflow-x: hidden !important;
    `;
    
    // Find and modify any container elements to use full width
    const containers = document.querySelectorAll('div[class*="container"], main, section, article');
    containers.forEach(container => {
      container.style.cssText += `
        max-width: 100% !important;
        width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding-left: 10px !important;
        padding-right: 10px !important;
      `;
    });
    
    // Create a scholarly formatted header section
    const scholarHeader = document.createElement('div');
    scholarHeader.style.cssText = `
      padding: 20px;
      margin-bottom: 30px;
      border-bottom: 1px solid #ccc;
      text-align: center;
      background-color: #ffffff;
      color: #000000;
      width: 100% !important;
    `;
    
    // Add title with large font (24pt+) for Google Scholar recognition
    const titleDiv = document.createElement('div');
    titleDiv.textContent = 'Yourself To Science';
    titleDiv.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 15px;
      font-family: Arial, sans-serif;
      color: #000000;
    `;
    scholarHeader.appendChild(titleDiv);
    
    // Update author div
    const authorsDiv = document.createElement('div');
    authorsDiv.textContent = 'Mario Marcolongo'; // Updated author name
    authorsDiv.style.cssText = `
      font-size: 20px;
      margin-bottom: 15px;
      font-family: Arial, sans-serif;
      color: #000000;
    `;
    scholarHeader.appendChild(authorsDiv);
    
    // Add explicit bibliographic citation for Google Scholar
    const citationDiv = document.createElement('div');
    citationDiv.textContent = `Yourself To Science (${year}). A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More. PDF Version (${date}).`;
    citationDiv.style.cssText = `
      font-size: 14px;
      margin-top: 10px;
      font-family: Arial, sans-serif;
      color: #000000;
    `;
    scholarHeader.appendChild(citationDiv);

    // DOI section commented out until we have an official DOI
    /* 
    // Add DOI-like identifier
    const doiDiv = document.createElement('div');
    doiDiv.textContent = `https://doi.org/yourselftoscience/${year}`;
    doiDiv.style.cssText = `
      font-size: 14px;
      margin-top: 8px;
      font-family: Arial, sans-serif;
      color: #000000;
    `;
    scholarHeader.appendChild(doiDiv);
    */

    // Add to page - insert at the beginning of the body
    document.body.insertBefore(scholarHeader, document.body.firstChild);
    
    // Find the footer element to add citation info
    const footer = document.querySelector('footer');
    if (footer) {
      // Add how to cite this page section AFTER the footer
      const citeSection = document.createElement('div');
      citeSection.style.cssText = `
        padding: 20px;
        margin-top: 20px;
        border-top: 1px solid #ccc;
        background-color: #f8f9fa;
        color: #000000;
        width: 100%;
      `;
      
      const citeTitle = document.createElement('h2');
      citeTitle.textContent = 'How to Cite This Page';
      citeTitle.style.cssText = `
        font-size: 24px;
        margin-bottom: 15px;
        font-family: Arial, sans-serif;
        color: #000000;
      `;
      citeSection.appendChild(citeTitle);
      
      const citeFormatsDiv = document.createElement('div');
      citeFormatsDiv.style.cssText = `
        font-size: 14px;
        line-height: 1.6;
        font-family: Arial, sans-serif;
        color: #000000;
        width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
        background-color: #ffffff;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
      `;
      
      const formats = [
        {
          name: 'APA',
          citation: `Marcolongo, M. (${year}). Yourself To Science: A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More. PDF Version (${date}). ${siteUrl}`
        },
        {
          name: 'MLA',
          citation: `Marcolongo, Mario. "Yourself To Science: A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More." Yourself To Science, ${year}, PDF Version (${date}). ${siteUrl}`
        },
        {
          name: 'Chicago',
          citation: `Marcolongo, Mario. ${year}. "Yourself To Science: A Comprehensive List of Services for Contributing to Science with Your Data, Genome, Body, and More." Yourself To Science. PDF Version (${date}). ${siteUrl}`
        }
      ];
      
      formats.forEach(format => {
        const formatDiv = document.createElement('div');
        formatDiv.style.cssText = `
          margin-bottom: 20px;
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
        formatText.textContent = format.citation;
        formatText.style.color = '#000000';
        formatDiv.appendChild(formatText);
        
        citeFormatsDiv.appendChild(formatDiv);
      });
      
      citeSection.appendChild(citeFormatsDiv);
      
      // Insert after footer
      footer.parentNode.insertBefore(citeSection, footer.nextSibling);
    }
    
    // Fix layout issues that might affect PDF rendering
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.tableLayout = 'fixed';
      table.style.wordBreak = 'break-word';
    });
    
    // Force all flex containers to display as block for better PDF compatibility
    const flexContainers = document.querySelectorAll('div[style*="display: flex"], div[style*="display:flex"]');
    flexContainers.forEach(container => {
      container.style.display = 'block';
    });
    
  }, currentDate, year, siteUrl);
  
  // Add scholarly metadata to the PDF
  await page.evaluate(() => {
    // Add metadata in a format Google Scholar can extract
    const metaSection = document.createElement('div');
    metaSection.style.cssText = `
      font-size: 16px;
      line-height: 1.6;
      margin-top: 20px;
      margin-bottom: 20px;
      text-align: center;
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
  await new Promise(r => setTimeout(r, 1500));
  
  // Simplify the PDF generation process by keeping only the working citation ordering code
  // Replace the two citation reordering blocks with this single effective version

  // Wait long enough for the page to be fully hydrated
  await page.waitForSelector('ol li[id^="ref-"]', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 3000));

  // Apply the citation ordering fix
  await page.evaluate(() => {
    console.log("Applying citation ordering fix...");
    
    const referencesHeading = document.querySelector('h2.text-lg.font-bold');
    if (referencesHeading && referencesHeading.textContent === 'References') {
      const referenceList = referencesHeading.nextElementSibling;
      if (referenceList && referenceList.tagName.toLowerCase() === 'ol') {
        // Get references
        const refItems = Array.from(referenceList.children);
        
        // Find Kelly and Greshake references by content
        const kellyRef = refItems.find(item => 
          item.textContent.includes('Kelly') && 
          item.textContent.includes('qicPCR')
        );
        
        const greshakeRef = refItems.find(item => 
          item.textContent.includes('Greshake') && 
          item.textContent.includes('Open Humans')
        );
        
        // Create proper ordering if both references exist
        if (kellyRef && greshakeRef) {
          console.log("Reordering references to match website order");
          
          // Create new ordered list
          const newReferenceList = document.createElement('ol');
          newReferenceList.className = referenceList.className;
          
          // Kelly reference first (1)
          const kellyClone = kellyRef.cloneNode(true);
          kellyClone.id = 'ref-1';
          newReferenceList.appendChild(kellyClone);
          
          // Greshake reference second (2)
          const greshakeClone = greshakeRef.cloneNode(true);
          greshakeClone.id = 'ref-2';
          newReferenceList.appendChild(greshakeClone);
          
          // Replace list and update references
          referenceList.parentNode.replaceChild(newReferenceList, referenceList);
          
          // Fix table references
          document.querySelectorAll('td a[href^="#ref-"]').forEach(ref => {
            if (ref.parentElement.textContent.includes('FluCamp')) {
              ref.setAttribute('href', '#ref-1');
              ref.textContent = '[1]';
            }
            else if (ref.parentElement.textContent.includes('Open Humans')) {
              ref.setAttribute('href', '#ref-2');
              ref.textContent = '[2]';
            }
          });
        }
      }
    }
  });

  // Fix PDF path and generate PDF
  const pdfPath = path.join(__dirname, '..', 'public', 'yourselftoscience.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '15mm',
      left: '25mm'  // Left margin for reference numbers
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; font-size: 9px; padding: 3px 5px; background-color: #f0f0f0; border-bottom: 1px solid #ddd; text-align: center;">
        <div style="font-weight: bold;">PDF generated: ${currentDate}</div>
        <div>Source: ${siteUrl}</div>
      </div>
    `,
    footerTemplate: '<div style="font-size: 9px; text-align: center; width: 100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  });

  console.log(`PDF output written to ${pdfPath}`);
  
  await browser.close();
})();