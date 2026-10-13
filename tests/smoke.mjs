import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Browser smoke test for the built site (_site/ on a local server in CI).
// LOCAL_URL: the local copy (default http://127.0.0.1:8080/). LIVE_URL: optional; the live target is skipped when it is unset or empty.
// Writes artifacts/results.json as {note, results:[{target, status, error?, ...}]}, plus screenshots and traces.
await fs.mkdir('artifacts',{recursive:true});
const targets=[['repository',process.env.LOCAL_URL||'http://127.0.0.1:8080/']];
const live=(process.env.LIVE_URL||'').trim();
if(live)targets.push(['live-pages',live]);

// Chapter pages in guided order: [file, <body data-chapter>, header number, previous link, next link].
const CHAPTERS=[
  ['setup.html','setup','00',null,'./index.html#first'],
  ['sampling.html','sampling','07','./index.html#song','./perform.html'],
  ['perform.html','perform','08','./sampling.html','./hiphop.html'],
  ['hiphop.html','hiphop','09','./perform.html','./tech-house.html'],
  ['tech-house.html','tech-house','10','./hiphop.html','./thodorakis-house.html'],
  ['thodorakis-house.html','vocal-house','11','./tech-house.html',null]
];
const VIEWS=[['first','#step-title'],['song','#song-title'],['manual','[data-lesson]'],['controls','[data-control]'],['lab','#beat'],['help','#search']];

const browser=await chromium.launch({headless:true});
const results=[];

// Collects uncaught exceptions, console errors, chapter.js markup warnings and failed same-origin requests.
function watch(page,base,errors,badAssets){
  const origin=new URL(base).origin;
  page.on('pageerror',e=>errors.push(`${page.url()}: ${e}`));
  page.on('console',m=>{
    if(m.type()==='error'||(m.type()==='warning'&&m.text().startsWith('chapter.js')))errors.push(`${page.url()}: console.${m.type()}: ${m.text()}`);
  });
  page.on('response',r=>{
    const u=new URL(r.url());
    if(u.origin===origin&&r.status()>=400&&u.pathname!=='/favicon.ico')badAssets.push({url:r.url(),status:r.status()});
  });
}
const noOverflow=async(page,where)=>{
  const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,w:window.innerWidth}));
  assert.ok(m.sw<=m.w,`${where}: page is ${m.sw}px wide in a ${m.w}px window (horizontal scrolling)`);
};
const currentView=page=>page.locator('nav [data-view][aria-current="page"]').first().getAttribute('data-view');
// Opens index.html#view as a fresh page load (as if typed into the address bar) and waits for that view.
const openView=async(page,url,v)=>{
  await page.goto('about:blank');
  await page.goto(new URL('./index.html#'+v,url).href,{waitUntil:'networkidle'});
  await page.locator(`nav [data-view="${v}"][aria-current="page"]`).waitFor({state:'attached'});
};

try{
  for(const [name,url] of targets){
    const base=new URL(url);
    const abs=href=>new URL(href,base).href;
    const errors=[],badAssets=[];
    const result={target:name,url,checks:[],pageErrors:errors,badAssets};
    results.push(result);
    const desktop=await browser.newContext({viewport:{width:1280,height:900}});
    const phone=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await desktop.tracing.start({screenshots:true,snapshots:true});
    await phone.tracing.start({screenshots:true,snapshots:true});
    await desktop.addInitScript(()=>{
      window.__coachAudioContexts=[];
      window.__coachAudioStarts=0;
      const Native=window.AudioContext||window.webkitAudioContext;
      if(Native)window.AudioContext=class extends Native{
        constructor(...args){super(...args);window.__coachAudioContexts.push(this);}
        createOscillator(){const n=super.createOscillator();const start=n.start.bind(n);n.start=(...args)=>{window.__coachAudioStarts++;return start(...args);};return n;}
        createBufferSource(){const n=super.createBufferSource();const start=n.start.bind(n);n.start=(...args)=>{window.__coachAudioStarts++;return start(...args);};return n;}
      };
    });
    let page=await desktop.newPage();
    page.setDefaultTimeout(15000);
    watch(page,url,errors,badAssets);
    try{
      // --- Main app, desktop ---
      const response=await page.goto(url,{waitUntil:'networkidle',timeout:45000});
      assert.ok(response&&response.ok(),'Homepage returned HTTP '+response?.status());
      assert.match(await page.locator('h1').first().textContent(),/first beat/i);
      assert.ok(await page.locator('.card.start a[href="./setup.html"]').count()>0,'First visit shows the "Start here" card linking 00');
      for(const [file,,num] of CHAPTERS)assert.equal((await page.locator(`nav a[href="./${file}"] .num`).first().textContent()).trim(),num,`Main navigation numbers ${file} as ${num}`);
      result.checks.push('Homepage, first-beat chapter, start card and chapter numbers in the navigation');
      await page.screenshot({path:`artifacts/${name}-desktop.png`,fullPage:true});

      await page.locator('#next').click();
      assert.equal(await page.locator('[data-step="1"]').getAttribute('aria-current'),'step');
      await page.locator('#note-next').click();
      assert.match(await page.locator('#placement').textContent(),/1\.2\.3/);
      result.checks.push('Recipe navigation and exact note-position helper');

      await page.locator('nav [data-view="controls"]').click();
      await page.locator('[data-control="SAMPLE"]').first().click();
      assert.match(await page.locator('#info').textContent(),/capture|source|input/i);
      result.checks.push('Clickable control explanations');

      await page.locator('nav [data-view="manual"]').click();
      await page.locator('[data-lesson="0"]').click();
      await page.locator('#complete').click();
      result.checks.push('Learn lesson can be marked as tried');

      await page.locator('nav [data-view="help"]').click();
      await page.locator('#search').fill('silent');
      await page.locator('#results h2.sub',{hasText:'Troubleshooting'}).waitFor();
      assert.ok(await page.locator('#results details').count()>0,'Help search "silent" lists a troubleshooting topic');
      await page.locator('#search').fill('USB');
      assert.ok(await page.locator('#results details').count()>0,'Help search "USB" lists a troubleshooting topic');
      result.checks.push('Help search returns troubleshooting topics');

      // Firmware picker: a step that needs OS 2.0 shows a warning badge for an older OS and an OK badge for OS 2.5.
      const osStep=await page.evaluate(()=>song.findIndex(s=>s[7]&&s[7].os));
      assert.ok(osStep>=0,'course.js has a song step with a minimum OS');
      await page.locator('#firmware').selectOption('older');
      assert.match(await page.locator('#version-note').textContent(),/update first/i);
      await page.locator('nav [data-view="song"]').click();
      await page.locator(`[data-song-step="${osStep}"]`).click();
      assert.equal(await page.locator(`[data-song-step="${osStep}"]`).getAttribute('aria-current'),'step');
      assert.match(await page.locator('.badge.warn').first().textContent(),/Needs OS/);
      await page.locator('nav [data-view="help"]').click();
      await page.locator('#firmware').selectOption('2.5');
      await page.locator('nav [data-view="song"]').click();
      assert.equal(await page.locator('.badge.warn').count(),0);
      assert.match(await page.locator('.badge.ok').first().textContent(),/Needs OS/);
      result.checks.push('Firmware picker changes the "Needs OS" badge');

      // Song chapter: the current step survives a reload (the #song hash reopens the view).
      await page.reload({waitUntil:'networkidle'});
      assert.equal(await currentView(page),'song');
      assert.equal(await page.locator(`[data-song-step="${osStep}"]`).getAttribute('aria-current'),'step');
      result.checks.push('Song step and view survive reload');

      // Hash routes, typed into the address bar and changed in place.
      for(const [v,sel] of VIEWS){
        await openView(page,url,v);
        assert.equal(await currentView(page),v,`#${v} opens the ${v} view`);
        assert.ok(await page.locator(sel).count()>0,`#${v} renders ${sel}`);
      }
      await page.evaluate(()=>{location.hash='#lab';});
      await page.waitForFunction(()=>document.querySelector('nav [data-view="lab"][aria-current="page"]'));
      result.checks.push('Hash routes #first #song #manual #controls #lab #help');

      await page.locator('nav [data-view="lab"]').click();
      assert.equal(await page.locator('#beat button').count(),64);
      await page.locator('#clear').click();
      assert.equal(await page.locator('#beat button.on').count(),0);
      await page.locator('#recipe').click();
      assert.equal(await page.locator('#beat button.on').count(),16);
      await page.locator('#beat button').first().click();
      assert.equal(await page.locator('#beat button.on').count(),15);
      await page.locator('#recipe').click();
      result.checks.push('64-cell rhythm grid, clear/recipe and note toggles');
      await page.locator('#audio-play').click();
      await page.waitForFunction(()=>window.__coachAudioContexts.some(c=>c.state==='running')&&window.__coachAudioStarts>0);
      await page.locator('#audio-play').click();
      const stoppedStarts=await page.evaluate(()=>window.__coachAudioStarts);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(()=>window.__coachAudioStarts),stoppedStarts);
      await page.locator('#audio-play').click();
      await page.waitForFunction(old=>window.__coachAudioStarts>old,stoppedStarts);
      await page.locator('nav [data-view="first"]').click();
      const navigationStarts=await page.evaluate(()=>window.__coachAudioStarts);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(()=>window.__coachAudioStarts),navigationStarts);
      result.checks.push('Web Audio starts; Stop and navigation stop scheduling new sounds');

      // Service worker: registers, and the footer reports the offline copy once every asset is cached.
      const sw=await page.evaluate(()=>'serviceWorker' in navigator?navigator.serviceWorker.ready.then(r=>Boolean(r.active)):false);
      assert.ok(sw,'Service worker is active');
      await page.waitForFunction(()=>/Offline ready: the coach and all its chapters/.test(document.querySelector('#offline').textContent),null,{timeout:30000});
      result.checks.push('Service worker registers and caches every chapter');

      // Reset all progress asks first: Cancel keeps progress, OK clears it.
      await openView(page,url,'help');
      const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('koii-coach-v2')||'null'));
      assert.ok((await saved()).song>0,'Song progress is saved before the reset test');
      let asked='';
      page.once('dialog',d=>{asked=d.message();d.dismiss();});
      await page.locator('#reset').click();
      assert.match(asked,/Reset all/);
      assert.ok((await saved()).song>0,'Cancel keeps progress');
      page.once('dialog',d=>d.accept());
      await page.locator('#reset').click();
      await page.locator('#toast',{hasText:'reset'}).waitFor();
      const after=await saved();
      assert.equal(after.song,0,'OK resets progress');
      assert.equal(after.firmware,'2.5','Reset keeps the firmware choice');
      result.checks.push('Reset all progress asks for confirmation');

      // --- Main app, 390 px phone ---
      page=await phone.newPage();
      page.setDefaultTimeout(15000);
      watch(page,url,errors,badAssets);
      for(const [v] of VIEWS){
        await openView(page,url,v);
        await noOverflow(page,`index.html#${v} at 390 px`);
      }
      await openView(page,url,'first');
      assert.ok(await page.locator('#next').isVisible());
      assert.ok(await page.locator('#note-next').isVisible());
      await page.screenshot({path:`artifacts/${name}-mobile.png`,fullPage:true});
      // Next from the bottom of a long step brings the new step's title into view and focuses it.
      await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
      await page.locator('#next').click();
      const title=await page.evaluate(()=>{const r=document.querySelector('#step-title').getBoundingClientRect();return{top:r.top,bottom:r.bottom,h:window.innerHeight,focused:document.activeElement&&document.activeElement.id};});
      assert.ok(title.top>=0&&title.bottom<=title.h,`Next shows the new step title (top ${Math.round(title.top)}px in a ${title.h}px window)`);
      assert.equal(title.focused,'step-title');
      result.checks.push('Phone width: no horizontal scrolling in any view; Next scrolls the new step into view');

      // --- Chapter pages, 390 px phone ---
      for(const [file,slug,num,prev,next] of CHAPTERS){
        const r=await page.goto(abs('./'+file),{waitUntil:'networkidle'});
        assert.ok(r&&r.ok(),`${file} returned HTTP ${r?.status()}`);
        assert.equal(await page.evaluate(()=>document.body.dataset.chapter),slug);
        assert.match(await page.locator('header .eyebrow').textContent(),new RegExp('^CHAPTER '+num+' /'),`${file} header says CHAPTER ${num}`);
        assert.ok(await page.locator('.steps ol>li[data-step]').count()>0,`${file} has steps`);
        assert.equal(await page.locator('footer a[href*="wrong-instruction.yml"]').count(),1,`${file} footer has the report link`);
        assert.ok(await page.locator('footer',{hasText:'Not affiliated with or endorsed by teenage engineering'}).count()>0,`${file} footer has the non-affiliation line`);
        assert.equal(await page.locator('.chapters .prev').count()?await page.locator('.chapters .prev').getAttribute('href'):null,prev,`${file} previous link`);
        assert.equal(await page.locator('.chapters .next').count()?await page.locator('.chapters .next').getAttribute('href'):null,next,`${file} next link`);
        await noOverflow(page,`${file} at 390 px`);
        if(file==='setup.html')await page.screenshot({path:`artifacts/${name}-chapter-mobile.png`,fullPage:false});

        // A ticked step survives a reload.
        await page.evaluate(()=>document.querySelectorAll('.steps details').forEach(d=>{d.open=true;}));
        const box=page.locator('.steps ol>li .check input').first();
        const id=await page.locator('.steps ol>li').first().getAttribute('data-step');
        await box.check();
        assert.deepEqual((await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),'koii-coach-ch-'+slug)).done,[id]);
        await page.reload({waitUntil:'networkidle'});
        assert.ok(await page.locator('.steps ol>li .check input').first().isChecked(),`${file}: tick survives reload`);
        assert.match(await page.locator('#progress-count').textContent(),/^1 of \d+ done$/);
        await page.locator('.steps ol>li .check input').first().uncheck();

        // Previous and next chapter links land on the right page (and the right view of the main app).
        for(const href of [prev,next].filter(Boolean)){
          await page.goto(abs('./'+file),{waitUntil:'networkidle'});
          await page.locator(`.chapters a[href="${href}"]`).click();
          await page.waitForURL(abs(href));
          await page.waitForLoadState('networkidle');
          const hash=new URL(abs(href)).hash.slice(1);
          if(hash)assert.equal(await currentView(page),hash,`${file} → ${href} opens the ${hash} view`);
          else assert.ok(await page.locator('header .eyebrow').count()>0,`${file} → ${href} opens a chapter page`);
        }
      }
      result.checks.push('Chapter pages 00 and 07-11: load cleanly, report link, prev/next, ticks survive reload, no horizontal scrolling');

      assert.deepEqual(errors,[],'Browser JavaScript errors');
      assert.deepEqual(badAssets,[],'Failed app assets');
      result.status='passed';
    }catch(e){
      result.status='failed';result.error=String(e.stack||e);
      await page.screenshot({path:`artifacts/${name}-failure.png`}).catch(()=>{});
    }finally{
      await desktop.tracing.stop({path:`artifacts/${name}-desktop-trace.zip`}).catch(()=>{});
      await phone.tracing.stop({path:`artifacts/${name}-phone-trace.zip`}).catch(()=>{});
      await desktop.close();
      await phone.close();
    }
  }
}finally{
  await browser.close();
  await fs.writeFile('artifacts/results.json',JSON.stringify({note:'Tests exercise the UI, navigation, saved progress, the service worker and Web Audio scheduling in Chromium. They do not check sound quality, guide accuracy, real EP-133 hardware, Safari or offline use on a real phone.'+(live?'':' The live site was not tested (LIVE_URL empty).'),results},null,2));
  for(const r of results)console.log(`${r.target}: ${r.status}${r.error?' — '+r.error.split('\n')[0]:''}`);
}
if(results.some(r=>r.status!=='passed'))process.exitCode=1;
