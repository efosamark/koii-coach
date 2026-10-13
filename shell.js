'use strict';
/* The shared shell on every page: the app bar, the menu sheet (phones and tablets) and the course rail (desktop).
   Load it as a plain, synchronous script straight after the page's static <header class="appbar" id="appbar">
   and after site.js. It runs while the page is still loading, so the course and tool links exist before any
   page script: index.html binds its own click handlers to "nav [data-view]" and marks the current view with
   aria-current="page" itself. Without JavaScript the static header stays a plain link home.

   One set of links serves both layouts: under 1024px they live in the menu sheet (<dialog id="shell-menu">),
   from 1024px in the rail (#shell-rail) on the left, always visible. The nodes move; they are never copied,
   so page selectors such as nav [data-view="lab"] match exactly one element.

   window.CoachShell:
     open()                 opens the menu sheet (on desktop: focuses the current link in the rail)
     close()                closes it; focus returns to the menu button
     toggle()
     setTitle(name, kicker) sets the title in the app bar (kicker is the small line above, e.g. "Chapter 07")
     refresh()              re-reads saved progress and the offline status; call it after saving progress
   Progress is only read here, never written: koii-coach-ch-<slug> ({v:1,done:[ids],n}), the legacy checklist
   keys named in site.js, and koii-coach-v2 (step/finished for 01, song/songFinished for 02). */
(()=>{
const site=window.COACH_SITE,bar=document.getElementById('appbar');
if(!site||!bar){console.error('shell.js: load site.js first and put <header class="appbar" id="appbar"> before shell.js');return;}
const root=document.documentElement,body=document.body;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};

// Where are we? index.html is the single-page app that holds 01, 02 and the tools as hash views.
const file=(p=>{try{return decodeURIComponent(p);}catch(e){return p;}})(location.pathname.split('/').pop()||'index.html');
const app=file==='index.html';
const slug=body.dataset.chapter||'';
const items=[...site.chapters,...site.tools];
const current=slug?site.chapters.find(c=>c.slug===slug):items.find(i=>!i.view&&i.href.replace(/^\.\//,'')===file);
if(slug&&!current)console.warn('shell.js: <body data-chapter="'+slug+'"> is not in site.js');
// Inside the app a view link is a bare hash with data-view (the app routes it); elsewhere it opens index.html.
const href=i=>app&&i.view?'#'+i.view:i.href;
const attrs=i=>`href="${esc(href(i))}"`+(app&&i.view?` data-view="${i.view}"`:'')+(i===current?' aria-current="page"':'');

// App bar
bar.innerHTML=`<button class="icon-btn menu-btn" type="button" aria-label="Menu" aria-haspopup="dialog" aria-controls="shell-menu" aria-expanded="false">${icon('menu')}</button>`+
  `<a class="wordmark" href="./index.html"><span>K.O. II</span> <span class="wordmark-sep" aria-hidden="true">/</span> <span>COACH</span></a>`+
  `<p class="bar-title"><span class="bar-kicker"></span><span class="bar-name"></span></p>`;
const menuBtn=bar.querySelector('.menu-btn'),titleEl=bar.querySelector('.bar-title');
function setTitle(name,kicker){
  titleEl.querySelector('.bar-name').textContent=name||'';
  titleEl.querySelector('.bar-kicker').textContent=kicker||'';
  titleEl.classList.toggle('has-name',Boolean(name));
}
const titleFor=i=>i.num?setTitle(i.title,'Chapter '+i.num):setTitle(i.title,'');
if(current)titleFor(current);

// Course and tool lists, the offline line and the two links (one node, moved between sheet and rail)
const nav=document.createElement('div');
nav.className='shell-nav';
nav.innerHTML=`<nav class="course-nav" aria-label="Course"><p class="nav-label" aria-hidden="true">Course</p><ol>`+
  site.chapters.map(c=>`<li data-state="todo"><a ${attrs(c)}><span class="led" aria-hidden="true"></span><span class="num">${esc(c.num)}</span><span class="name">${esc(c.title)}</span><span class="count" aria-hidden="true"></span><span class="sr state"></span></a></li>`).join('')+
  `</ol></nav><nav class="tools-nav" aria-label="Tools"><p class="nav-label" aria-hidden="true">Tools</p><ul>`+
  site.tools.map(t=>`<li><a ${attrs(t)}>${icon(t.icon)}<span class="name">${esc(t.title)}</span></a></li>`).join('')+
  `</ul></nav><div class="shell-meta"><p class="offline-line" id="shell-offline"></p>`+
  `<p><a href="${esc(site.report)}" target="_blank" rel="noopener noreferrer">Report a wrong instruction<span class="sr"> (opens in a new tab)</span></a></p>`+
  `<p><a href="${esc(site.repo)}" target="_blank" rel="noopener noreferrer">Source code<span class="sr"> (opens in a new tab)</span></a></p></div>`;

const rail=document.createElement('div');
rail.className='rail';rail.id='shell-rail';
const sheet=document.createElement('dialog');
sheet.className='sheet';sheet.id='shell-menu';sheet.setAttribute('aria-labelledby','shell-menu-title');
sheet.innerHTML=`<div class="sheet-box"><div class="sheet-head"><h2 class="sheet-title" id="shell-menu-title">Menu</h2>`+
  `<button class="icon-btn" type="button" data-close aria-label="Close menu">${icon('close')}</button></div><div class="sheet-body"></div></div>`;
const sheetBody=sheet.querySelector('.sheet-body');
bar.after(rail,sheet);
root.classList.add('shell-on');

const wide=matchMedia('(min-width:1024px)');
function place(){
  if(wide.matches){if(sheet.open)close();rail.append(nav);}
  else sheetBody.append(nav);
}
place();
if(wide.addEventListener)wide.addEventListener('change',place);else if(wide.addListener)wide.addListener(place);

// On index.html the app marks the current view; the bar title follows it.
if(app)new MutationObserver(()=>{
  const a=nav.querySelector('[data-view][aria-current="page"]'),i=a&&items.find(x=>x.view===a.dataset.view);
  if(i)titleFor(i);
}).observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-current']});

// Menu sheet. Opening adds a history entry so a phone's Back button closes it. Following a link from the
// sheet first removes that entry again, then follows the link, so Back afterwards goes where you expect.
let pushed=false,popping=false,pending=null,passing=false;
function open(){
  if(wide.matches){const a=nav.querySelector('[aria-current="page"]')||nav.querySelector('a');if(a)a.focus();return;}
  if(sheet.open)return;
  refresh();
  if(typeof sheet.showModal==='function')sheet.showModal();else sheet.setAttribute('open','');
  menuBtn.setAttribute('aria-expanded','true');
  try{history.pushState({coachMenu:true},'');pushed=true;}catch(e){pushed=false;}
}
function close(){
  if(!sheet.open)return;
  if(typeof sheet.close==='function')sheet.close();else{sheet.removeAttribute('open');sheet.dispatchEvent(new Event('close'));}
}
sheet.addEventListener('close',()=>{
  menuBtn.setAttribute('aria-expanded','false');
  if(pushed){
    pushed=false;popping=true;history.back();
    if(pending)setTimeout(()=>{popping=false;follow();},500);   // in case the Back never arrives
  }
  if(menuBtn.offsetParent)menuBtn.focus();
});
function follow(){
  if(!pending)return;
  const a=pending;pending=null;passing=true;
  try{a.click();}finally{passing=false;}
}
addEventListener('popstate',()=>{
  if(popping){popping=false;follow();return;}
  if(pushed){pushed=false;close();}   // the Back button closed the sheet
});
// Capture phase, so this runs before the page's own link handlers.
sheet.addEventListener('click',e=>{
  if(e.target===sheet){close();return;}   // a tap on the backdrop lands on the <dialog> itself
  if(e.target.closest('[data-close]')){close();return;}
  const a=e.target.closest('a[href]');
  if(!a||passing)return;
  if(e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank')return;
  if(pushed){e.preventDefault();e.stopPropagation();pending=a;}
  close();
},true);
menuBtn.addEventListener('click',open);

// Progress counts (read-only) and LED states
function doneCount(c,total){
  if(c.slug){
    const v=read('koii-coach-ch-'+c.slug);
    if(v&&Array.isArray(v.done))return Number.isInteger(v.n)?v.n:v.done.length;
    const old=c.legacy?read(c.legacy):null;
    return Array.isArray(old)?old.length:0;
  }
  const v=read('koii-coach-v2');
  if(!v||typeof v!=='object')return 0;
  if(c.view==='first')return v.finished===true?total:Number.isInteger(v.step)?v.step:0;
  if(c.view==='song')return v.songFinished===true?total:Number.isInteger(v.song)?v.song:0;
  return 0;
}
// The page in front of us knows its real step count; site.js is only a fallback for the other chapters.
function liveTotal(c){
  if(c===current&&c.slug){const n=document.querySelectorAll('.steps ol>li[data-step]').length;if(n)return n;}
  /* global first, song */
  if(app&&c.view==='first'&&typeof first!=='undefined'&&Array.isArray(first))return first.length;
  if(app&&c.view==='song'&&typeof song!=='undefined'&&Array.isArray(song))return song.length;
  return c.steps;
}
function counts(){
  site.chapters.forEach((c,i)=>{
    const li=nav.querySelectorAll('.course-nav li')[i];if(!li||!c.steps)return;
    const total=liveTotal(c),x=Math.max(0,Math.min(total,doneCount(c,total)||0));
    li.dataset.state=x>=total?'done':x>0?'doing':'todo';
    li.querySelector('.count').innerHTML=x>=total?icon('check')+'Done':x+'/'+total;
    li.querySelector('.state').textContent=x>=total?', done':x>0?`, ${x} of ${total} steps done`:', not started';
  });
}
function refresh(){counts();offline();}
let checked=false;
function checkCounts(){
  if(checked)return;checked=true;
  site.chapters.forEach(c=>{const n=liveTotal(c);if(n!==c.steps)console.warn(`shell.js: site.js says chapter ${c.num} has ${c.steps} steps, but it has ${n}. Update "steps" in site.js.`);});
}

// Offline status, asked of the service worker the page registers (the shell never registers one itself).
const offEl=nav.querySelector('#shell-offline');
function setOffline(text,ready){offEl.innerHTML=text?icon(ready?'check':'offline')+`<span>${esc(text)}</span>`:'';offEl.classList.toggle('ready',Boolean(ready));}
function offline(){
  const sw=navigator.serviceWorker;
  if(location.protocol==='file:')return setOffline('Offline use needs the online site, not a local file');
  if(!sw)return setOffline('This browser cannot keep an offline copy');
  sw.getRegistration().then(reg=>{
    if(!reg)return setOffline('Not saved for offline use yet');
    if(!reg.active)return setOffline('Saving an offline copy…');
    let done=false;
    const on=e=>{
      if(done||!e.data||e.data.type!=='koii-coach-status')return;
      done=true;sw.removeEventListener('message',on);
      const {cached,total}=e.data;
      if(cached>=total)setOffline('Available offline',true);
      else setOffline('Saving an offline copy: '+Math.round(100*cached/Math.max(1,total))+'%');
    };
    sw.addEventListener('message',on);
    if(sw.startMessages)sw.startMessages();
    reg.active.postMessage({type:'koii-coach-status'});
    setTimeout(()=>{if(!done){done=true;sw.removeEventListener('message',on);}},3000);
  },()=>setOffline(''));
}
if(navigator.serviceWorker){
  navigator.serviceWorker.ready.then(offline,()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',offline);
}

// Keep the counts current: on load, when another tab saves, when the page comes back from the
// back/forward cache, and when a chapter tick changes on this page.
counts();
document.addEventListener('DOMContentLoaded',()=>{refresh();checkCounts();});
addEventListener('pageshow',e=>{if(e.persisted)refresh();});
addEventListener('storage',e=>{if(!e.key||e.key.startsWith('koii'))refresh();});
document.addEventListener('change',e=>{if(e.target.closest&&e.target.closest('.check'))refresh();});

// The bar gets its shadow once the page has scrolled.
const shade=()=>bar.classList.toggle('scrolled',scrollY>4);
addEventListener('scroll',shade,{passive:true});shade();

window.CoachShell={open,close,toggle:()=>sheet.open?close():open(),setTitle,refresh};
})();
