const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = process.env.CLIMB_ARTIFACTS || path.join(require('os').tmpdir(), 'portfolio-climb-checks');
fs.mkdirSync(output, { recursive: true });
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {res.writeHead(err ? 404 : 200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}); res.end(err ? '' : data);});
});
let browser;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({channel:'msedge', headless:true});
  const base = `http://127.0.0.1:${server.address().port}`;
  const results = [];
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({viewport:{width,height:900}});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Count writes and scheduled frames, including any accidental idle loop.
    await page.addInitScript(() => {
      window.__frames = 0;
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = cb => {window.__frames++; return raf.call(window, cb);};
    });
    for (const route of ['index','about','projects','leadership']) {
      await page.goto(`${base}/${route}.html`);
      await page.waitForTimeout(300);
      for (const theme of ['light','dark']) {
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        for (const progress of [0,.5,1]) {
          await page.evaluate(p => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * p), progress);
          await page.waitForFunction(p => Math.abs(parseInt(document.querySelector('.climb-readout').textContent.slice(4), 10) - Math.round(p * 400)) <= 1, progress);
          const state = await page.evaluate(() => ({
            alt:document.querySelector('.climb-readout').textContent,
            flow:+getComputedStyle(document.querySelector('.climb-flow')).opacity,
            orbit:+getComputedStyle(document.querySelector('.climb-orbit')).opacity,
            overflow:document.documentElement.scrollWidth > innerWidth,
            pointer:getComputedStyle(document.querySelector('.climb')).pointerEvents,
            hidden:document.querySelector('.climb').getAttribute('aria-hidden'),
            nav:document.querySelector('.nav').getBoundingClientRect().bottom,
            readout:document.querySelector('.climb-readout').getBoundingClientRect().top,
            count:document.querySelectorAll('.climb').length,
            animations:document.getAnimations().length
          }));
          assert.equal(state.overflow,false,`${route}/${width} horizontal overflow`);
          assert.equal(state.pointer,'none'); assert.equal(state.hidden,'true'); assert.equal(state.count,1);
          assert.equal(state.animations,0); assert.ok(state.readout < state.nav);
          if (progress === 0) {assert.equal(state.alt,'ALT 000 KM'); assert.equal(state.orbit,0);}
          if (progress === 1) {assert.equal(state.alt,'ALT 400 KM'); assert.equal(state.flow,0); assert.equal(state.orbit,1);}
          if (width !== 320 && route === 'index') await page.screenshot({path:path.join(output,`${route}-${width}-${theme}-${progress}.png`)});
          results.push({route,width,theme,progress,...state});
        }
      }
      const frames = await page.evaluate(() => window.__frames);
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => window.__frames),frames,'No idle frames');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(() => document.querySelector('.climb').style.getPropertyValue('--orbit') === '0.0000');
      const before = await page.locator('.climb').getAttribute('style');
      await page.evaluate(() => window.scrollTo(0,0));
      await page.waitForTimeout(100);
      assert.equal(await page.locator('.climb').getAttribute('style'),before,'Reduced motion remains static');
      assert.equal(await page.locator('.climb-readout').isVisible(),false);
      await page.emulateMedia({reducedMotion:'no-preference'});
      if (route === 'projects') {
        await page.locator('[data-project]').first().click();
        assert.equal(await page.locator('#project-dialog').isVisible(),true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#project-dialog').isVisible(),false);
      }
    }
    assert.deepEqual(errors,[]);
    await context.close();
  }
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage(); await page.goto(`${base}/index.html`);
  assert.ok(await page.locator('h1').isVisible());
  await browser.close();
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
  console.log(`PASS: ${results.length} route/viewport/theme/scroll combinations; reduced motion, idle frames, dialogs, no-JS, no errors.`);
})().catch(e => {console.error(e);process.exitCode=1;}).finally(async () => { if (browser) await browser.close(); server.close(); });
