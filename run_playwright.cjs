const { chromium } = require('playwright');
const OUTPUT_DIR = 'C:/Users/白东鑫/work01/SoloCoder/6025-svgMap';

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
  page.setDefaultTimeout(60000);

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => { errors.push('PAGE_ERROR: ' + err.message); });

  await page.goto('http://127.0.0.1:8102/test-r2.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);

  // Detailed analysis
  const analysis = await page.evaluate(() => {
    const result = {};

    // Check section 1 - Legend with thousandSeparator
    result.section1 = (() => {
      const container = document.querySelectorAll('.demo-container')[0];
      const targetDiv = container.querySelector('#svgMapLegendTest');
      const inner = targetDiv ? targetDiv.innerHTML.substring(0, 300) : 'NO TARGET DIV';
      const hasLegend = container.querySelectorAll('.svgMap-legend').length > 0;
      const hasMap = container.querySelectorAll('.svgMap-map-wrapper').length > 0;
      const hasError = container.textContent.includes('Error');
      return { hasLegend, hasMap, hasError, targetDivInner: inner };
    })();

    // Check the GDP data structure
    result.gdpData = (() => {
      if (typeof svgMapDataGPD !== 'object') return 'undefined';
      return {
        dataKeys: Object.keys(svgMapDataGPD.data || {}),
        hasGDPperCapita: 'GDP per capita' in (svgMapDataGPD.data || {}),
        hasGdpKey: 'gdp' in (svgMapDataGPD.data || {}),
        dataKeysActual: Object.keys(svgMapDataGPD.data)
      };
    })();

    // Check what svgMap constructed in each section
    result.sections = Array.from(document.querySelectorAll('.demo-container')).map((c, i) => {
      const wrapper = c.querySelector('.svgMap-wrapper');
      return {
        index: i + 1,
        heading: c.querySelector('h2')?.textContent,
        hasLegend: c.querySelectorAll('.svgMap-legend').length > 0,
        hasMapWrapper: c.querySelectorAll('.svgMap-map-wrapper').length > 0,
        countryCount: c.querySelectorAll('.svgMap-country').length,
        svgCount: c.querySelectorAll('svg').length,
        hasContainer: !!c.querySelector('.svgMap-container'),
        wrapperExists: !!wrapper,
        wrapperHTML: wrapper ? wrapper.innerHTML.substring(0, 100) : 'none'
      };
    });

    return result;
  });

  console.log('Analysis:', JSON.stringify(analysis, null, 2));

  errors.forEach(e => console.log('ERROR:', e.substring(0, 300)));

  // Take screenshots
  await page.screenshot({ path: OUTPUT_DIR + '/screenshot_R2.png', fullPage: true });

  const names = {
    1: 'screenshot_R2_1_legend',
    2: 'screenshot_R2_2_clusters',
    3: 'screenshot_R2_3_tooltips',
    4: 'screenshot_R2_4_logscale',
    5: 'screenshot_R2_5_toggle'
  };
  for (const [idx, name] of Object.entries(names)) {
    const el = await page.evaluateHandle(i => {
      return document.querySelectorAll('.demo-container')[parseInt(i) - 1];
    }, idx);
    if (el && el.asElement()) {
      await el.asElement().screenshot({ path: OUTPUT_DIR + '/' + name + '.png' });
    }
  }
  console.log('\nScreenshots saved');

  await browser.close();
  console.log('Done');
})();
