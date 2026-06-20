const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--proxy-server=""']
  });
  const page = await browser.newPage();

  // Try with the server that should be running on 8101
  console.log('Trying 127.0.0.1:8101...');
  try {
    await page.goto('http://127.0.0.1:8101/test-r2.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('SUCCESS: page loaded');
    const title = await page.title();
    console.log('Title:', title);
  } catch(e) {
    console.log('FAILED:', e.message.substring(0, 200));
  }

  // Try localhost
  console.log('Trying localhost:8101...');
  try {
    await page.goto('http://localhost:8101/test-r2.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('SUCCESS with localhost');
  } catch(e) {
    console.log('FAILED:', e.message.substring(0, 200));
  }

  // Try what the browser thinks about proxy
  console.log('Checking browser proxy config...');
  const proxyInfo = await page.evaluate(() => navigator.userAgent);
  console.log('UA:', proxyInfo.substring(0, 50));

  await browser.close();
  console.log('Done');
})();
