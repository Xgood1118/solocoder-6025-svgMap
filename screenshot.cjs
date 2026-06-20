const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8101;
const HTML_DIR = 'C:/Users/白东鑫/work01/SoloCoder/6025-svgMap/demo/html';
const OUTPUT_DIR = 'C:/Users/白东鑫/work01/SoloCoder/6025-svgMap';

function startServer() {
  return new Promise((resolve, reject) => {
    const mime = {
      '.html': 'text/html', '.js': 'application/javascript',
      '.css': 'text/css', '.json': 'application/json',
      '.svg': 'image/svg+xml', '.png': 'image/png'
    };
    const server = http.createServer((req, res) => {
      let fp = path.join(HTML_DIR, req.url === '/' ? 'test-r2.html' : req.url);
      const ext = path.extname(fp);
      fs.readFile(fp, (e, d) => {
        if (e) { res.writeHead(404); res.end('Not found'); }
        else { res.writeHead(200, { 'Content-Type': mime[ext] || 'text/html' }); res.end(d); }
      });
    });
    server.listen(PORT, '127.0.0.1', () => {
      console.log('Server on http://127.0.0.1:' + PORT);
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function main() {
  const server = await startServer();

  const pwCode = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    bypassCSP: true,
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Set timeout higher
  page.setDefaultTimeout(60000);

  console.log('Navigating to http://127.0.0.1:${PORT}/test-r2.html ...');
  await page.goto('http://127.0.0.1:${PORT}/test-r2.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('Page loaded, waiting for SVG...');
  await page.waitForTimeout(5000);

  // Full page screenshot
  await page.screenshot({ path: '${OUTPUT_DIR.replace(/\\\\/g, '/')}/screenshot_R2.png', fullPage: true });
  console.log('FULL: screenshot_R2.png saved');

  // Check rendered features
  const featureChecks = await page.evaluate(() => {
    return {
      legends: document.querySelectorAll('.svgMap-legend').length,
      mapContainers: document.querySelectorAll('.svgMap-map-container').length,
      countryPaths: document.querySelectorAll('.svgMap-country').length,
      mapWrappers: document.querySelectorAll('.svgMap-map-wrapper').length,
      svgInMap: document.querySelectorAll('.svgMap-map-wrapper svg').length,
      containers: document.querySelectorAll('.demo-container').length
    };
  });
  console.log('Features:', JSON.stringify(featureChecks));

  // Section screenshots
  const headingFiles = {
    1: 'screenshot_R2_1_legend',
    2: 'screenshot_R2_2_clusters',
    3: 'screenshot_R2_3_tooltips',
    4: 'screenshot_R2_4_logscale',
    5: 'screenshot_R2_5_toggle'
  };
  for (const [idx, name] of Object.entries(headingFiles)) {
    const containers = document.querySelectorAll('.demo-container');
    const el = containers[parseInt(idx) - 1];
    if (el) {
      await el.screenshot({ path: '${OUTPUT_DIR.replace(/\\\\/g, '/')}/' + name + '.png' });
      console.log('SECTION ' + name + ' saved');
    } else {
      console.log('SECTION ' + idx + ' MISSING');
    }
  }

  await browser.close();
  console.log('All done');
})();
`;

  const pwScriptPath = OUTPUT_DIR + '/_playwright_runner.cjs';
  fs.writeFileSync(pwScriptPath, pwCode);
  console.log('Running Playwright...');

  try {
    const output = execSync('node ' + pwScriptPath, {
      timeout: 120000,
      env: { ...process.env, NO_PROXY: '127.0.0.1,localhost', PATH: process.env.PATH },
      stdio: 'pipe',
      maxBuffer: 50 * 1024 * 1024
    });
    console.log('OUTPUT:', output.toString());
  } catch (e) {
    console.log('ERROR:', e.message);
    if (e.stdout) console.log('STDOUT:', e.stdout.toString());
    if (e.stderr) console.log('STDERR:', e.stderr.toString());
  }

  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith('screenshot_R2'));
  console.log('Screenshots:', files.join(', '));

  server.close();
  console.log('Done');
}

main().catch(e => { console.error('MAIN ERROR:', e); process.exit(1); });
