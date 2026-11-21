/* FietsCheck smoke tests. Run: node tests/smoke.js  (needs the "playwright" package and Chromium) */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
let failed = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) failed++; };

(async () => {
  const browser = await chromium.launch();
  for (const width of [320, 390, 768]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('fc_onb', '1'));
    await page.goto(URL);
    await page.waitForTimeout(700);
    ok(errors.length === 0, `${width}px: no script errors ${errors.join(' | ')}`);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= width, `${width}px: no sideways scroll (${sw})`);
    for (const tab of ['garage', 'shops', 'prices', 'check']) {
      await page.click(`[data-tab="${tab}"]`);
      await page.waitForTimeout(250);
    }
    ok(errors.length === 0, `${width}px: all tabs open without errors`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('fc_onb', '1'));
  await page.goto('file://' + path.resolve(__dirname, '..', 'privacy.html'));
  await page.goto(URL);
  await page.waitForTimeout(700);

  // Brake check: split symptoms and back-pedal brake exist
  await page.click('.dot[data-part="brakes"]', { force: true });
  await page.waitForTimeout(1000);
  const opts = await page.$$eval('#sheet .opt', a => a.map(x => x.textContent.trim()));
  ok(opts.some(t => /squeal, but stop fine/i.test(t)), 'brakes: squeal-only option exists');
  ok(opts.some(t => /back-pedal/i.test(t)), 'brakes: back-pedal brake option exists');

  // Android back closes the sheet and stays in the app
  await page.goBack();
  await page.waitForTimeout(600);
  ok(page.url().endsWith('index.html'), 'back button closes sheet without leaving the app');
  ok(!(await page.evaluate(() => document.getElementById('sheet').classList.contains('on'))), 'sheet is closed after back');

  // Warranty helper: two steps
  await page.click('#whOpenBtn');
  await page.waitForTimeout(500);
  await page.selectOption('#whBrand', 'cowboy');
  await page.fill('#whDate', '2025-06-01');
  await page.click('#whCheck');
  await page.waitForTimeout(400);
  ok(/Cowboy/.test(await page.textContent('#whRes')), 'warranty: check shows a result');
  await page.click('#whGo');
  await page.waitForTimeout(300);
  ok(/hello@cowboy\.com/.test(await page.textContent('#whRes')), 'warranty: shows the Cowboy support address');
  ok(!!(await page.$('#whMail')), 'warranty: claim email is written');
  await page.goBack();
  await page.waitForTimeout(500);

  // Bike advisor with a typed budget
  await page.click('#baOpenBtn');
  await page.waitForTimeout(500);
  await page.click('#baUse [data-v="daily"]');
  await page.click('#baE [data-v="no"]');
  await page.fill('#baBudget', '650');
  await page.click('#baGo');
  await page.waitForTimeout(2200);
  const prices = await page.$$eval('#baOut .bacard .baprice', a => a.map(x => x.textContent));
  ok(prices.length === 3, 'advisor: shows 3 top picks');
  const nums = prices.map(t => parseFloat(t.replace(/[^0-9.]/g, '')));
  ok(nums.every(n => n <= 650 || /month/.test(prices.join(''))), 'advisor: picks stay within the typed budget');
  const brands = await page.$$eval('#baOut .bacard .babrand', a => a.map(x => x.textContent));
  ok(new Set(brands).size === brands.length, 'advisor: top picks are different brands');

  // Motion: camera push resets after closing
  ok((await page.getAttribute('#bike', 'viewBox')) === '0 0 480 303.4', 'motion: bike zoom resets after the sheet closes');

  // Theme toggle persists
  await page.goBack();
  await page.waitForTimeout(500);
  await page.click('#themeBtn');
  await page.waitForTimeout(800);
  await page.click('#themeBtn');
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForTimeout(500);
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'theme: dark mode is remembered');

  ok(errors.length === 0, 'no script errors during flows ' + errors.join(' | '));
  await browser.close();
  console.log(failed ? `\n${failed} test(s) failed` : '\nAll tests passed');
  process.exit(failed ? 1 : 0);
})();
