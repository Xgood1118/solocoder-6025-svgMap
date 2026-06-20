const { chromium } = require('playwright');
(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  console.log('Trying google.com...');
  try {
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('google.com loaded OK');
  } catch(e) {
    console.log('google.com failed:', e.message.substring(0, 100));
  }
  console.log('Trying about:blank...');
  await page.goto('about:blank', { timeout: 10000 });
  console.log('about:blank loaded');
  await browser.close();
  console.log('Done');
})();
