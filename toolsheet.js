'use strict';
/* The Tools sheet of the chapter pages (docs/overhaul-plan.md 4.6, 5.7): one tap from every step (the player's Tools
   button, or T on a keyboard). player.js loads it (see below), so no page names it in a <script>.
   It opens on "For this step": the keys of the step's Do lines lit on the control map, numbered in press order; the
   troubleshooting topics the step links to, already open; "Fixes for this part", the part's "If it doesn't" as
   symptom cards (player.js, CoachPlayer.partFixes); the glossary words in the step; and the moves of the chapters
   you have finished. A step without topics or words falls back to the troubleshooting groups. The other tabs
   hold the whole control map, Troubleshooting, the Glossary and the Cheat sheet, and the field at the top opens the
   site search with what you type (its overlay opens over the sheet; closing it comes back here).

   Its content comes from the tool pages themselves (controls.html, help.html, glossary.html, cheat-sheet.html),
   fetched on first use (they are precached, so this works offline) and read with DOMParser; nothing is copied into
   this file. When a page cannot load, its tab links to the page instead.

   In the chapter's steps (both modes):
   - a link to a troubleshooting topic (./help.html#<topic>) opens the sheet at that topic, expanded;
   - once the glossary has loaded (after the page, when the browser is idle), the first use of a beginner word
     (glossary.html .term[data-beginner]) in a step's Before you press and Do lines gets a dotted underline, at most two
     per step. It is a link to the glossary; with this file it opens the Words tab at that word.
   A pad named with its group (B1) lights the group button and the pad printed with that number, as the course defines
   it ("tap B, then pad 1 (B1)"); the pads are named by the numbers printed on them, which the official guide also uses
   ("hold MAIN and select pads 1 - 9 to change project"). The map is the schematic from controls.html: every control where it
   is on the unit, not to scale.

   Beside the step card (aside#player-device, docs/overhaul-plan.md 5.5): on a short landscape screen (at most 480px
   high, at least 600px wide) the left 40% shows the step's keys lit and numbered in press order, with the press-order
   list; from 1200px wide the same panel sits on the right, and tapping a control there explains it in a fixed-height
   box. It shows in the step view only; html.has-device makes room for it (coach.css).

   window.CoachTools.open(opener, {tab: 'step'|'map'|'fixes'|'words'|'cheat', topic: <help id>, term: <term id>})
   player.js loads this file once the chapter page is idle (decision 19: it is not part of the first paint), or at once
   when Tools is pressed before that. */
(()=>{
const Shell=window.CoachShell,C=window.CoachChapter;
if(!Shell||!C)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const site=window.COACH_SITE||{};

// ---------- The sheet ----------
const TABS=[['step','For this step'],['map','Map'],['fixes','Fixes'],['words','Words'],['cheat','Cheat sheet']];
const sheet=el('dialog','sheet tools-sheet',
  `<div class="sheet-box"><div class="sheet-head tools-head"><h2 class="sr" id="tools-title">Tools</h2>`+
  `<div class="search-field">${icon('search')}<input type="search" id="tools-search" placeholder="Search the coach" aria-label="Search the coach" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" maxlength="120"></div>`+
  `<button class="icon-btn" type="button" data-close aria-label="Close tools" autofocus>${icon('close')}</button></div>`+
  `<div class="tools-tabs" role="tablist" aria-label="Tools">${TABS.map(([k,l])=>`<button type="button" role="tab" id="tools-tab-${k}" data-tab="${k}" aria-controls="tools-panel-${k}" aria-selected="false" tabindex="-1">${l}</button>`).join('')}</div>`+
  `<div class="sheet-body tools-body">${TABS.map(([k])=>`<section class="tools-panel" role="tabpanel" id="tools-panel-${k}" aria-labelledby="tools-tab-${k}" tabindex="0" hidden></section>`).join('')}`+
  `<ul class="tools-more"><li><a href="./learn.html">${icon('book')}Learn</a></li><li><a href="./lab.html">${icon('grid')}Rhythm lab</a></li><li><a href="./safety.html">${icon('warning')}Safety and erasing</a></li></ul></div></div>`);
sheet.id='tools-sheet';sheet.setAttribute('aria-labelledby','tools-title');
document.body.append(sheet);
const panel=k=>sheet.querySelector('#tools-panel-'+k),tabBtn=k=>sheet.querySelector('#tools-tab-'+k);
let opener=null,tab='step',want=null;
const modal=Shell.modal(sheet,null,()=>{});
sheet.addEventListener('close',()=>{document.documentElement.classList.remove('tools-docked');if(opener&&opener.offsetParent)opener.focus();opener=null;});
// From 1024px wide, with no right panel beside the step (1024–1199px, or a view without one), the sheet docks on the
// right and the page makes room for it, so it never covers the step card (plan 5.7).
const dockable=matchMedia('(min-width:1024px)');

// Search: what you type goes to the site search, which opens over this sheet.
const field=sheet.querySelector('#tools-search');
field.addEventListener('input',()=>{const q=field.value;if(!q.trim())return;field.value='';Shell.openSearch(q);});
field.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();Shell.openSearch(field.value);field.value='';}});

// Tabs: arrow keys move between them (and choose), Home and End jump.
function show(k){
  tab=k;
  TABS.forEach(([t])=>{const on=t===k;tabBtn(t).setAttribute('aria-selected',String(on));tabBtn(t).tabIndex=on?0:-1;panel(t).hidden=!on;});
  fill(k);
}
const tabs=sheet.querySelector('.tools-tabs');
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){show(b.dataset.tab);b.scrollIntoView({block:'nearest',inline:'nearest'});}});
tabs.addEventListener('keydown',e=>{
  const i=TABS.findIndex(([k])=>k===tab);let j=-1;
  if(e.key==='ArrowRight')j=(i+1)%TABS.length;else if(e.key==='ArrowLeft')j=(i+TABS.length-1)%TABS.length;
  else if(e.key==='Home')j=0;else if(e.key==='End')j=TABS.length-1;
  if(j<0)return;
  e.preventDefault();show(TABS[j][0]);const b=tabBtn(TABS[j][0]);b.focus();b.scrollIntoView({block:'nearest',inline:'nearest'});
});

// ---------- The tool pages, fetched once ----------
const cache={};
function page(href){
  if(!cache[href])cache[href]=fetch(href).then(r=>r.ok?r.text():Promise.reject(r.status)).then(t=>new DOMParser().parseFromString(t,'text/html'))
    .catch(e=>{delete cache[href];throw e;});
  return cache[href];
}
// Ids are dropped from what is shown here (they belong to the tool page); data-id keeps the topic or word.
const strip=n=>{const c=n.cloneNode(true);if(c.id){c.dataset.id=c.id;c.removeAttribute('id');}c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));return c;};
let data=null;
function load(){
  if(data)return data;
  data=Promise.all(['./help.html','./glossary.html','./controls.html','./cheat-sheet.html'].map(h=>page(h).catch(()=>null))).then(([help,gloss,ctrl,cheat])=>{
    const out={};
    if(!help||!gloss||!ctrl||!cheat)data=null;   // a page that failed is fetched again next time (page() dropped it)
    if(help)out.groups=[...help.querySelectorAll('.help-group')].map(g=>({title:clean((g.querySelector('h2')||{}).textContent),topics:[...g.querySelectorAll('details.topic')].map(d=>({id:d.id,title:clean(d.querySelector('summary').textContent),body:d.querySelector('.inside')}))}));
    if(gloss)out.terms=[...gloss.querySelectorAll('.term')].map(t=>{const name=clean(t.querySelector('dt').textContent);return{id:t.id,name,dd:t.querySelector('dd'),beginner:t.hasAttribute('data-beginner'),re:termRe(name)};});
    if(ctrl){out.device=ctrl.querySelector('.device');out.controls=new Map([...ctrl.querySelectorAll('[data-key][id^="control-"]')].map(d=>[d.dataset.key,d]));}
    if(cheat)out.cheat=[...cheat.querySelectorAll('main > section.card')];
    return out;
  });
  return data;
}
// "Amplitude (AMP)" is found as "amplitude" or "AMP"; "Backup / restore" as either word; plurals and -ed count.
function termRe(name){
  const alts=[];
  const base=name.replace(/\s*\(([^)]*)\)\s*/g,(m,inner)=>{if(/^[A-Z]{2,4}$/.test(inner))alts.push(inner);return ' ';}).trim();
  base.split(/\s+\/\s+/).forEach(a=>{if(a.length>2)alts.push(a);});
  if(!alts.length)return null;
  const q=alts.map(a=>a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+')).sort((a,b)=>b.length-a.length);
  return new RegExp('(^|[^\\p{L}\\p{N}-])('+q.join('|')+')(?:s|es|d|ed)?(?![\\p{L}\\p{N}-])','iu');
}

// ---------- A step's keys, topics and words ----------
const step=()=>window.CoachPlayer&&CoachPlayer.current();
// The controls named by the keycaps of a step's Do lines, in the order they appear. Before you press is left out: it
// guards the press and often names keys not to press ("Never hold SHIFT + SOUND on the trim page"). A data-recall
// step's Do lines count once "Show the presses" has shown them (player.js drops li.is-folded then).
const folded=li=>li.classList.contains('is-folded');
function keysOf(li){
  const out=[],marked=li.querySelector(':scope > :is(.step-do,.step-body)');
  if(folded(li))return out;   // its Do lines are not on screen yet
  // A step without a Do line (stage 1) is one text: its keys outside the check and the extras count.
  const caps=marked?li.querySelectorAll(':scope > .step-do kbd.key, :scope > .step-body kbd.key'):
    [...li.querySelectorAll('kbd.key')].filter(k=>!k.closest('.preflight,.step-check,.step-more,.step-note,.step-head,.pl-own'));
  caps.forEach(k=>{
    const t=clean(k.textContent),u=t.toUpperCase();let key=null;
    if(/^(MAIN|SOUND|TEMPO|TIMING|SAMPLE|KEYS|FX|SHIFT|ERASE|RECORD|PLAY|ENTER|FADER|X|Y|A|B|C|D)$/.test(u))key=u;
    else if(t==='−'||t==='-')key='MINUS';else if(t==='+')key='PLUS';
    else if(/^[A-D][1-9]$/.test(u)){out.push({key:u[0],pad:'PAD'+u[1],label:t});return;}   // B1: group B, then pad 1
    else{const m=/^(?:pad\s*)?([0-9.])$/i.exec(t);if(m)key='PAD'+m[1];}
    if(key)out.push({key,label:t});
  });
  return out;
}
const topicsOf=li=>[...new Set([...li.querySelectorAll('a[href*="help.html#"]')].map(a=>decodeURIComponent(a.getAttribute('href').split('#')[1]||'')).filter(Boolean))];
const stepText=li=>[...li.querySelectorAll(':scope > :is(.step-title,.preflight,.step-do,.step-body,.step-undo,.step-check,.step-note)')].map(e=>e.textContent).join(' ')||li.textContent;

// ---------- Panels ----------
// The schematic with the given keys lit and numbered; its display shows readout (the step's display values) when given.
function mapHTML(d,lit,interactive,readout){
  if(!d.device)return'';
  const c=strip(d.device),order=new Map();
  const screen=c.querySelector('.schem-display');if(screen&&readout!=null)screen.textContent=readout;
  lit.forEach((k,i)=>[k.key,k.pad].forEach(x=>{if(x&&!order.has(x))order.set(x,i+1);}));
  c.querySelectorAll('[role]').forEach(x=>x.removeAttribute('role'));
  c.querySelectorAll('.control').forEach(b=>{
    b.removeAttribute('aria-checked');b.removeAttribute('tabindex');
    const n=order.get(b.dataset.key);
    if(n){b.classList.add('hot');b.insertAdjacentHTML('beforeend',`<span class="order" aria-hidden="true">${n}</span>`);}
    if(!interactive){const s=el('span',b.className,b.innerHTML);s.dataset.key=b.dataset.key;s.setAttribute('style',b.getAttribute('style')||'');b.replaceWith(s);}
    else b.setAttribute('aria-pressed','false');
  });
  if(!interactive)c.setAttribute('aria-hidden','true');
  return c.outerHTML;
}
const topicHTML=(t,open,level)=>`<details class="topic tools-topic" data-topic="${esc(t.id)}"${open?' open':''}><summary><h${level} class="topic-title">${esc(t.title)}</h${level}></summary><div class="inside">${strip(t.body).innerHTML}<p class="meta"><a href="./help.html#${esc(t.id)}">Open in Troubleshooting</a></p></div></details>`;
const termHTML=t=>`<div class="term" data-term="${esc(t.id)}"><dt>${esc(t.name)}</dt><dd>${strip(t.dd).innerHTML}</dd></div>`;
const groupsHTML=(d,level)=>(d.groups||[]).map(g=>`<h${level} class="sub">${esc(g.title)}</h${level}>`+g.topics.map(t=>topicHTML(t,false,level+1)).join('')).join('');
const failed=(what,href)=>`<p class="notice caution">${what} could not load. Check your connection, or open <a href="${href}">the page</a>.</p>`;
const done=()=>window.CoachProgress?CoachProgress.chapters().filter(p=>p.done).map(p=>p.c.slug):[];

const filled={};
async function fill(k){
  const box=panel(k);
  if(k!=='step'&&filled[k])return after(k);
  box.innerHTML='<p class="meta tools-loading">Loading…</p>';
  const d=await load();
  if(k==='step')box.innerHTML=stepPanel(d);
  else if(k==='map')box.innerHTML=d.device?`<p class="meta">Tap a control to see what it does.</p>${mapHTML(d,[],true)}<div class="map-info card info" aria-live="polite"><p class="meta">Nothing chosen yet.</p></div><p class="meta">A schematic of the top of the unit, not to scale. <a href="./controls.html">Control map</a> explains every control.</p>`:failed('The control map','./controls.html');
  else if(k==='fixes')box.innerHTML=d.groups?groupsHTML(d,3):failed('Troubleshooting','./help.html');
  else if(k==='words')box.innerHTML=d.terms?`<dl class="gloss tools-gloss">${d.terms.map(termHTML).join('')}</dl>`:failed('The glossary','./glossary.html');
  else if(k==='cheat')box.innerHTML=d.cheat?cheatHTML(d):failed('The cheat sheet','./cheat-sheet.html');
  if(window.CoachShell&&CoachShell.glue)CoachShell.glue(box);   // punctuation stays with its keycap (shell.js)
  filled[k]=true;
  after(k);
}
// What the display should show in this step: the display values of its Do and Check lines, in order.
const readoutOf=li=>{const v=[...new Set([...li.querySelectorAll(':scope > :is(.step-do,.step-check) samp.lcd')].map(s=>clean(s.textContent)))];return v.length?v.slice(0,3).join(' · ')+(v.length>3?' …':''):'';};
const keysHTML=(d,keys,interactive,li)=>mapHTML(d,keys,interactive,li?readoutOf(li):null)+
  `<ol class="press-order">${keys.map((k,i)=>`<li><span class="po-n" aria-hidden="true">${i+1}</span><kbd class="key">${esc(k.label)}</kbd></li>`).join('')}</ol>`;
function stepPanel(d){
  const li=step();
  if(!li)return`<p>Open a step to see its keys, fixes and words here.</p>`+(d.groups?'<h3 class="sub">Troubleshooting</h3>'+groupsHTML(d,4):failed('Troubleshooting','./help.html'));
  const keys=keysOf(li),ids=topicsOf(li),all=(d.groups||[]).flatMap(g=>g.topics),topics=ids.map(id=>all.find(t=>t.id===id)).filter(Boolean);
  // "Step" and "pad" name the coach's steps and every pad press, so they are left out of this list.
  const text=stepText(li),words=(d.terms||[]).filter(t=>t.re&&!/^term-(step|pad)$/.test(t.id)&&t.re.test(text)).sort((a,b)=>b.beginner-a.beginner).slice(0,8);
  const title=li.querySelector(':scope > .step-title'),name=title?clean([...title.childNodes].filter(n=>!(n.nodeType===1&&n.classList.contains('pl-own'))).map(n=>n.textContent).join('')):'';
  // Within its part, as the step card counts (plan 4: "Part 2 · …", "Step 4 of 8").
  const sec=li.closest('details'),k=[...li.parentElement.children].filter(x=>x.matches('li[data-step]')).indexOf(li)+1;
  const pn=(/Part\s+(\d+)/.exec(sec&&sec.querySelector('summary')?sec.querySelector('summary').textContent:'')||[])[1];
  let h=`<p class="tools-eyebrow">For ${pn?'Part '+pn+', step '+k:'this step'}${name?': '+esc(name):''}</p>`;
  if(keys.length&&d.device)h+=`<h3 class="sub">Keys in press order</h3>${keysHTML(d,keys,false,li)}`;
  if(topics.length)h+='<h3 class="sub">Fixes for this step</h3>'+topics.map(t=>topicHTML(t,true,4)).join('');
  const part=window.CoachPlayer&&CoachPlayer.partFixes?CoachPlayer.partFixes(li):'';
  if(part)h+='<h3 class="sub">Fixes for this part</h3>'+part;
  if(words.length)h+=`<h3 class="sub">Words in this step</h3><dl class="gloss tools-gloss">${words.map(termHTML).join('')}</dl>`;
  const mine=done(),moves=(d.cheat||[]).filter(s=>mine.includes(s.dataset.chapter)&&s.querySelector('.moves'));
  if(moves.length)h+='<h3 class="sub">Moves you know</h3>'+moves.map(s=>`<p class="meta">${esc(clean(s.querySelector('h2').textContent))}</p>${strip(s.querySelector('.moves')).outerHTML}`).join('');
  if(!topics.length&&!words.length)h+='<h3 class="sub">Troubleshooting</h3>'+(d.groups?groupsHTML(d,4):failed('Troubleshooting','./help.html'));
  return h;
}
// The cheat sheet's sections; "Only chapters I've done" keeps those of finished chapters (and the general ones).
let onlyDone=false;
function cheatHTML(d){
  const mine=done();
  return `<label class="tools-filter"><input type="checkbox" data-only-done${onlyDone?' checked':''}> Only chapters I’ve done</label>`+
    d.cheat.map(s=>{const ch=s.dataset.chapter||'',hide=onlyDone&&ch&&!mine.includes(ch);const c=strip(s);c.classList.remove('card');c.classList.add('tools-cheat');
      c.querySelectorAll('h2').forEach(x=>{const h=el('h3','sub',x.innerHTML);x.replaceWith(h);});c.querySelectorAll('h3:not(.sub)').forEach(x=>{const h=el('h4','',x.innerHTML);x.replaceWith(h);});
      if(hide)c.hidden=true;return c.outerHTML;}).join('');
}
// After a panel is filled: open and show the topic or word asked for.
function after(k){
  const box=panel(k),w=want;want=null;
  if(!w)return;
  const target=w.topic?box.querySelector(`[data-topic="${CSS.escape(w.topic)}"]`):w.term?box.querySelector(`[data-term="${CSS.escape(w.term)}"]`):null;
  if(!target)return;
  if(target.tagName==='DETAILS')target.open=true;
  target.classList.add('tools-hit');
  setTimeout(()=>target.classList.remove('tools-hit'),2000);
  target.scrollIntoView({block:'start'});
  const f=target.querySelector('summary')||target;if(!f.matches('summary'))f.tabIndex=-1;
  f.focus({preventScroll:true});
}
// Tapping a control on an interactive map (the Map tab, the desktop device panel) explains it.
function explain(e){
  const b=e.target.closest(':is(.tools-panel,.player-device) .control[aria-pressed]');
  if(b){
    const box=b.closest('.tools-panel,.player-device');
    box.querySelectorAll('.control[aria-pressed="true"]').forEach(x=>x.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true');
    load().then(d=>{
      const info=box.querySelector('.map-info'),c=d.controls&&d.controls.get(b.dataset.key);
      if(info)info.innerHTML=c?`<h3>${esc(clean(c.querySelector('dt').textContent))}</h3>${strip(c.querySelector('dd')).innerHTML}`:`<p>${esc(b.getAttribute('aria-label')||clean(b.textContent))}: one of the pads. What it does depends on the mode; <a href="./controls.html">Control map</a> explains each one.</p>`;
    });
  }
}
sheet.addEventListener('click',explain);
sheet.addEventListener('change',e=>{
  if(!e.target.matches('[data-only-done]'))return;
  onlyDone=e.target.checked;
  const mine=done();
  panel('cheat').querySelectorAll('.tools-cheat').forEach(s=>{const ch=s.dataset.chapter||'';s.hidden=onlyDone&&Boolean(ch)&&!mine.includes(ch);});
});

function open(from,o){
  o=o||{};
  opener=from||document.activeElement;
  want=o.topic||o.term?{topic:o.topic,term:o.term}:null;
  filled.step=false;   // "For this step" follows the step on screen
  if(!sheet.open){document.documentElement.classList.toggle('tools-docked',dockable.matches&&!document.documentElement.classList.contains('has-device'));modal.open();}
  show(o.tab||'step');
  if(!want){const t=tabBtn(tab);t.focus();}
}
window.CoachTools={open};   // T opens it too: player.js registers the shortcut, so it works before this file has loaded
// The view changed: refresh the Tools button (player.js shows it when CoachTools exists).
document.addEventListener('coach:view',()=>{if(sheet.open&&tab==='step')fill('step');});

// ---------- The device panel beside the step card ----------
const side=matchMedia('(max-height:480px) and (orientation:landscape) and (min-width:600px), (min-width:1200px)'),wide=matchMedia('(min-width:1200px)');
const dev=el('aside','player-device pl-own');
dev.id='player-device';dev.setAttribute('aria-labelledby','player-device-title');dev.hidden=true;
document.body.append(dev);
dev.addEventListener('click',explain);
let devFor='';
async function device(){
  const li=step(),on=Boolean(side.matches&&document.documentElement.dataset.player==='step'&&li);
  dev.hidden=!on;document.documentElement.classList.toggle('has-device',on);
  if(!on){devFor='';return;}
  const key=li.dataset.step+(folded(li)?':folded':'')+(wide.matches?':wide':':short');
  if(key===devFor)return;
  devFor=key;
  const d=await load();
  if(step()!==li||devFor!==key)return;
  const keys=keysOf(li);
  dev.innerHTML=`<h2 class="device-title" id="player-device-title">Keys for this step</h2>`+
    (keys.length&&d.device?keysHTML(d,keys,wide.matches,li)+(wide.matches?'<div class="map-info card info" aria-live="polite"><p class="meta">Tap a control to see what it does.</p></div>':''):
      d.device?`<p class="meta">${folded(li)?'The keys light up once you show the presses.':'No keys to press in this step.'}</p>`:failed('The control map','./controls.html'));
}
document.addEventListener('coach:view',device);
[side,wide].forEach(m=>{const f=()=>{devFor='';device();};if(m.addEventListener)m.addEventListener('change',f);else if(m.addListener)m.addListener(f);});
device();

// ---------- Inside the steps: help links open the sheet; beginner words get a dotted underline ----------
const steps=C.steps();
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  const a=e.target.closest&&e.target.closest('.steps li a[href*="help.html#"], .steps li a.term-link');
  if(!a)return;
  e.preventDefault();
  if(a.classList.contains('term-link'))open(a,{tab:'words',term:a.dataset.term});
  else{let id=a.getAttribute('href').split('#')[1]||'';try{id=decodeURIComponent(id);}catch(x){}open(a,{tab:'fixes',topic:id});}
});
function underline(d){
  const words=(d.terms||[]).filter(t=>t.beginner&&t.re);
  if(!words.length)return;
  steps.forEach(li=>{
    let n=0;const used=new Set();
    li.querySelectorAll(':scope > :is(.preflight,.step-do)').forEach(p=>{
      if(n>=2)return;
      const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT,{acceptNode:x=>x.parentElement.closest('kbd,a,samp,code,.pl-own,.sr,b')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      for(const node of nodes){
        if(n>=2)break;
        for(const t of words){
          if(n>=2||used.has(t.id))continue;
          const m=t.re.exec(node.nodeValue);if(!m)continue;
          used.add(t.id);n++;
          const start=m.index+m[1].length,word=m[0].slice(m[1].length);
          const rest=node.splitText(start);rest.splitText(word.length);
          const a=el('a','term-link');a.href='./glossary.html#'+t.id;a.dataset.term=t.id;a.textContent=rest.nodeValue;
          a.title=clean(t.dd.textContent).slice(0,140);
          rest.replaceWith(a);
          break;   // this text node is now split: the next word is looked for in the next node
        }
      }
    });
  });
}
const idle=window.requestIdleCallback||(f=>setTimeout(f,1500));
if(document.readyState==='complete')idle(()=>load().then(underline));else addEventListener('load',()=>idle(()=>load().then(underline)),{once:true});
})();
