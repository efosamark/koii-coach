'use strict';
// Bump VERSION on every release (same value as version in site.js and the newest CHANGELOG.md heading).
const VERSION='2026.10.14.19',CACHE='koii-coach-'+VERSION,TIMEOUT=1500;
// Every page, script, stylesheet, font and icon. CI (.github/scripts/build_site.py) fails if one is missing or a page is left out.
const ASSETS=['./','./index.html','./404.html',
  './setup.html','./first-beat.html','./song.html','./sampling.html','./perform.html','./hiphop.html','./tech-house.html','./thodorakis-house.html',
  './learn.html','./controls.html','./lab.html','./help.html','./glossary.html','./cheat-sheet.html','./safety.html','./settings.html',
  './coach.css','./site.js','./progress.js','./shell.js','./search.js','./wake.js','./chapter.js','./player.js','./toolsheet.js','./audio.js','./first-beat.js',
  './home.js','./tools.js','./lab.js','./settings.js',
  './manifest.webmanifest','./icon.svg','./icons.svg','./fonts/IBMPlexMono-SemiBold.woff2','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'];
// Install only succeeds when every asset is cached, so navigator.serviceWorker.ready means "works offline".
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('koii-coach-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Pages can ask {type:'koii-coach-status'} to show the version and whether everything is cached.
self.addEventListener('message',e=>{if(!e.data||e.data.type!=='koii-coach-status'||!e.source)return;e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(u=>c.match(u)))).then(hits=>e.source.postMessage({type:'koii-coach-status',version:VERSION,cached:hits.filter(Boolean).length,total:ASSETS.length})));});
// Cache key without ?query or #hash, so hiphop.html?utm=x still opens offline. An address that is not saved opens
// the saved 404.html (it has the course list, search and links home), as GitHub Pages does online.
const key=req=>{const u=new URL(req.url);u.search='';u.hash='';return u.href;};
const cached=req=>caches.match(key(req),{ignoreSearch:true,ignoreVary:true}).then(r=>r||(req.mode==='navigate'?caches.match('./404.html'):undefined));
// Network first so lessons stay current. If the network has not answered after TIMEOUT ms (1.5 s, so a weak signal at the
// device does not leave a blank page), or fails, answer from the cache;
// a late network answer still refreshes the cache for next time.
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  let saved=Promise.resolve();
  const net=fetch(req).then(r=>{if(r.status===200&&r.type==='basic'&&!r.redirected){const copy=r.clone();saved=caches.open(CACHE).then(c=>c.put(key(req),copy));}return r;});
  e.waitUntil(net.then(()=>saved,()=>{}).catch(()=>{}));
  e.respondWith(new Promise(resolve=>{let done=false;const use=r=>{if(r&&!done){done=true;resolve(r);}};
    const timer=setTimeout(()=>cached(req).then(use,()=>{}),TIMEOUT);
    net.then(r=>{clearTimeout(timer);use(r);},()=>{clearTimeout(timer);cached(req).then(r=>use(r||Response.error()),()=>use(Response.error()));});}));
});
