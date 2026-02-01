import path from 'node:path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Helper: Get DOI ---
function getLatestDoi() {
  const doiFilePath = path.join(__dirname, '..', 'public', 'latest_doi.txt');
  const fallbackDoi = '10.5281/zenodo.15110328';
  try {
    if (fs.existsSync(doiFilePath)) {
      const doi = fs.readFileSync(doiFilePath, 'utf-8').trim();
      if (doi && doi.includes('/') && doi.startsWith('10.')) {
        return doi;
      }
    }
  } catch (error) {
    console.warn(`Error reading DOI file: ${error.message}`);
  }
  return fallbackDoi;
}

// --- Helper: Get Logo ---
function getLogoDataUrl() {
  const logoPath = path.join(__dirname, '..', 'public', 'logo-tm.svg');
  try {
    if (fs.existsSync(logoPath)) {
      const svg = fs.readFileSync(logoPath, 'utf-8');
      const base64 = Buffer.from(svg).toString('base64');
      return `data:image/svg+xml;base64,${base64}`;
    }
  } catch (error) {
    console.warn(`Error reading logo file: ${error.message}`);
  }
  return null;
}

const siteUrl = 'https://yourselftoscience.org';
const latestDoi = getLatestDoi();
const doiLink = `https://doi.org/${latestDoi}`;
const logoDataUrl = getLogoDataUrl();

console.log(`Launching headless browser to fetch ${siteUrl}...`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();

// Enhanced error logging
page.on('console', msg => {
  const type = msg.type();
  if (type === 'error' || type === 'warning') {
    console.log(`BROWSER ${type.toUpperCase()}:`, msg.text());
  }
});

page.on('pageerror', err => {
  console.error('PAGE ERROR:', err.toString());
});

page.on('error', err => {
  console.error('PAGE CRASH:', err.toString());
});

await page.setViewport({ width: 1600, height: 1000 });
await page.goto(siteUrl, { waitUntil: 'networkidle0' });

// Wait for hydration
await new Promise(r => setTimeout(r, 5000));

const currentDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const citationDate = new Date().toISOString().split('T')[0].replaceAll('-', '/');
const year = citationDate.split('/')[0];

try {
  // STEP 0: Scroll to bottom to trigger any lazy loading
  await page.evaluate(async () => {
    console.log('STEP 0: Scrolling page to trigger lazy loading...');
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0); // Scroll back to top
          resolve();
        }
      }, 50);
    });
  });

  // Wait a bit after scrolling
  await new Promise(r => setTimeout(r, 2000));

  // STEP 1: Collect Citation Data (Iterative Open -> Collect)
  const citationData = await page.evaluate(async () => {
    console.log('STEP 1: Iterating through cards to collect citations...');
    const data = [];
    const citationButtons = Array.from(document.querySelectorAll('button[aria-label*="citation"]'));
    console.log(`Found ${citationButtons.length} citation buttons`);

    const processButton = async (btn) => {
      try {
        // 1. Scroll into view
        btn.scrollIntoView({ block: 'center' });

        // 2. Click to open
        if (btn.getAttribute('aria-expanded') !== 'true') {
          btn.click();
          // Wait for popover to appear
          await new Promise(r => setTimeout(r, 200));
        }

        // 3. Find the card and the open panel
        const card = btn.closest('.resource-card');
        if (!card) return null;

        const cardId = card.id;
        const citationPanel = card.querySelector('[data-headlessui-state*="open"]');

        if (citationPanel) {
          const citations = [];
          const citationLinks = citationPanel.querySelectorAll('a[href^="#ref-"]');

          for (const link of citationLinks) {
            const href = link.getAttribute('href');
            const li = link.closest('li');
            const citationText = li?.textContent?.replace(/\[Ref\s*\d+\]/, '').trim();

            if (href && citationText) {
              citations.push({ href, text: citationText });
            }
          }

          if (citations.length > 0) {
            return { cardId, citations };
          }
        }
      } catch (e) {
        console.warn('Error processing citation button:', e);
      }
      return null;
    };

    for (const btn of citationButtons) {
      const result = await processButton(btn);
      if (result) {
        data.push(result);
      }
    }

    console.log(`Collected data for ${data.length} cards`);
    return data;
  });

  console.log(`Extracted ${citationData.length} cards with citations`);

  // STEP 2: Freeze DOM and Manipulate (Detach React)
  // Note: We don't need to wait for popovers anymore since we already collected the data.
  // We can proceed directly to freezing.

  console.log(`Extracted ${citationData.length} cards with citations`);

  // STEP 3: Freeze DOM and Manipulate (Detach React)
  await page.evaluate((date, year, siteUrl, doiLinkArg, latestDoiArg, citationDataArg, logoDataUrlArg) => {
    console.log('STEP 3: Freezing DOM and applying transformations...');

    console.log('STEP 3: Freezing DOM and applying transformations...');

    // --- Helpers ---

    const freezeDOM = () => {
      // 1. Freeze DOM (Kill React listeners/updates)
      const staticBody = document.body.cloneNode(true);
      document.body.replaceWith(staticBody);
      console.log('DOM frozen - React detached');

      // 2. Stop Animations
      const interval_id = globalThis.setInterval(() => { }, Number.MAX_SAFE_INTEGER);
      for (let i = 1; i < interval_id; i++) {
        globalThis.clearInterval(i);
      }

      // 3. Apply Global Styles
      const globalCss = `
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
        font-family: Arial, sans-serif;
      `;
      document.documentElement.style.cssText += globalCss;
      document.body.style.cssText = `
        background-color: #ffffff;
        color: #000000;
        ${globalCss}
      `;
    };

    const hideElements = () => {
      const selectors = [
        'header', 'footer', '.sticky', 'input[type="text"]', '[role="search"]',
        '#newsletter-signup', 'nav', 'main > div.flex.flex-col.gap-4',
        'section.bg-google-blue'
      ];
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          el.style.display = 'none';
        }
      }
    };

    const styleCards = () => {
      const resourceCards = document.querySelectorAll('.resource-card');
      for (const card of resourceCards) {
        card.style.breakInside = 'avoid';
        card.style.border = '1px solid #e5e7eb';
        card.style.boxShadow = 'none';
        card.style.marginBottom = '20px';
        card.style.padding = '15px';

        const allText = card.querySelectorAll('*');
        for (const el of allText) {
          if (el.style) el.style.color = '#000000';
        }

        const blueButtons = card.querySelectorAll('.bg-google-blue, a.bg-google-blue');
        for (const btn of blueButtons) {
          btn.style.backgroundColor = '#1a73e8';
          btn.style.color = '#ffffff';
        }

        // Replace Compensation Icons
        const compensationContainer = card.querySelector('.flex-shrink-0.flex.items-center.gap-1');
        if (compensationContainer) {
          const hasHeart = !!compensationContainer.querySelector('.text-rose-500');
          const hasMoney = !!compensationContainer.querySelector('.text-green-500');
          let typeText = 'Donation';
          if (hasHeart && hasMoney) typeText = 'Mixed';
          else if (hasMoney) typeText = 'Payment';

          const textNode = document.createElement('div');
          textNode.textContent = `Compensation type: ${typeText}`;
          textNode.style.cssText = 'font-size: 10pt; font-weight: bold; color: #000000; white-space: nowrap;';
          compensationContainer.innerHTML = '';
          compensationContainer.appendChild(textNode);
        }
      }
    };

    const createCitationLinks = (citations, citationToRefNumber) => {
      const refs = [];
      for (const cit of citations) {
        const refNum = citationToRefNumber.get(cit.href);
        if (refNum) {
          const a = document.createElement('a');
          a.href = `#ref-${refNum}`;
          a.textContent = `[${refNum}]`;
          a.style.cssText = 'color: #000000; text-decoration: underline;';
          refs.push(a);
        }
      }
      return refs;
    };

    const createCitationContainer = (refs) => {
      const container = document.createElement('span');
      container.style.cssText = 'font-size: 0.9em; color: #000000; margin-left: 5px; font-weight: bold;';

      const label = document.createElement('span');
      label.textContent = 'Ref(s): ';
      container.appendChild(label);

      for (let i = 0; i < refs.length; i++) {
        if (i > 0) container.appendChild(document.createTextNode(' '));
        container.appendChild(refs[i]);
      }
      return container;
    };

    const updateCardCitations = (cardData, citationToRefNumber) => {
      const card = document.getElementById(cardData.cardId);
      if (!card) return;

      const btn = card.querySelector('button[aria-label*="citation"]');
      if (btn) {
        const refs = createCitationLinks(cardData.citations, citationToRefNumber);

        if (refs.length > 0) {
          const container = createCitationContainer(refs);
          if (btn.parentNode) btn.parentNode.replaceChild(container, btn);
        } else {
          btn.remove();
        }
      }
      const popover = card.querySelector('[data-headlessui-state*="open"]');
      if (popover) popover.remove();
    };

    const resolveRealUrl = (href) => {
      if (href.startsWith('#')) {
        const refEl = document.querySelector(href);
        if (refEl) {
          const externalLink = refEl.querySelector('a[href^="http"]');
          if (externalLink) {
            return externalLink.href;
          }
        }
      }
      return href;
    };

    const processCitations = (citationData) => {
      const citationList = [];
      const citationToRefNumber = new Map();

      // Build unique citation list
      for (const cardData of citationData) {
        for (const cit of cardData.citations) {
          if (!citationToRefNumber.has(cit.href)) {
            const realUrl = resolveRealUrl(cit.href);
            citationList.push({ ...cit, realUrl });
            citationToRefNumber.set(cit.href, citationList.length);
          }
        }
      }

      // Update cards with links
      for (const cardData of citationData) {
        updateCardCitations(cardData, citationToRefNumber);
      }

      // Cleanup unused buttons
      const remainingButtons = document.querySelectorAll('button[aria-label*="citation"]');
      for (const btn of remainingButtons) {
        btn.remove();
      }

      return citationList;
    };

    const injectReferencesSection = (citationList) => {
      if (citationList.length === 0) return;

      const newSection = document.createElement('section');
      newSection.id = 'references';
      newSection.className = 'w-full max-w-screen-xl mx-auto px-4 py-8 border-t mt-8';

      const title = document.createElement('h2');
      title.style.cssText = 'font-size: 16pt; font-weight: bold; margin-bottom: 15px; color: #000000;';
      title.textContent = 'References';
      newSection.appendChild(title);

      const ol = document.createElement('ol');
      ol.style.cssText = 'list-style-type: decimal; padding-left: 20px;';

      for (let i = 0; i < citationList.length; i++) {
        const item = citationList[i];
        const li = document.createElement('li');
        li.id = `ref-${i + 1}`;
        li.style.cssText = 'font-size: 11pt; color: #000000; font-weight: 500; line-height: 1.5; margin-bottom: 8px;';

        const a = document.createElement('a');
        // Use the resolved real URL (DOI) if available, otherwise fallback to cleaned href
        a.href = item.realUrl || item.href.replace('#ref-', '');
        a.target = '_blank';
        a.style.cssText = 'color: #000000; text-decoration: none;';
        a.textContent = item.text;

        li.appendChild(a);
        ol.appendChild(li);
      }
      newSection.appendChild(ol);

      const existingReferences = document.getElementById('references');
      if (existingReferences) {
        existingReferences.parentNode.replaceChild(newSection, existingReferences);
      } else {
        document.body.appendChild(newSection);
      }
    };

    const injectHeader = (logoDataUrl, date, siteUrl, doiLink, latestDoi) => {
      const headerDiv = document.createElement('div');
      headerDiv.style.cssText = `
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #000;
      `;

      const logoHtml = logoDataUrl
        ? `<img src="${logoDataUrl}" style="height: 120px; margin: 0 auto 15px auto; display: block;" alt="Yourself to Science Logo" />`
        : '';

      headerDiv.innerHTML = `
        ${logoHtml}
        <h1 style="font-size: 24pt; font-weight: bold; margin-bottom: 5px; color: #000;">
          Your<span style="color: #EAB308;">self</span> to Science
        </h1>
        <div style="font-size: 18pt; margin-bottom: 10px; color: #000;">by Mario Marcolongo</div>
        <div style="font-size: 14pt; margin-bottom: 5px; color: #000;">Building the world’s simplest way for anyone to contribute to science — starting now.</div>
        <div style="font-size: 11pt; color: #000;">
          <strong>Date:</strong> ${date} <br>
          <strong>URL:</strong> <a href="${siteUrl}" style="color: #000; text-decoration: none;">${siteUrl}</a> <br>
          <strong>DOI:</strong> <a href="${doiLink}" style="color: #000; text-decoration: none;">${latestDoi}</a>
        </div>
      `;
      document.body.insertBefore(headerDiv, document.body.firstChild);
    };

    const injectFooter = (year, siteUrl, latestDoi, date) => {
      const div = document.createElement('div');
      div.style.cssText = `
        margin-top: 50px;
        padding-top: 20px;
        border-top: 2px solid #000;
        font-size: 11pt;
        color: #000;
        page-break-inside: avoid;
      `;

      const title = "Yourself to Science™: A Comprehensive Open-Source List of Services for Contributing to Science with Your Data, Genome, Body, and More";
      const doiUrl = `https://doi.org/${latestDoi}`;

      const apa = `Marcolongo, M. (${year}). <em>${title}</em>. Yourself to Science™. ${siteUrl}. ${doiUrl}`;
      const mla = `Marcolongo, Mario. "${title}" <em>Yourself to Science™</em>, ${year}, ${siteUrl}, ${doiUrl}.`;
      const chicago = `Marcolongo, Mario. ${year}. "${title}" Yourself to Science™. Accessed ${date}. ${siteUrl}. ${doiUrl}.`;
      const bibtex = `@misc{Marcolongo_${year}_YourselfToScience,
  author = {Marcolongo, Mario},
  title = {${title}},
  year = {${year}},
  publisher = {Yourself to Science™},
  journal = {yourselftoscience.org},
  howpublished = {\\url{${siteUrl}}},
  doi = {${latestDoi}}
}`;
      const ris = `TY  - GEN
AU  - Marcolongo, Mario
PY  - ${year}
TI  - ${title}
UR  - ${siteUrl}
PB  - Yourself to Science™
DO  - ${latestDoi}
ER  -`;

      div.innerHTML = `
        <h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 15px;">How to Cite This Page</h3>
        <div style="margin-bottom: 10px;"><strong>APA:</strong><br>${apa}</div>
        <div style="margin-bottom: 10px;"><strong>MLA:</strong><br>${mla}</div>
        <div style="margin-bottom: 10px;"><strong>Chicago:</strong><br>${chicago}</div>
        <div style="margin-bottom: 10px;"><strong>BibTeX:</strong><br><pre style="margin: 5px 0; font-size: 9pt; white-space: pre-wrap;">${bibtex}</pre></div>
        <div style="margin-bottom: 10px;"><strong>RIS (for Zotero/EndNote):</strong><br><pre style="margin: 5px 0; font-size: 9pt; white-space: pre-wrap;">${ris}</pre></div>
      `;
      document.body.appendChild(div);
    };

    // --- Execution ---
    freezeDOM();
    hideElements();
    styleCards();
    const citationList = processCitations(citationDataArg);
    injectReferencesSection(citationList);
    injectHeader(logoDataUrlArg, date, siteUrl, doiLinkArg, latestDoiArg);
    injectFooter(year, siteUrl, latestDoiArg, date);

    console.log('DOM manipulation complete');
  }, currentDate, year, siteUrl, doiLink, latestDoi, citationData, logoDataUrl);

} catch (error) {
  console.error('Error during page.evaluate:', error);
  throw error;
}

// Wait for DOM to stabilize
await new Promise(r => setTimeout(r, 2000));

// --- Generate PDF ---
const pdfPath = path.join(__dirname, '..', 'public', 'yourselftoscience.pdf');
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20mm',
    right: '10mm',
    bottom: '20mm',
    left: '10mm'
  },
  displayHeaderFooter: true,
  headerTemplate: `
    <div style="width: 100%; font-size: 9pt; padding: 0 10mm; text-align: right; color: #666; font-family: Arial, sans-serif; border-bottom: 1px solid #ddd; margin-bottom: 5px;">
      <span style="float: left; font-weight: bold;">Yourself to Science</span>
      <span>${siteUrl}</span>
    </div>
  `,
  footerTemplate: `
    <div style="width: 100%; font-size: 7pt; padding: 0 10mm; text-align: center; color: #666; font-family: Arial, sans-serif;">
      <div style="margin-bottom: 2px;">
        © 2024–${year} Yourself to Science™ (also You2Science™). Some Rights Reserved. This work is licensed under a 
        <span style="display: inline-flex; align-items: center; margin-right: 5px; vertical-align: middle;">
          <svg viewBox="0 0 640 640" style="height: 10px; width: 10px; margin-right: 2px;"><path fill="#666" d="M317.8 278.9L284.6 296.2C275.2 276.6 259.4 276.3 257.1 276.3C235 276.3 223.9 290.9 223.9 320.1C223.9 343.7 233.1 363.9 257.1 363.9C271.6 363.9 281.7 356.8 287.7 342.6L318.3 358.1C312.1 369.6 292.6 397.1 253.2 397.1C230.6 397.1 179.2 386.8 179.2 320.1C179.2 261.4 222.2 243 251.8 243C282.5 243 304.5 254.9 317.8 278.9zM460.8 278.9L428 296.2C418.5 276.4 402.3 276.3 400.1 276.3C378 276.3 366.9 290.9 366.9 320.1C366.9 343.6 376.1 363.9 400.1 363.9C414.5 363.9 424.7 356.8 430.6 342.6L461.6 358.1C459.5 361.9 440.2 397.1 396.5 397.1C373.8 397.1 322.5 387.2 322.5 320.1C322.5 261.4 365.5 243 395.1 243C425.8 243 447.7 254.9 460.7 278.9zM319.6 72C176.7 72 72 187.1 72 320.1C72 458.5 185.6 568.1 319.6 568.1C449.5 568.1 568 467.2 568 320.1C568 182.2 461.4 72 319.6 72zM320.5 522.8C208 522.8 116.8 429.8 116.8 320C116.8 214.6 202.2 116.7 320.5 116.7C433 116.7 523.3 206.2 523.3 320C523.3 441.7 423.6 522.8 320.5 522.8z"/></svg>
          <svg viewBox="0 0 640 640" style="height: 10px; width: 10px; margin-right: 2px;"><path fill="#666" d="M386.9 258.4L386.9 359.8L358.6 359.8L358.6 480.3L281.5 480.3L281.5 359.9L253.2 359.9L253.2 258.4C253.2 254 254.8 250.2 257.8 247.1C260.9 244 264.7 242.4 269.1 242.4L371 242.4C375.1 242.4 378.8 244 382.1 247.1C385.2 250.3 386.9 254 386.9 258.4zM354.4 193.9C354.6 213 339.4 228.6 320.3 228.8C301.2 229 285.6 213.8 285.4 194.7C285.2 175.6 300.4 160 319.5 159.8C338.6 159.6 354.2 174.8 354.4 193.9zM319.6 72C461.4 72 568 182.1 568 320C568 467.1 449.5 568 319.6 568C185.6 568 72 458.5 72 320C72 187.1 176.7 72 319.6 72zM320.4 116.7C202.2 116.7 116.7 214.6 116.7 320C116.7 429.8 207.9 522.8 320.4 522.8C423.6 522.8 523.2 441.7 523.2 320C523.3 206.2 433 116.7 320.4 116.7z"/></svg>
          <svg viewBox="0 0 640 640" style="height: 10px; width: 10px;"><path fill="#666" d="M319.6 72C461.4 72 568 182.1 568 320C568 467.1 449.5 568 319.6 568C185.6 568 72 458.5 72 320C72 187.1 176.7 72 319.6 72zM320.4 116.7C202.2 116.7 116.7 214.6 116.7 320C116.7 429.8 207.9 522.8 320.4 522.8C423.6 522.8 523.2 441.7 523.2 320C523.3 206.2 433 116.7 320.4 116.7zM209.7 285C222.7 201.1 290.2 189.3 318.6 189.3C418.4 189.3 446.1 271.8 446.1 323.5C446.1 387.1 405.1 456.4 317.2 456.4C278.3 456.4 218.1 436.4 207.8 359.4L270.3 359.4C271.8 389.5 289.9 404.6 324.8 404.6C348.1 404.6 382.8 386.4 382.8 321.8C382.8 239.3 333.7 241.2 326.1 241.2C293 241.2 274.4 255.8 270.3 285L288.5 285L239.3 334.2L190.3 285L209.7 285z"/></svg>
        </span>
        <a href="https://yourselftoscience.org/license/content" style="color:#666; text-decoration:none;">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
      </div>
      <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
    </div>
  `
});

console.log(`PDF output written to ${pdfPath}`);
await browser.close();