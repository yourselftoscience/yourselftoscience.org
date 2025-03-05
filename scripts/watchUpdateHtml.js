const { exec } = require('child_process');
const chokidar = require('chokidar');

console.log('Starting watch...');

// Set polling options from environment variables if provided.
const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true' || true;
const interval = Number(process.env.CHOKIDAR_INTERVAL) || 300;

const watcher = chokidar.watch('./src/**/*', {
  ignoreInitial: true,
  usePolling,             // Enable polling for containerized environments
  interval,               // Set polling interval (default: 300)
  useFsEvents: false,     // Disable native fs events for better reliability
  awaitWriteFinish: {     // Wait for file writes to finish before triggering event
    pollInterval: 100,
    stabilityThreshold: 1000
  }
});

// Additional debug logs to confirm file events
watcher
  .on('add', path => console.log(`File added: ${path}`))
  .on('change', path => console.log(`File changed: ${path}`))
  .on('unlink', path => console.log(`File removed: ${path}`))
  .on('error', error => console.error(`Watcher error: ${error}`));

watcher.on('all', (event, pathChanged) => {
  console.log(`Detected ${event} on file ${pathChanged}`);
  console.log('Running Puppeteer to update .html...');
  exec('node scripts/updateHtmlPage.js', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error updating HTML: ${stderr}`);
    } else {
      console.log(stdout);
    }
  });
});

console.log('Watching for source code changes...');