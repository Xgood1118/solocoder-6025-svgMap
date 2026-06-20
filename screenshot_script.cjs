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
    server.listen(PORT, () => {
      console.log(`Server on http://localhost:${PORT}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function main() {
  const server = await startServer();

  // Generate Playwright script
  const pwScript = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:${PORT}/test-r2.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Full page screenshot
  await page.screenshot({ path: '${OUTPUT_DIR.replace(/\\/g, '/')}/screenshot_R2.png', fullPage: true });
  console.log('screenshot_R2.png saved');

  // Try section selectors common in svgMap
  const sections = {
    'screenshot_R2_1_legend': ['.svgMap-legend', '.legend', '[class*=legend]'],
    'screenshot_R2_2_clusters': ['.svgMap-cluster', '.cluster', '[class*=cluster]', '.svgMap-pin', '.pin'],
    'screenshot_R2_3_tooltips': ['.svgMap-tooltip', '.tooltip', '[class*=tooltip]']
  };

  for (const [name, sels] of Object.entries(sections)) {
    let found = false;
    for (const sel of sels) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.screenshot({ path: '${OUTPUT_DIR.replace(/\\/g, '/')}/' + name + '.png' });
          console.log(name + ' saved via selector: ' + sel);
          found = true;
          break;
        }
      } catch(e) {}
    }
    if (!found) {
      console.log(name + ': none of ' + sels.join(', ') + ' found on page');
    }
  }

  await browser.close();
  console.log('Done capturing');
})();
`;

  const scriptPath = OUTPUT_DIR + '/_playwright_screenshot.cjs';
  fs.writeFileSync(scriptPath, pwScript);
  console.log('Running Playwright screenshot script...');

  try {
    const output = execSync('node ' + scriptPath, {
      timeout: 90000,
      env: { ...process.env, NO_PROXY: 'localhost' },
      stdio: 'pipe'
    });
    console.log('Output:', output.toString());
  } catch(e) {
    console.log('Error:', e.stderr ? e.stderr.toString() : e.message);
    if (e.stdout) console.log('stdout:', e.stdout.toString());
  }

  // List screenshots
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith('screenshot_R2'));
  console.log('Screenshots found:', files.join(', '));

  server.close();
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
