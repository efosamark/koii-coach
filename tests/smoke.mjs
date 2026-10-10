import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
const targets=[['repository',process.env.LOCAL_URL||'http://127.0.0.1:8080/'],['live-pages',process.env.LIVE_URL||'https://leonardovitolowork-hash.github.io/koii-coach/']];
try{
  for(const [name,url] of targets){
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.tracing.start({screenshots:true,snapshots:true});
    await context.addInitScript(()=>{
      window.__coachAudioContexts=[];
      window.__coachAudioStarts=0;
      const Native=window.AudioContext||window.webkitAudioContext;
      if(Native)window.AudioContext=class extends Native{
        constructor(...args){super(...args);window.__coachAudioContexts.push(this);}
        createOscillator(){const n=super.createOscillator();const start=n.start.bind(n);n.start=(...args)=>{window.__coachAudioStarts++;return start(...args);};return n;}
        createBufferSource(){const n=super.createBufferSource();const start=n.start.bind(n);n.start=(...args)=>{window.__coachAudioStarts++;return start(...args);};return n;}
      };
    });
    const page=await context.newPage();
    page.setDefaultTimeout(15000);
    const errors=[],badAssets=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('response',r=>{
      const path=new URL(r.url()).pathname;
      if(new URL(r.url()).origin===new URL(url).origin&&r.status()>=400&&/\/(index\.html|course\.js|knowledge\.js|sw\.js|manifest\.webmanifest|icon\.svg)$/.test(path))badAssets.push({url:r.url(),status:r.status()});
    });
    const result={target:name,url,checks:[],pageErrors:errors,badAssets};
    results.push(result);
    try{
      const response=await page.goto(url,{waitUntil:'networkidle',timeout:45000});
      assert.ok(response&&response.ok(),'Homepage returned HTTP '+response?.status());
      assert.match(await page.locator('h1').first().textContent(),/first beat/i);
      const v3=await page.locator('nav [data-tab="recipe"]').count()>0;
      result.edition=v3?'guide-library':'original-coach';
      const nav=key=>page.locator(v3?`nav [data-tab="${key}"]`:`nav [data-view="${key==='recipe'?'first':key}"]`);
      const position=async()=>v3?assert.equal(await page.locator('#recipe-step').inputValue(),'1'):assert.equal(await page.locator('[data-step="1"]').getAttribute('aria-current'),'step');
      result.checks.push('Homepage and first-beat chapter load');
      await page.screenshot({path:`artifacts/${name}-desktop.png`,fullPage:true});
      await page.locator('#next').click();
      await position();
      await page.locator('#note-next').click();
      assert.match(await page.locator(v3?'#note':'#placement').textContent(),/1\.2\.3/);
      result.checks.push('Recipe navigation and exact note-position helper');
      await nav('controls').click();
      await page.locator('[data-control="SAMPLE"]').first().click();
      assert.match(await page.locator(v3?'#control-info':'#info').textContent(),/capture|source|input/i);
      result.checks.push('Clickable control explanations');
      if(v3){
        await nav('guide').click();
        await page.locator('#search').fill('sidechain');
        assert.ok(await page.locator('#topics article').count()>0);
        await page.locator('[data-learned]').first().click();
        await nav('tables').click();
        assert.ok(await page.locator('tbody tr').count()>90);
        result.checks.push('Full-guide search, learning progress and reference tables');
      }else{
        await nav('manual').click();
        await page.locator('[data-lesson="0"]').click();
        await page.locator('#complete').click();
        await nav('help').click();
        await page.locator('#search').fill('USB');
        assert.ok(await page.locator('#results details').count()>0);
        await page.locator('#firmware').selectOption('2.5');
        result.checks.push('Manual completion, help search and firmware preference');
      }
      await nav('lab').click();
      assert.equal(await page.locator('#beat button').count(),64);
      await page.locator('#clear').click();
      assert.equal(await page.locator('#beat button.on').count(),0);
      await page.locator(v3?'#preset':'#recipe').click();
      assert.equal(await page.locator('#beat button.on').count(),16);
      await page.locator('#beat button').first().click();
      assert.equal(await page.locator('#beat button.on').count(),15);
      await page.locator(v3?'#preset':'#recipe').click();
      result.checks.push('64-cell rhythm grid, clear/preset and note toggles');
      await page.locator('#audio-play').click();
      await page.waitForFunction(()=>window.__coachAudioContexts.some(c=>c.state==='running')&&window.__coachAudioStarts>0);
      await page.locator('#audio-play').click();
      const stoppedStarts=await page.evaluate(()=>window.__coachAudioStarts);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(()=>window.__coachAudioStarts),stoppedStarts);
      await page.locator('#audio-play').click();
      await page.waitForFunction(old=>window.__coachAudioStarts>old,stoppedStarts);
      await nav('recipe').click();
      const navigationStarts=await page.evaluate(()=>window.__coachAudioStarts);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(()=>window.__coachAudioStarts),navigationStarts);
      result.checks.push('Web Audio starts; Stop and navigation stop scheduling new sounds');
      await page.reload({waitUntil:'networkidle'});
      await position();
      result.checks.push('First-beat progress survives reload');
      await page.setViewportSize({width:390,height:844});
      assert.ok(await page.locator('#next').isVisible());
      assert.ok(await page.locator('#note-next').isVisible());
      await page.screenshot({path:`artifacts/${name}-mobile.png`,fullPage:true});
      result.checks.push('Mobile controls and screenshot');
      assert.deepEqual(errors,[],'Browser JavaScript errors');
      assert.deepEqual(badAssets,[],'Failed app assets');
      result.status='passed';
    }catch(e){
      result.status='failed';result.error=String(e.stack||e);
      await page.screenshot({path:`artifacts/${name}-failure.png`}).catch(()=>{});
    }finally{
      await context.tracing.stop({path:`artifacts/${name}-trace.zip`}).catch(()=>{});
      await context.close();
    }
  }
}finally{
  await browser.close();
  await fs.writeFile('artifacts/results.json',JSON.stringify({note:'Tests exercise UI and Web Audio scheduling, not perceptual sound quality, complete guide accuracy, physical hardware or offline caching.',results},null,2));
  for(const r of results)console.log(`${r.target}: ${r.status}${r.error?' — '+r.error.split('\n')[0]:''}`);
}
if(results.some(r=>r.status!=='passed'))process.exitCode=1;
