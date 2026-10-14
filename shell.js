'use strict';
/* The shared shell on every page: the app bar, the menu sheet (phones and tablets), the course rail (desktop) and
   the Search button with its overlay.
   Load it as a plain, synchronous script straight after the page's static <header class="appbar" id="appbar">,
   after site.js and progress.js. It runs while the page is still loading, so the course and tool links exist before
   any page script. The link to the page in front of us carries aria-current="page". Without JavaScript the static
   header stays a plain link home.

   One set of links serves both layouts: under 1024px they live in the menu sheet (<dialog id="shell-menu">),
   from 1024px in the rail (#shell-rail) on the left, always visible. The nodes move; they are never copied,
   so a page selector such as nav a[href="./lab.html"] matches exactly one element.

   The right-hand side of the bar is <div class="appbar-actions" id="appbar-actions">. It holds the Search button
   (.search-btn); a page script may append (or prepend) its own .icon-btn there, as shell.js has run before it.

   Search costs nothing until it is used: the first tap builds the overlay's frame (<dialog id="site-search-dialog">,
   focused at once so a phone's keyboard opens inside the tap) and loads search.js, which holds the index and the
   matching. "/" and Ctrl/Cmd+K open it too.

   window.CoachShell:
     open()                 opens the menu sheet (on desktop: focuses the current link in the rail)
     close()                closes it; focus returns to the menu button
     toggle()
     openSearch(query)      opens the Search overlay, with the text field already holding query if one is given
     setTitle(name, kicker) sets the title in the app bar (kicker is the small line above, e.g. "Chapter 07")
     refresh()              re-reads saved progress and the offline status; call it after saving progress
   Progress is only read here, never written (CoachProgress.chapters(): koii-coach-ch-<slug> and the legacy keys).

   The shell also registers the service worker (sw.js) for every page, once the page has loaded, and reports the
   offline copy: a short line in the menu, and a sentence in any #offline or .offline-status element on the page
   ("Offline ready: the coach and all its chapters open without internet." once every file is saved). */
(()=>{
const site=window.COACH_SITE,bar=document.getElementById('appbar');
if(!site||!bar){console.error('shell.js: load site.js first and put <header class="appbar" id="appbar"> before shell.js');return;}
const root=document.documentElement,body=document.body;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};

// Where are we? A chapter page names itself in <body data-chapter>; a tool page is found by its file name.
const file=(p=>{try{return decodeURIComponent(p);}catch(e){return p;}})(location.pathname.split('/').pop()||'index.html');
const slug=body.dataset.chapter||'';
const items=[...site.chapters,...site.tools];
const current=slug?site.chapters.find(c=>c.slug===slug):items.find(i=>i.href.replace(/^\.\//,'')===file);
if(slug&&!current)console.warn('shell.js: <body data-chapter="'+slug+'"> is not in site.js');
const attrs=i=>`href="${esc(i.href)}"`+(i===current?' aria-current="page"':'');

// App bar
bar.innerHTML=`<button class="icon-btn menu-btn" type="button" aria-label="Menu" aria-haspopup="dialog" aria-controls="shell-menu" aria-expanded="false">${icon('menu')}</button>`+
  `<a class="wordmark" href="./index.html"><span>K.O. II</span> <span class="wordmark-sep" aria-hidden="true">/</span> <span>COACH</span></a>`+
  `<p class="bar-title"><span class="bar-kicker"></span><span class="bar-name"></span></p>`+
  `<div class="appbar-actions" id="appbar-actions"><button class="icon-btn search-btn" type="button" aria-label="Search" aria-haspopup="dialog" aria-expanded="false" aria-keyshortcuts="/">${icon('search')}</button></div>`;
const menuBtn=bar.querySelector('.menu-btn'),searchBtn=bar.querySelector('.search-btn'),titleEl=bar.querySelector('.bar-title');
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

// Dialogs (the menu sheet and the search overlay). Opening one adds a history entry so a phone's Back button closes
// it; however it closes (Back, Esc, the backdrop, its close button) that entry is removed again. Following a link
// from inside it first removes the entry, then follows the link, so Back afterwards goes where you expect.
// before() runs just ahead of opening; focus returns to the opener.
function modal(dlg,opener,before){
  let pushed=false,popping=false,pending=null,passing=false,down=null;
  function open(){
    if(dlg.open)return;
    if(before)before();
    if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
    opener.setAttribute('aria-expanded','true');
    try{history.pushState({coachDialog:dlg.id},'');pushed=true;}catch(e){pushed=false;}
  }
  function close(){
    if(!dlg.open)return;
    if(typeof dlg.close==='function')dlg.close();else{dlg.removeAttribute('open');dlg.dispatchEvent(new Event('close'));}
  }
  function follow(){
    if(!pending)return;
    const a=pending;pending=null;passing=true;
    try{a.click();}finally{passing=false;}
  }
  dlg.addEventListener('close',()=>{
    opener.setAttribute('aria-expanded','false');
    if(pushed){
      pushed=false;popping=true;history.back();
      if(pending)setTimeout(()=>{popping=false;follow();},500);   // in case the Back never arrives
    }
    if(opener.offsetParent)opener.focus();
  });
  addEventListener('popstate',()=>{
    if(popping){popping=false;follow();return;}
    if(pushed){pushed=false;close();}   // the Back button closed the dialog
  });
  // Capture phase, so this runs before the page's own link handlers.
  dlg.addEventListener('pointerdown',e=>{down=e.target;},true);
  dlg.addEventListener('click',e=>{
    const from=down;down=null;
    if(e.target===dlg){if(!from||from===dlg)close();return;}   // a tap on the backdrop lands on the <dialog> itself (a drag that ends there does not count)
    if(e.target.closest('[data-close]')){close();return;}
    const a=e.target.closest('a[href]');
    if(!a||passing)return;
    if(e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank')return;
    if(pushed){e.preventDefault();e.stopPropagation();pending=a;}
    close();
  },true);
  return{open,close};
}

// Menu sheet
const menu=modal(sheet,menuBtn,()=>refresh());
function open(){
  if(wide.matches){const a=nav.querySelector('[aria-current="page"]')||nav.querySelector('a');if(a)a.focus();return;}
  menu.open();
}
function close(){menu.close();}
menuBtn.addEventListener('click',open);

// Search. Nothing is added to a page until someone searches. The first time, the overlay's frame is built and the
// field focused straight away (inside the tap, so a phone's keyboard opens); then search.js, which holds the index
// and the matching, loads and takes over the frame. If it cannot load, the overlay says so and points to Help.
let finder=null,field=null,loading=false,early=false;
function searchFrame(){
  const d=document.createElement('dialog'),types=[['all','All'],['step','Steps'],['help','Help'],['learn','Learn'],['word','Words']];
  d.className='sheet search-sheet';d.id='site-search-dialog';d.setAttribute('aria-label','Search');
  d.innerHTML=`<div class="sheet-box"><div class="search-head"><div class="search-field">${icon('search')}`+
    `<input id="site-search" type="search" placeholder="Search steps, help and words" aria-label="Search steps, help and words" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" maxlength="120" autofocus></div>`+
    `<button class="icon-btn" type="button" data-close aria-label="Close search">${icon('close')}</button></div>`+
    `<div class="search-chips" role="group" aria-label="Type of result">${types.map(([t,l])=>`<button class="search-chip" type="button" data-type="${t}" aria-pressed="${t==='all'}">${l}</button>`).join('')}</div>`+
    `<div class="sheet-body search-body"><p class="sr" id="site-search-status" role="status"></p><div id="site-results"></div></div></div>`;
  document.body.append(d);
  // A phone's keyboard covers the bottom of a full-height sheet; --vvh (the part of the screen still showing) lets it shrink.
  if(window.visualViewport){const fit=()=>d.style.setProperty('--vvh',visualViewport.height+'px');visualViewport.addEventListener('resize',fit);fit();}
  return d;
}
function loadSearch(){
  if(window.CoachSearch)return window.CoachSearch.reopen();
  if(loading)return;
  loading=true;
  const s=document.createElement('script');
  s.src='./search.js';
  s.onload=()=>{
    if(!window.CoachSearch)return s.onerror();
    window.CoachSearch.mount(field.closest('dialog'),early);
    early=false;
  };
  s.onerror=()=>{
    loading=false;early=false;s.remove();
    document.getElementById('site-results').innerHTML='<p class="search-note"><b>Search could not load.</b> Check your connection and try again. <a href="./help.html">Troubleshooting</a> has its own search.</p>';
  };
  document.head.append(s);
}
function openSearch(query){
  if(!finder){
    const d=searchFrame();
    field=d.querySelector('#site-search');
    field.addEventListener('keydown',e=>{if(e.key==='Enter'&&!window.CoachSearch){e.preventDefault();early=true;}});   // search.js opens the best match once it is here
    finder=modal(d,searchBtn);
    searchBtn.setAttribute('aria-controls',d.id);
  }
  finder.open();
  if(typeof query==='string'){field.value=query;field.dispatchEvent(new Event('input'));}
  field.focus();field.select();
  loadSearch();
}
searchBtn.addEventListener('click',()=>openSearch());
// "/" (outside a field that takes text, or a select: on a tick or a radio it still opens search) and Ctrl/Cmd+K, as in most search boxes.
document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.altKey||document.querySelector('dialog[open]'))return;
  const t=e.target,key=(e.key||'').toLowerCase(),typing=t&&(t.isContentEditable||/^(?:TEXTAREA|SELECT)$/.test(t.tagName)||t.tagName==='INPUT'&&!/^(?:checkbox|radio|button|submit|reset|range|color|file)$/.test(t.type));
  if(key==='/'&&!e.ctrlKey&&!e.metaKey&&!typing||key==='k'&&(e.ctrlKey||e.metaKey)){e.preventDefault();openSearch();}
});

// Progress counts (read-only) and LED states
function doneCount(c){
  const v=read('koii-coach-ch-'+c.slug);
  if(v&&Array.isArray(v.done))return Number.isInteger(v.n)?v.n:v.done.length;
  const old=c.legacy?read(c.legacy):null;
  return Array.isArray(old)?old.length:0;
}
// The page in front of us knows its real step count; site.js is only a fallback for the other chapters.
function liveTotal(c){
  if(c===current&&c.slug){const n=document.querySelectorAll('.steps ol>li[data-step]').length;if(n)return n;}
  return c.steps;
}
function counts(){
  site.chapters.forEach((c,i)=>{
    const li=nav.querySelectorAll('.course-nav li')[i];if(!li||!c.steps)return;
    const total=liveTotal(c),x=Math.max(0,Math.min(total,doneCount(c)||0));
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

// Offline status: the menu's short line (#shell-offline) and the page's own sentence (#offline, .offline-status).
const offEl=nav.querySelector('#shell-offline');
let failed=false;
function setOffline(text,ready,long){
  offEl.innerHTML=text?icon(ready?'check':'offline')+`<span>${esc(text)}</span>`:'';offEl.classList.toggle('ready',Boolean(ready));
  document.querySelectorAll('#offline,.offline-status').forEach(e=>{e.textContent=long||(text?text+'.':'');});
}
const secure=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
function offline(){
  const sw=navigator.serviceWorker;
  if(location.protocol==='file:')return setOffline('Offline use needs the online site, not a local file','','Offline caching needs the online site, not a local file.');
  if(!sw||!secure)return setOffline('This browser cannot keep an offline copy');
  if(failed)return setOffline('Offline copy incomplete','','Offline copy incomplete. Reload while online to retry.');
  sw.getRegistration().then(reg=>{
    if(!reg)return setOffline('Not saved for offline use yet','','Preparing offline copy…');
    if(!reg.active)return setOffline('Saving an offline copy…','','Preparing offline copy…');
    let done=false;
    const on=e=>{
      if(done||!e.data||e.data.type!=='koii-coach-status')return;
      done=true;sw.removeEventListener('message',on);
      const {cached,total}=e.data;
      if(cached>=total)setOffline('Available offline',true,'Offline ready: the coach and all its chapters open without internet.');
      else setOffline('Saving an offline copy: '+Math.round(100*cached/Math.max(1,total))+'%','','Offline copy incomplete. Reload while online to retry.');
    };
    sw.addEventListener('message',on);
    if(sw.startMessages)sw.startMessages();
    reg.active.postMessage({type:'koii-coach-status'});
    setTimeout(()=>{if(!done){done=true;sw.removeEventListener('message',on);}},3000);
  },()=>setOffline(''));
}
// Every page registers the service worker, once it has loaded (so the precache never competes with the page itself).
// An install that fails (one file missing) leaves no active worker: the status says so.
if(navigator.serviceWorker&&secure){
  const register=()=>navigator.serviceWorker.register('./sw.js').then(reg=>{
    const w=reg.installing||reg.waiting;
    if(w)w.addEventListener('statechange',()=>{if(w.state==='redundant'&&!reg.active){failed=true;offline();}});
  },()=>{failed=true;offline();});
  if(document.readyState==='complete')register();else addEventListener('load',register,{once:true});
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

window.CoachShell={open,close,toggle:()=>sheet.open?close():open(),openSearch,setTitle,refresh};
})();
