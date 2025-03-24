const { execSync } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

console.log('Starting watch for PDF updates...');

// Function to generate PDF - using synchronous execution for simplicity
function generatePdf() {
  console.log(`[${new Date().toISOString()}] Running Puppeteer to update PDF...`);
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'updatePdfPage.js');
  
  if (!fs.existsSync(scriptPath)) {
    console.error(`Error: Script not found at ${scriptPath}`);
    return;
  }
  
  try {
    // Force process to run synchronously to avoid overlapping executions
    const output = execSync(`node "${scriptPath}"`, { encoding: 'utf8' });
    console.log(output);
    console.log('PDF generation completed successfully');
  } catch (error) {
    console.error(`Error generating PDF: ${error.message}`);
  }
}

// Generate the PDF once at startup
console.log('Generating initial PDF...');
generatePdf();

// Improved file watcher settings balanced for containerized environments
const watcher = chokidar.watch(['./src/**/*', './scripts/**/*'], {
  ignored: ['**/node_modules/**', '**/public/yourselftoscience.pdf', '**/.git/**', '**/.next/**'],
  ignoreInitial: true,
  usePolling: true,             // Needed for containerized environments
  interval: 1000,               // Check every second
  awaitWriteFinish: {           // Wait for file write to finish before triggering
    stabilityThreshold: 500,    // Wait for 500ms of stability
    pollInterval: 100           // Poll every 100ms during this waiting period
  },
  persistent: true
});

// Debounce function to prevent multiple rapid rebuilds
let debounceTimeout;
const debounceDelay = 1000; // 1 second debounce

function debouncedGeneratePdf() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    generatePdf();
  }, debounceDelay);
}

// Enhanced event handling with better logging
watcher
  .on('add', path => {
    console.log(`File added: ${path}`);
    debouncedGeneratePdf();
  })
  .on('change', path => {
    console.log(`File changed: ${path}`);
    debouncedGeneratePdf();
  })
  .on('unlink', path => console.log(`File removed: ${path}`))
  .on('error', error => console.error(`Watcher error: ${error}`));

console.log('Watching for source code and script changes to update PDF...');