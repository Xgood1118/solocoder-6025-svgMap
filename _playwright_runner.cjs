
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

  console.log('Navigating to http://127.0.0.1:8101/test-r2.html ...');
  await page.goto('http://127.0.0.1:8101/test-r2.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('Page loaded, waiting for SVG...');
  await page.waitForTimeout(5000);

  // Full page screenshot
  await page.screenshot({ path: 'C:/Users/白东鑫/work01/SoloCoder/6025-svgMap/screenshot_R2.png', fullPage: true });
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
      await el.screenshot({ path: 'C:/Users/白东鑫/work01/SoloCoder/6025-svgMap/' + name + '.png' });
      console.log('SECTION ' + name + ' saved');
    } else {
      console.log('SECTION ' + idx + ' MISSING');
    }
  }

  await browser.close();
  console.log('All done');
})();
