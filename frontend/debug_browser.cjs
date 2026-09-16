const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Scroll a bunch of times
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(r => setTimeout(r, 500));
  }
  
  const visibility = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.fade-up')).map(el => el.classList.contains('visible'));
  });
  console.log("VISIBILITY:", visibility);

  await browser.close();
})();
