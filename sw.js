'use strict';
// Bump VERSION on every release (same value as version in site.js and the newest CHANGELOG.md heading).
const VERSION='2026.10.14.32',CACHE='koii-coach-'+VERSION,TIMEOUT=1500;
// Every page, script, stylesheet, font and icon. CI (.github/scripts/build_site.py) fails if one is missing or a page is left out.
const ASSETS=['./','./index.html','./404.html',
  './setup.html','./first-beat.html','./song.html','./sampling.html','./perform.html','./hiphop.html','./tech-house.html','./thodorakis-house.html',
  './learn.html','./controls.html','./lab.html','./help.html','./glossary.html','./cheat-sheet.html','./safety.html','./settings.html',
  './coach.css','./site.js','./progress.js','./shell.js','./search.js','./wake.js','./chapter.js','./player.js','./toolsheet.js','./audio.js','./first-beat.js',
  './home.js','./tools.js','./lab.js','./settings.js',
  './manifest.webmanifest','./icon.svg','./icons.svg','./fonts/IBMPlexMono-SemiBold.woff2','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'];
// Install only succeeds when every asset is cached, so navigator.serviceWorker.ready means "works offline". Assets are
// stored one by one, so the status message below can report progress while installing; one failure removes the
// half-filled cache and fails the install, as addAll would.
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(!r.ok||r.redirected)throw new Error(u+' '+r.status);return c.put(u,r);}))))
  .catch(err=>caches.delete(CACHE).then(()=>{throw err;})).then(()=>self.skipWaiting())));
// Activate keeps the previous release's cache for one release (N−1, plan 7.6): a page of that release left open across
// a deploy still gets its own scripts (search.js?v=<its release>, loaded later) instead of the new ones. Older caches go.
const parts=k=>k.slice('koii-coach-'.length).split('.').map(Number);
const newer=(a,b)=>{const x=parts(a),y=parts(b);for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d;}return 0;};
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>{
  const old=keys.filter(k=>k.startsWith('koii-coach-')&&k!==CACHE).sort((a,b)=>newer(b,a)||0);
  return Promise.all(old.slice(1).map(k=>caches.delete(k)));
}).then(()=>self.clients.claim())));
// Pages can ask {type:'koii-coach-status'} to show the version and whether everything is cached.
self.addEventListener('message',e=>{if(!e.data||e.data.type!=='koii-coach-status'||!e.source)return;e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(u=>c.match(u)))).then(hits=>e.source.postMessage({type:'koii-coach-status',version:VERSION,cached:hits.filter(Boolean).length,total:ASSETS.length})));});
// Cache key without ?query or #hash, so hiphop.html?utm=x still opens offline. An address that is not saved opens
// the saved 404.html (it has the course list, search and links home), as GitHub Pages does online.
const key=req=>{const u=new URL(req.url);u.search='';u.hash='';return u.href;};
// Only this release's cache: the one kept from the release before answers only for its own ?v= (below).
const cached=req=>caches.open(CACHE).then(c=>c.match(key(req),{ignoreSearch:true,ignoreVary:true}).then(r=>r||(req.mode==='navigate'?c.match('./404.html'):undefined)));
// Network first so lessons stay current. If the network has not answered after TIMEOUT ms (1.5 s, so a weak signal at the
// device does not leave a blank page), or fails, answer from the cache;
// a late network answer still refreshes the cache for next time.
// A script, stylesheet or other file asked for with its release (?v=…, build_site.py adds it) is the same file for the
// whole release: it comes from that release's cache first (this one, or the one kept from the release before), else
// from the network as below.
const release=(req,v)=>{const name='koii-coach-'+v;return caches.has(name).then(h=>h?caches.open(name).then(c=>c.match(key(req),{ignoreSearch:true,ignoreVary:true})):undefined);};
self.addEventListener('fetch',e=>{const req=e.request,u=new URL(req.url);if(req.method!=='GET'||u.origin!==self.location.origin)return;
  const v=req.mode==='navigate'?'':u.searchParams.get('v');
  if(v&&/^[\w.-]{1,40}$/.test(v)){e.respondWith(release(req,v).then(r=>r||network(e,req),()=>network(e,req)));return;}
  e.respondWith(network(e,req));
});
function network(e,req){
  let saved=Promise.resolve();
  // Only this release's files go into this release's copy: a page of another release (a newer one loaded before this
  // worker hands over, or an older one) must not leave its scripts here under this release's names.
  const v=new URL(req.url).searchParams.get('v'),ours=!v||v===VERSION;
  const net=fetch(req).then(r=>{if(ours&&r.status===200&&r.type==='basic'&&!r.redirected){const copy=r.clone();saved=caches.open(CACHE).then(c=>c.put(key(req),copy));}return r;});
  e.waitUntil(net.then(()=>saved,()=>{}).catch(()=>{}));
  return new Promise(resolve=>{let done=false;const use=r=>{if(r&&!done){done=true;resolve(r);}};
    const timer=setTimeout(()=>cached(req).then(use,()=>{}),TIMEOUT);
    net.then(r=>{clearTimeout(timer);use(r);},()=>{clearTimeout(timer);cached(req).then(r=>use(r||Response.error()),()=>use(Response.error()));});});
}
