'use strict';
/* The shared shell on every page: the app bar, the menu sheet (phones and tablets), the rail (desktop), the Search
   button with its overlay, keyboard shortcuts, the offline status and the install entry.
   Load it as a plain, synchronous script straight after the page's static <header class="appbar" id="appbar">,
   after site.js and progress.js. It runs while the page is still loading, so the course and tool links exist before
   any page script. The link to the page in front of us carries aria-current="page". Without JavaScript the static
   header stays a plain link home.

   App bar: [≡] wordmark, the title, then <div class="appbar-actions" id="appbar-actions"> with Search (.search-btn; a
   search field from 1024px) and, from 1024px, Settings. A page script may add its own .icon-btn there (chapter pages
   add the sun and ⋮). On chapter pages under 1024px the Search button is left out: the Tools sheet holds search, and
   "/" opens it from anywhere. The title is two lines: a kicker over the name ("CHAPTER 3" over "Sample, chop &
   resample"), or, in a chapter's player, the name over where you are ("Part 2 · Build a drum kit · Step 4 of 8").
   Under the bar of a chapter page runs a 4px meter of the chapter's progress (setMeter).

   Menu: one set of links serves both layouts: under 1024px they live in the menu sheet (<dialog id="shell-menu">),
   from 1024px in the rail (#shell-rail) on the left, always visible. The nodes move; they are never copied, so a
   page selector such as nav a[href="./lab.html"] matches exactly one element. A chapter page adds a "This chapter"
   part (registerChapter): the sheet then has two tabs, This chapter and Course, and the rail shows the chapter above
   the course. The Course part starts with a Continue row and ends with the offline status and Install.

   Search costs nothing until it is used: the first tap builds the overlay's frame (<dialog id="site-search-dialog">,
   focused at once so a phone's keyboard opens inside the tap) and loads search.js, which holds the index and the
   matching. "/" and Ctrl/Cmd+K open it too.

   Keyboard shortcuts (plan 5.3): / search, M menu, ? the list of shortcuts, and whatever a page adds (T for Tools in a
   chapter). They never fire while typing, inside a dialog or a composite widget (tabs, radio group, grid, list box),
   and Settings can switch the letter shortcuts off (koii-coach-prefs.keys = false). Ctrl/Cmd+K always works.

   window.CoachShell:
     open() / close(after) / toggle()   the menu sheet (desktop: focuses the rail). close(after) runs after() once the
                            sheet's history entry is gone, so a replaceState then lands on the right entry
     openSearch(query)      opens the Search overlay, with the text field already holding query if one is given
     setTitle(name, kicker, sub)   the app bar title; with sub, the name sits over sub and the kicker is hidden
     setMeter(fraction)     the chapter meter under the bar (0-1), or null to hide it
     registerChapter({render(container, where)})   adds the "This chapter" part; render fills container ('sheet' or
                            'rail') and is called whenever the menu opens or refreshChapter() runs. Returns the two
                            containers, so the page can listen for clicks in them
     refreshChapter()       re-renders the "This chapter" part where it shows
     modal(dialog, opener, before)   the history-aware open/close of a <dialog> (Back closes it), for page sheets
     addShortcut(key, label, run)    a page shortcut; run null lists it only
     refresh()              re-reads saved progress and the offline status; call it after saving progress
   Progress is only read here, never written (koii-coach-ch-<slug>, the legacy keys, CoachProgress).

   The shell also registers the service worker (sw.js) for every page, once the page has loaded, and reports the
   offline copy: a short line in the menu, and a sentence in any #offline or .offline-status element on the page
   ("Offline ready: the coach and all its chapters open without internet." once every file is saved). When the
   offline copy could not be saved, a Retry button appears in the menu and in any .offline-retry element. Any
   .install-slot element (and the menu) gets the Install button where the browser offers one, or the iPhone hint. */
(()=>{
const site=window.COACH_SITE,bar=document.getElementById('appbar');
if(!site||!bar){console.error('shell.js: load site.js first and put <header class="appbar" id="appbar"> before shell.js');return;}
const root=document.documentElement,body=document.body;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
// Settings › While practising, read by coach.css: text 'larger' sets Do at 30/40, hand 'left' puts Done · Next on the left.
(p=>{p=p||{};root.dataset.text=p.text==='larger'?'larger':'default';root.dataset.hand=p.hand==='left'?'left':'right';})(window.CoachProgress?CoachProgress.prefs():read('koii-coach-prefs'));

// Where are we? A chapter page names itself in <body data-chapter>; a tool page is found by its file name.
const file=(p=>{try{return decodeURIComponent(p);}catch(e){return p;}})(location.pathname.split('/').pop()||'index.html');
const slug=body.dataset.chapter||'';
const items=[...site.chapters,...site.tools];
const current=slug?site.chapters.find(c=>c.slug===slug):items.find(i=>i.href.replace(/^\.\//,'')===file);
if(slug&&!current)console.warn('shell.js: <body data-chapter="'+slug+'"> is not in site.js');
const attrs=i=>`href="${esc(i.href)}"`+(i===current?' aria-current="page"':'');
if(slug)root.classList.add('on-chapter');

// ---------- App bar ----------
bar.innerHTML=`<button class="icon-btn menu-btn" type="button" aria-label="Menu" aria-haspopup="dialog" aria-controls="shell-menu" aria-expanded="false" aria-keyshortcuts="M">${icon('menu')}</button>`+
  `<a class="wordmark" href="./index.html"><span>K.O. II</span> <span class="wordmark-sep" aria-hidden="true">/</span> <span>COACH</span></a>`+
  `<p class="bar-title"><span class="bar-kicker"></span><span class="bar-name"></span><span class="bar-sub"></span></p>`+
  `<div class="appbar-actions" id="appbar-actions"><button class="icon-btn search-btn" type="button" aria-label="Search" aria-haspopup="dialog" aria-expanded="false" aria-keyshortcuts="/">${icon('search')}<span class="search-btn-label" aria-hidden="true">Search the coach</span><kbd class="key" aria-hidden="true">/</kbd></button>`+
  `<a class="icon-btn settings-btn" href="./settings.html" aria-label="Settings"${file==='settings.html'?' aria-current="page"':''}>${icon('settings')}</a></div>`+
  `<span class="appbar-meter" aria-hidden="true" hidden><span class="meter-fill"></span></span>`;
const menuBtn=bar.querySelector('.menu-btn'),searchBtn=bar.querySelector('.search-btn'),titleEl=bar.querySelector('.bar-title'),meterEl=bar.querySelector('.appbar-meter');
function setTitle(name,kicker,sub){
  titleEl.querySelector('.bar-name').textContent=name||'';
  titleEl.querySelector('.bar-kicker').textContent=kicker||'';
  titleEl.querySelector('.bar-sub').textContent=sub||'';
  titleEl.classList.toggle('has-name',Boolean(name));
  titleEl.classList.toggle('has-sub',Boolean(sub));
}
function setMeter(f){
  meterEl.hidden=f==null;
  if(f!=null)meterEl.firstChild.style.width=Math.round(100*Math.max(0,Math.min(1,f)))+'%';
}
const titleFor=i=>i.num?setTitle(i.title,'Chapter '+i.num):setTitle(i.title,'');
if(current)titleFor(current);

// ---------- Course and tool lists, Continue, offline, install, links (one node, moved between sheet and rail) ----------
const nav=el('div','shell-nav');
nav.innerHTML=`<p class="menu-continue-row" hidden></p><nav class="course-nav" aria-label="Course"><p class="nav-label" aria-hidden="true">Course</p><ol>`+
  site.chapters.map(c=>`<li data-state="todo"><a ${attrs(c)}><span class="led" aria-hidden="true"></span><span class="num">${esc(c.num)}</span><span class="name">${esc(c.title)}</span><span class="count" aria-hidden="true"></span><span class="sr state"></span></a></li>`).join('')+
  `</ol></nav><nav class="tools-nav" aria-label="Tools"><p class="nav-label" aria-hidden="true">Tools</p><ul>`+
  site.tools.map(t=>`<li><a ${attrs(t)}>${icon(t.icon)}<span class="name">${esc(t.title)}</span></a></li>`).join('')+
  `</ul></nav><div class="shell-meta"><div class="offline-line" id="shell-offline"></div><div class="install-slot"></div>`+
  `<p><a href="${esc(site.report)}" target="_blank" rel="noopener noreferrer">Report a wrong instruction<span class="sr"> (opens in a new tab)</span></a></p>`+
  `<p><a href="${esc(site.repo)}" target="_blank" rel="noopener noreferrer">Source code<span class="sr"> (opens in a new tab)</span></a></p>`+
  `<p class="keys-hint"><button class="btn ghost" type="button" data-keys>Keyboard shortcuts</button></p></div>`;

const rail=el('div','rail');rail.id='shell-rail';
const sheet=el('dialog','sheet');
sheet.id='shell-menu';sheet.setAttribute('aria-labelledby','shell-menu-title');
sheet.innerHTML=`<div class="sheet-box"><div class="sheet-head"><h2 class="sheet-title" id="shell-menu-title">Menu</h2>`+
  `<button class="icon-btn" type="button" data-close aria-label="Close menu">${icon('close')}</button></div><div class="sheet-body"></div></div>`;
const sheetBody=sheet.querySelector('.sheet-body');
// The two tabs, shown once a chapter registers its part.
const tabs=el('div','menu-tabs',`<button type="button" data-tab="chapter" aria-pressed="true">This chapter</button><button type="button" data-tab="course" aria-pressed="false">Course</button>`);
tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Show');tabs.hidden=true;
const chapterPane=el('div','chapter-pane'),coursePane=el('div','course-pane'),railChapter=el('section','rail-chapter');
chapterPane.hidden=true;railChapter.hidden=true;railChapter.setAttribute('aria-label','This chapter');
sheetBody.append(tabs,chapterPane,coursePane);
bar.after(rail,sheet);
root.classList.add('shell-on');

const wide=matchMedia('(min-width:1024px)');
let chapter=null,tab='chapter';
function place(){
  if(wide.matches){if(sheet.open)close();rail.append(railChapter,nav);railChapter.hidden=!chapter;if(chapter)chapter.render(railChapter,'rail');}
  else coursePane.append(nav);
}
place();
if(wide.addEventListener)wide.addEventListener('change',place);else if(wide.addListener)wide.addListener(place);
function showTab(t){
  tab=t;
  tabs.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===t)));
  chapterPane.hidden=!chapter||t!=='chapter';coursePane.hidden=Boolean(chapter)&&t!=='course';
}
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)showTab(b.dataset.tab);});

// ---------- Dialogs ----------
// Opening one adds a history entry so a phone's Back button closes it; however it closes (Back, Esc, the backdrop,
// its close button) that entry is removed again. Following a link from inside it first removes the entry, then
// follows the link, so Back afterwards goes where you expect. close(after) runs after() at that same moment.
// before() runs just ahead of opening; focus returns to the opener.
function modal(dlg,opener,before){
  let pushed=false,popping=false,pending=null,passing=false,down=null;
  function open(){
    if(dlg.open)return;
    if(before)before();
    if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
    if(opener)opener.setAttribute('aria-expanded','true');
    try{history.pushState({coachDialog:dlg.id},'');pushed=true;}catch(e){pushed=false;}
  }
  function close(after){
    if(typeof after==='function')pending=after;
    if(!dlg.open){follow();return;}
    if(typeof dlg.close==='function')dlg.close();else{dlg.removeAttribute('open');dlg.dispatchEvent(new Event('close'));}
  }
  function follow(){
    if(!pending)return;
    const p=pending;pending=null;
    if(typeof p==='function'){try{p();}catch(e){console.error(e);}return;}
    passing=true;
    try{p.click();}finally{passing=false;}
  }
  dlg.addEventListener('close',()=>{
    if(opener)opener.setAttribute('aria-expanded','false');
    if(pushed){
      pushed=false;popping=true;history.back();
      if(pending)setTimeout(()=>{if(popping){popping=false;follow();}},500);   // in case the Back never arrives
    }else follow();
    if(!pending&&opener&&opener.offsetParent)opener.focus();
  });
  addEventListener('popstate',()=>{
    if(popping){popping=false;follow();return;}
    // A dialog opened over this one (search over the Tools sheet) went back to this one's entry: this one stays open.
    if(pushed&&history.state&&history.state.coachDialog===dlg.id)return;
    if(pushed){pushed=false;close();}   // the Back button closed the dialog
  });
  // Capture phase, so this runs before the page's own link handlers.
  dlg.addEventListener('pointerdown',e=>{down=e.target;},true);
  dlg.addEventListener('click',e=>{
    const from=down;down=null;
    if(e.target===dlg){if(!from||from===dlg)close();return;}   // a tap on the backdrop lands on the <dialog> itself (a drag that ends there does not count)
    if(e.target.closest('[data-close]')){close();return;}
    const a=e.target.closest('a[href]');
    if(!a||passing||a.hasAttribute('data-stay'))return;   // data-stay: the dialog handles this link itself
    if(e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank')return;
    if(pushed){e.preventDefault();e.stopPropagation();pending=a;}
    close();
  },true);
  return{open,close,get isOpen(){return dlg.open;}};
}

// ---------- Menu sheet ----------
const menu=modal(sheet,menuBtn,()=>{refresh();if(chapter){chapter.render(chapterPane,'sheet');showTab(tab);}});
function open(){
  if(wide.matches){const a=railChapter.querySelector('[aria-current]')||nav.querySelector('[aria-current="page"]')||nav.querySelector('a');if(a)a.focus();return;}
  menu.open();
}
function close(after){menu.close(after);}
menuBtn.addEventListener('click',open);
function registerChapter(o){
  chapter=o;tabs.hidden=false;showTab('chapter');
  place();
  return{sheet:chapterPane,rail:railChapter};
}
function refreshChapter(){
  if(!chapter)return;
  if(wide.matches)chapter.render(railChapter,'rail');
  else if(sheet.open)chapter.render(chapterPane,'sheet');
}

// ---------- Search ----------
// Nothing is added to a page until someone searches. The first time, the overlay's frame is built and the field
// focused straight away (inside the tap, so a phone's keyboard opens); then search.js, which holds the index and the
// matching, loads and takes over the frame. If it cannot load, the overlay says so and points to Troubleshooting.
let finder=null,field=null,loading=false,early=false;
function searchFrame(){
  const d=document.createElement('dialog'),types=[['all','All'],['step','Steps'],['help','Help'],['learn','Learn'],['word','Words'],['cheat','Cheat sheet']];
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
  const v=(window.COACH_SITE||{}).version;
  s.src='./search.js'+(v?'?v='+encodeURIComponent(v):'');   // tagged like the page's own files (build_site.py), so a stale HTTP-cached copy is not used
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
  // From inside another sheet (the Tools sheet's search field), that sheet stays open underneath.
  finder.open();
  field.focus();
  // A query handed over (from the Tools sheet's field) keeps the caret at its end, so typing carries on.
  if(typeof query==='string'){field.value=query;field.dispatchEvent(new Event('input'));field.setSelectionRange(query.length,query.length);}
  else field.select();
  loadSearch();
}
searchBtn.addEventListener('click',()=>openSearch());

// ---------- Keyboard shortcuts ----------
const keysOn=()=>(window.CoachProgress?CoachProgress.prefs():read('koii-coach-prefs')||{}).keys!==false;
const shortcuts=[];
function addShortcut(key,label,run){shortcuts.push({key,label,run:run||null});}
addShortcut('/','Search',()=>openSearch());
addShortcut('m','Menu',()=>open());
addShortcut('?','This list of shortcuts',()=>showKeys());
let keysDlg=null,keysModal=null;
function showKeys(){
  if(!keysDlg){
    keysDlg=el('dialog','sheet keys-sheet');keysDlg.id='shell-keys';keysDlg.setAttribute('aria-labelledby','shell-keys-title');
    document.body.append(keysDlg);
    keysModal=modal(keysDlg,null);
  }
  const name=k=>k===' '?'Space':k.length===1?k.toUpperCase():k;
  keysDlg.innerHTML=`<div class="sheet-box"><div class="sheet-head"><h2 class="sheet-title" id="shell-keys-title">Keyboard shortcuts</h2>`+
    `<button class="icon-btn" type="button" data-close aria-label="Close">${icon('close')}</button></div><div class="sheet-body"><dl class="keys-list">`+
    shortcuts.map(s=>`<div><dt><kbd class="key">${esc(name(s.key))}</kbd></dt><dd>${esc(s.label)}</dd></div>`).join('')+
    `<div><dt><kbd class="key">Ctrl</kbd> + <kbd class="key">K</kbd></dt><dd>Search, from anywhere</dd></div></dl>`+
    `<p class="meta">${keysOn()?'Letter shortcuts are on.':'Letter shortcuts are off.'} You can switch them ${keysOn()?'off':'on'} in <a href="./settings.html">Settings</a>. They never fire while you type in a field.</p></div></div>`;
  keysModal.open();
}
nav.querySelector('[data-keys]').addEventListener('click',()=>{if(menu.isOpen)close(showKeys);else showKeys();});
document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.altKey||e.isComposing)return;
  const t=e.target,key=(e.key||'').toLowerCase();
  const typing=t&&(t.isContentEditable||/^(?:TEXTAREA|SELECT)$/.test(t.tagName)||t.tagName==='INPUT'&&!/^(?:checkbox|radio|button|submit|reset|range|color|file)$/.test(t.type));
  if(key==='k'&&(e.ctrlKey||e.metaKey)&&!document.querySelector('dialog[open]')){e.preventDefault();openSearch();return;}
  if(e.ctrlKey||e.metaKey||typing||!keysOn()||document.querySelector('dialog[open]'))return;
  if(t&&t.closest&&t.closest('[role="tablist"],[role="radiogroup"],[role="grid"],[role="listbox"],[role="dialog"]'))return;
  const s=shortcuts.find(x=>x.run&&x.key===(e.key==='?'?'?':key));
  if(!s)return;
  e.preventDefault();s.run();
});

// ---------- Progress counts (read-only) and LED states ----------
function doneCount(c){
  const v=read('koii-coach-ch-'+c.slug);
  if(v&&Array.isArray(v.done))return Number.isInteger(v.n)?v.n:v.done.length;
  const old=c.legacy?read(c.legacy):null;
  return Array.isArray(old)?old.length:0;
}
// Optional steps the learner skipped (and has not ticked since) do not count.
function skipped(c){
  const v=read('koii-coach-ch-'+c.slug);
  return v&&Array.isArray(v.skip)&&Array.isArray(v.done)?new Set(v.skip.filter(id=>typeof id==='string'&&!v.done.includes(id))).size:0;
}
// The page in front of us knows its real step count; site.js is only a fallback for the other chapters.
function liveTotal(c){
  if(c===current&&c.slug){const n=document.querySelectorAll('.steps ol>li[data-step]').length;if(n)return n;}
  return c.steps;
}
function counts(){
  site.chapters.forEach((c,i)=>{
    const li=nav.querySelectorAll('.course-nav li')[i];if(!li||!c.steps)return;
    const total=Math.max(1,liveTotal(c)-skipped(c)),x=Math.max(0,Math.min(total,doneCount(c)||0));
    li.dataset.state=x>=total?'done':x>0?'doing':'todo';
    li.querySelector('.count').innerHTML=x>=total?icon('check')+'Done':x+'/'+total;
    li.querySelector('.state').textContent=x>=total?', done':x>0?`, ${x} of ${total} steps done`:', not started';
  });
  // Continue row: where Home's Continue goes (hidden while that is this very page's chapter start, or nothing).
  const row=nav.querySelector('.menu-continue-row'),P=window.CoachProgress,p=P&&P.continueTarget();
  row.hidden=!p;
  if(p){
    const started=p.x>0||p.at>0;
    row.innerHTML=`<a class="menu-continue" href="${esc(p.href)}">${icon('next')}<span><span class="mc-kicker">${started?'Continue':'Next'} · Chapter ${esc(p.c.num)}</span><span class="mc-name">${esc(p.c.title)}</span></span></a>`;
  }
}
function refresh(){counts();offline();install();refreshChapter();}
let checked=false;
function checkCounts(){
  if(checked)return;checked=true;
  site.chapters.forEach(c=>{const n=liveTotal(c);if(n!==c.steps)console.warn(`shell.js: site.js says chapter ${c.num} has ${c.steps} steps, but it has ${n}. Update "steps" in site.js.`);});
}

// ---------- Offline status ----------
// The menu's short line (#shell-offline), the page's own sentence (#offline, .offline-status) and, when the copy
// could not be saved, a Retry button (in the menu and in any .offline-retry element).
const offEl=nav.querySelector('#shell-offline');
let failed=false;
function setOffline(text,ready,long){
  offEl.innerHTML=text?`<p class="offline-text">${icon(ready?'check':'offline')}<span>${esc(text)}</span></p>`:'';offEl.classList.toggle('ready',Boolean(ready));
  document.querySelectorAll('#offline,.offline-status').forEach(e=>{e.textContent=long||(text?text+'.':'');});
  const retry='<button class="btn ghost" type="button" data-retry>Retry</button>';
  if(failed)offEl.insertAdjacentHTML('beforeend',retry);
  document.querySelectorAll('.offline-retry').forEach(e=>{e.innerHTML=failed?retry:'';});
}
const secure=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
function offline(){
  const sw=navigator.serviceWorker;
  if(location.protocol==='file:')return setOffline('Offline use needs the online site, not a local file','','Offline caching needs the online site, not a local file.');
  if(!sw||!secure)return setOffline('This browser cannot keep an offline copy');
  if(failed)return setOffline('Offline copy incomplete','','Offline copy incomplete. Retry while online.');
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
// An install that fails (one file missing) leaves no active worker: the status says so, and Retry tries again.
function register(){
  if(!navigator.serviceWorker||!secure)return;
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    const w=reg.installing||reg.waiting;
    if(w)w.addEventListener('statechange',()=>{if(w.state==='redundant'&&!reg.active){failed=true;offline();}});
    if(reg.active)reg.update().catch(()=>{});
  },()=>{failed=true;offline();});
}
// A new release took over this open page (its service worker activated): this page and what it loads next could
// come from different releases, so offer a reload. Not on the first install, when there was no worker before.
let hadWorker=Boolean(navigator.serviceWorker&&navigator.serviceWorker.controller);
function updated(){
  if(!hadWorker){hadWorker=true;return;}
  let el=document.getElementById('toast');
  if(!el){el=document.createElement('div');el.id='toast';el.className='toast hidden';el.setAttribute('role','status');document.body.append(el);}
  el.innerHTML='<span>Coach updated</span><button class="btn" type="button" data-reload>Reload</button>';
  el.classList.remove('hidden');el.hidden=false;
  el.querySelector('[data-reload]').addEventListener('click',()=>location.reload());
}
if(navigator.serviceWorker&&secure){
  if(document.readyState==='complete')register();else addEventListener('load',register,{once:true});
  navigator.serviceWorker.ready.then(offline,()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{offline();updated();});
}
document.addEventListener('click',e=>{
  if(!e.target.closest||!e.target.closest('[data-retry]'))return;
  failed=false;offline();register();
});

// ---------- Install ----------
// Chrome and Edge offer an install prompt (beforeinstallprompt); Safari on iPhone and iPad only has Share > Add to
// Home Screen, so it gets that hint. An installed copy says so.
let prompt=null;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=/iP(?:hone|ad|od)/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;install();});
addEventListener('appinstalled',()=>{prompt=null;install();});
function install(){
  const html=standalone()?'<p class="meta">Installed: open the coach from your home screen.</p>':
    prompt?'<p><button class="btn" type="button" data-install>Install the app</button></p>':
    ios?'<p class="meta">To install: tap Share, then Add to Home Screen.</p>':'';
  document.querySelectorAll('.install-slot').forEach(e=>{e.innerHTML=html;});
}
document.addEventListener('click',e=>{
  if(!e.target.closest||!e.target.closest('[data-install]')||!prompt)return;
  const p=prompt;prompt=null;
  p.prompt();
  (p.userChoice||Promise.resolve()).then(install,install);
});

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

window.CoachShell={open,close,toggle:()=>sheet.open?close():open(),openSearch,setTitle,setMeter,refresh,registerChapter,refreshChapter,modal,addShortcut};
})();
