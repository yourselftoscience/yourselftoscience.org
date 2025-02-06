const { exec } = require('child_process');
const chokidar = require('chokidar');

// Watch for changes in src folder (adjust glob as needed)
const watcher = chokidar.watch('./src/**/*', { ignoreInitial: true });

watcher.on('all', (event, pathChanged) => {
  console.log(`File ${pathChanged} ${event}. Updating HTML version...`);
  exec('node scripts/updateHtmlPage.js', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error updating HTML: ${stderr}`);
    } else {
      console.log(stdout);
    }
  });
});

console.log('Watching for source code changes...');