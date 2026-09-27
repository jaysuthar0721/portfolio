const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert/strict');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const server = http.createServer((req,res) => {
  const file = path.join(root, new URL(req.url,'http://localhost').pathname);
  fs.readFile(file,(e,data) => {res.writeHead(e?404:200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});res.end(e?'':data);});
});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser = await chromium.launch({channel:'msedge',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:900}});
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.addInitScript(()=>{
   window.timings=[];
   const raf=window.requestAnimationFrame;
   window.requestAnimationFrame=callback=>raf.call(window,time=>{const start=performance.now();callback(time);window.timings.push(performance.now()-start);});
 });
 const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base+'/about.html');
 await page.locator('.theme-toggle').focus(); await page.keyboard.press('Enter');
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 assert.equal(await page.locator('.theme-toggle').getAttribute('aria-label'),'Switch to light mode');
 for(let i=0;i<=60;i++) {
   await page.evaluate(p=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*p),i/60);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 }
 await page.waitForFunction(()=>document.querySelector('.climb-readout').textContent==='ALT 400 KM');
 // Image/content reflow and viewport changes must refresh cached scroll range.
 await page.evaluate(()=>{const p=document.createElement('div');p.id='test-growth';p.style.height='1000px';document.querySelector('main').append(p);});
 await page.waitForFunction(()=>document.querySelector('.climb-readout').textContent!=='ALT 400 KM');
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 await page.waitForFunction(()=>document.querySelector('.climb-readout').textContent==='ALT 400 KM');
 await page.evaluate(()=>document.querySelector('#test-growth').remove());
 await page.emulateMedia({forcedColors:'active'});
 assert.equal(await page.locator('.climb').isVisible(),false);
 assert.equal(await page.locator('.climb-readout').isVisible(),false);
 await page.emulateMedia({forcedColors:'none',media:'print'});
 assert.equal(await page.locator('.climb').isVisible(),false);
 await page.emulateMedia({media:'screen'});
 // History restoration must recompute progress using the restored scroll offset.
 await page.evaluate(()=>scrollTo(0,700));
 await page.goto(base+'/leadership.html'); await page.goBack();
 await page.waitForFunction(()=>Math.abs(parseInt(document.querySelector('.climb-readout').textContent.slice(4))-Math.round(scrollY/(document.documentElement.scrollHeight-innerHeight)*400))<=1);
 const timing=await page.evaluate(()=>({count:timings.length,max:Math.max(...timings),mean:timings.reduce((a,b)=>a+b,0)/timings.length}));
 console.log(JSON.stringify({pass:true,checks:['keyboard theme toggle','content reflow','viewport resize','forced colors','print','history restoration'],frameCallbackMs:timing}));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
