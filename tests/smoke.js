/* FietsCheck smoke tests. Run: node tests/smoke.js  (needs the "playwright" package and Chromium) */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
let failed = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) failed++; };

// Free-text matcher: run the real guided() from index.html (no browser needed)
(() => {
  const fs = require('fs'), vm = require('vm');
  const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
  const faults = src.slice(src.indexOf('const FAULTS={'), src.indexOf('const byPart='));
  const gs = src.indexOf('function guided(');
  const guided = src.slice(gs, src.indexOf('\n}\n', gs) + 2);
  const ctx = {};
  vm.runInNewContext(faults + "\nconst byPart=p=>IDS.filter(id=>FAULTS[id].part===p);\nconst S={part:'other',local:true};\n" + guided + '\nthis.guided=guided;', ctx);
  const cases = [
    // phrases the matcher used to get wrong
    ['my chain keeps falling off', 'chain_dry'],
    ['chain came off', 'chain_dry'],
    ['no problem with brakes, light is broken', 'light_fail'],
    ['breaks dont work', 'brake_pads'],
    ['e-bike battery dies fast', 'ebike_issue'],
    ['gears slipping', 'gear_adjust'],
    // phrases that already worked and must keep working
    ['brakes are fine but the chain squeaks', 'chain_dry'],
    ['I have no brakes', 'brake_pads'],
    ['flat tyre', 'flat_tyre'],
    ['lekke band', 'flat_tyre'],
    ['mijn remmen doen het niet', 'brake_pads'],
    ['ketting valt eraf', 'chain_dry'],
    ['licht doet het niet', 'light_fail'],
    ['motor not working', 'ebike_issue'],
    ['asdfgh', 'unsure'],
  ];
  for (const [text, want] of cases) {
    const got = ctx.guided(text, null).id;
    ok(got === want, `matcher: "${text}" -> ${want}` + (got === want ? '' : ` (got ${got})`));
  }
})();

(async () => {
  const browser = await chromium.launch();
  for (const width of [320, 390, 768]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('fc_onb', '1'));
    await page.goto(URL);
    await page.waitForFunction(() => document.getElementById('intro').hidden, null, { timeout: 8000 });
    await page.waitForTimeout(300);
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
  await page.waitForFunction(() => document.getElementById('intro').hidden, null, { timeout: 8000 });
  await page.waitForTimeout(300);

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

  // Start-up intro: full on first visit, short at most once a day after that
  {
    const visit = async (init) => {
      const pg = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await pg.addInitScript(init);
      await pg.goto(URL);
      const played = await pg.evaluate(() => !document.getElementById('intro').hidden);
      const day = await pg.evaluate(() => localStorage.getItem('fc_intro_day'));
      await pg.close();
      return { played, day };
    };
    const first = await visit(() => { localStorage.removeItem('fc_onb'); localStorage.removeItem('fc_intro_day'); });
    ok(first.played, 'intro: plays on the first visit');
    const sameDay = await visit(() => { localStorage.setItem('fc_onb', '1'); localStorage.setItem('fc_intro_day', new Date().toDateString()); });
    ok(!sameDay.played, 'intro: skipped when it already played today');
    const nextDay = await visit(() => { localStorage.setItem('fc_onb', '1'); localStorage.setItem('fc_intro_day', 'Mon Jan 01 2001'); });
    ok(nextDay.played && nextDay.day === new Date().toDateString(), 'intro: short intro plays once on a new day');
  }

  // Theme toggle persists
  await page.goBack();
  await page.waitForTimeout(500);
  const themeIs = v => page.waitForFunction(x => (document.documentElement.dataset.theme || 'auto') === x, v, { timeout: 4000 }).then(() => true).catch(() => false);
  for (const want of ['light', 'dark']) {
    for (let i = 0; i < 3; i++) { await page.click('#themeBtn'); if (await themeIs(want)) break; }
    await page.waitForTimeout(700);
  }
  await page.reload();
  await page.waitForFunction(() => document.getElementById('intro').hidden, null, { timeout: 8000 });
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'theme: dark mode is remembered');

  ok(errors.length === 0, 'no script errors during flows ' + errors.join(' | '));
  await browser.close();
  console.log(failed ? `\n${failed} test(s) failed` : '\nAll tests passed');
  process.exit(failed ? 1 : 0);
})();
