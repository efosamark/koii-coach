'use strict';
/* The step player for the chapter pages (00 and 07-11): a start screen, one step at a time with a fixed action bar, a
   checkpoint card after each part and a chapter-complete screen. Load it straight after chapter.js:
     <script src="player.js" defer></script>
   It reads the page's own markup and never re-renders it: other steps, parts and page sections are only hidden
   (the hidden attribute), so ids, ticks, anchors and the list stay exactly as they are. Ticks, cur and the progress
   bar come from chapter.js (window.CoachChapter), so the list, the bar and the player always agree. Without
   JavaScript nothing here runs and the page reads top to bottom as before. Spec: docs/overhaul-plan.md 5.2-5.13.

   Markup it reads (section.steps > details, one per part):
     summary "NN / Part title"; p with <b>Goal:</b> and other notes; p.checkpoint; the p starting <b>If it doesn't:</b>
     ol > li[data-step]: the step. Inside it, when the chapter has been marked up:
       p.preflight   the check that keeps a risky press safe (shown first, in a caution box)
       p.step-do     the instruction (large); a step without one is a stage-1 step: its whole text is shown large
       p.step-check  what you should hear or see (its own block, with an ear or an eye)
     li[data-risk="erase"]              recoverable clear: amber "Clears notes" tag, no gate
     li[data-risk="delete"|"overwrite"] no undo: red tag, and the rest of the step stays folded until
                                        "Yes, I have checked" is pressed (per visit, never saved)
     li[data-setting="401"]             neutral "System setting 401" tag
     li[data-optional]                  "Optional" tag
     a step whose text starts with a bold "Checkpoint." gets the checkpoint styling
     kbd.key inside the current step render hot (orange) in the player, except inside p.step-check

   Views and routes (the hash is the address of what is on screen; moving between steps uses replaceState):
     #start     the start screen          #s-<id>   the player at that step (list mode when the learner chose it)
     #all       All steps (list mode)     #done     chapter complete
     no hash    the start screen while the chapter has no ticks, #done once every step is ticked, else the player
                at the step to continue at (CoachChapter.resumeId()); list mode when the learner chose it
     a part or wrapper anchor (sampling.html#make-your-own-kit, #sampling) opens list mode at that part
   The choice between Player and All steps is saved per chapter in koii-coach-prefs.modes[<slug>] ('player' | 'all'),
   read-modify-write, so the other preferences stay. Only the switch saves it; a #all link does not.

   Elements it adds (all marked .pl-own): #player-bar (where you are and the chapter meter), #player-actions (Back,
   Steps, Done · Next), #player-steps (the Steps sheet, a <dialog>), #player-check, #player-done, the start screen's
   chips, safety summary and parts list, .player-modes (the Player / All steps switch), and inside each step
   a .step-head (step number and tags) and, for a delete or overwrite step, a .gate. coach.css, "Step player",
   draws them. <html data-player="start|step|check|done"> is set while the player shows one of its views. */
(()=>{
const C=window.CoachChapter,main=document.getElementById('main'),wrap=document.querySelector('.steps');
if(!C||!main||!wrap)return;
const root=document.documentElement,slug=C.slug||'',steps=C.steps().filter(li=>li.dataset.step);
if(!steps.length)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const listIcon='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="2.5"/></svg>';
const downIcon='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg>';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const managed=new Set();   // elements this file hid (the hidden attribute); only these are ever shown again
const plural=(n,one,many)=>n+' '+(n===1?one:many);
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};

// ---------- The chapter: parts and steps ----------
const partEls=[];
for(const li of steps){const d=li.closest('details');if(!d||!wrap.contains(d))return;if(!partEls.includes(d))partEls.push(d);}
// The text of a leading <b> (or <strong>), when the element starts with one; chapter.js's "You are here" tag and the
// player's own step head do not count.
function firstBold(e){
  for(const n of e.childNodes){
    if(n.nodeType===3){if(n.textContent.trim())return '';continue;}
    if(n.nodeType!==1||n.matches('.here-tag,.pl-own'))continue;
    return /^(B|STRONG)$/.test(n.tagName)?clean(n.textContent):'';
  }
  return '';
}
const parts=partEls.map((d,i)=>{
  const sum=d.querySelector(':scope > summary');
  const head=sum?clean([...sum.childNodes].filter(n=>!(n.nodeType===1&&n.classList.contains('tally'))).map(n=>n.textContent).join('')):'';
  const m=/^(\d+)\s*\/\s*(.*)$/.exec(head),kids=[...d.children].filter(e=>e!==sum);
  const checkpoint=kids.find(e=>e.classList.contains('checkpoint'))||null;
  const ifnot=kids.find(e=>e.tagName==='P'&&/^If it doesn['’]t\b/i.test(firstBold(e)))||null;
  const notes=kids.filter(e=>e.tagName!=='OL'&&e!==checkpoint&&e!==ifnot);
  return{el:d,i,n:m?parseInt(m[1],10):i+1,title:m?m[2]:head,steps:steps.filter(li=>d.contains(li)),checkpoint,ifnot,notes};
});
const byId=new Map(steps.map(li=>[li.dataset.step,li]));
const partOf=li=>parts.find(p=>p.steps.includes(li));
const num=li=>C.steps().indexOf(li)+1;   // the list's own numbering (chapter.js numbers every step on the page)
// One line of a step for the Steps sheet and the "not ticked yet" list.
function gist(li){
  const src=li.querySelector(':scope > .step-do')||li;let t='';
  src.childNodes.forEach(n=>{if(n.nodeType===1&&n.matches('.check,.here-tag,.step-head,.gate,.preflight'))return;t+=n.textContent;});
  return clean(t);
}

// The page around the steps
const progress=document.getElementById('progress'),note=document.getElementById('progress-note');
const foot=document.querySelector('footer.site-foot')||document.querySelector('body > footer');
const pageHead=main.querySelector(':scope > .page-head'),h1=main.querySelector('h1');
const eyebrow=pageHead&&pageHead.querySelector('.eyebrow');
const kids=()=>[...main.children].filter(e=>!e.classList.contains('pl-own'));
const preSteps=()=>{const k=kids(),i=k.indexOf(progress&&progress.parentElement===main?progress:wrap);return i>=0?k.slice(0,i):[];};
const site=window.COACH_SITE,info=site&&Array.isArray(site.chapters)?site.chapters.find(c=>c.slug===slug):null;
const chNum=(/CHAPTER\s+(\S+)/i.exec(eyebrow?eyebrow.textContent:'')||[])[1]||(info&&info.num)||'';
const chName=info?info.title:clean(h1&&h1.textContent);
const baseTitle=document.title;
const nextLink=document.querySelector('.chapters .next');
const nextName=nextLink?clean([...nextLink.childNodes].filter(n=>!(n.nodeType===1&&n.tagName==='SPAN')).map(n=>n.textContent).join('')):'';

// koii-coach-prefs.modes[<slug>]: 'player' (the default) or 'all'. Read-modify-write: the other settings stay.
const PREFS='koii-coach-prefs';
function prefs(){try{const v=JSON.parse(localStorage.getItem(PREFS)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}catch(e){return null;}}
function mode(){const p=prefs(),m=p&&p.modes&&typeof p.modes==='object'?p.modes[slug]:null;return m==='all'?'all':'player';}
function setMode(m){
  const p=prefs()||{v:1};if(!p.v)p.v=1;
  const modes=p.modes&&typeof p.modes==='object'&&!Array.isArray(p.modes)?p.modes:{};
  modes[slug]=m;p.modes=modes;
  try{localStorage.setItem(PREFS,JSON.stringify(p));}catch(e){}
}

// ---------- Inside each step: the head (number and tags), the check's sense, the gate ----------
const RISK={erase:['caution','Clears notes'],delete:['danger','Deletes · no undo'],overwrite:['danger','Overwrites · no undo']};
const gates=new Map();
steps.forEach(li=>{
  const risk=RISK[li.dataset.risk]||null,setting=clean(li.dataset.setting);
  const isCheck=/^Checkpoint\b/.test(firstBold(li.querySelector(':scope > .step-do')||li));
  if(isCheck)li.classList.add('is-checkpoint');
  const tags=[risk?`<span class="tag ${risk[0]}">${risk[1]}</span>`:'',setting?`<span class="tag info">System setting ${esc(setting)}</span>`:'',
    'optional' in li.dataset?'<span class="tag">Optional</span>':'',isCheck?'<span class="tag done">Checkpoint</span>':''].join('');
  const head=el('div','step-head pl-own'+(tags?'':' bare'),`<span class="step-num"><span class="sr">Step </span>${num(li)}</span>${tags}`);
  li.prepend(head);
  const chk=li.querySelector(':scope > .step-check');
  if(chk)chk.dataset.sense=/\b(hear|hears|heard|listen|sounds?|plays?|playing|silent|silence|quiet|loud|louder|thud|tick|click)\b/i.test(chk.textContent)?'hear':'see';
  if(!risk||risk[0]!=='danger')return;
  // Delete and overwrite: the rest of the step waits for "Yes, I have checked". A stage-1 step's loose text is put in
  // one <div class="step-body"> first, so it can be folded away (its text is unchanged).
  const keep=n=>n.nodeType===1&&n.matches('.step-head,.preflight,.check,.here-tag');
  if([...li.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())){
    const body=el('div','step-body');
    [...li.childNodes].filter(n=>!keep(n)).forEach(n=>body.append(n));
    const pre=li.querySelector(':scope > .preflight');
    (pre||head).after(body);
  }
  const pre=li.querySelector(':scope > .preflight');
  const g=el('div','gate pl-own',
    (pre?'':`<p class="gate-note">${li.dataset.risk==='overwrite'?'There is no undo. Make sure you are on the right sound before you press.':'There is no undo. Make sure you are on the right sound or scene before you press.'}</p>`)+
    '<button class="btn gate-btn" type="button">Yes, I have checked</button>'+
    '<p class="gate-hint">The rest of this step shows once you confirm.</p>'+
    `<span class="tag done gate-ok" hidden>${icon('check')}Checked</span>`);
  g.hidden=true;
  (pre||head).after(g);
  gates.set(li,{box:g,btn:g.querySelector('.gate-btn'),hint:g.querySelector('.gate-hint'),ok:g.querySelector('.gate-ok')});
  gates.get(li).btn.addEventListener('click',()=>{confirmed=li;render();li.focus({preventScroll:true});});
});

// ---------- Elements the player adds ----------
// Bar under the app bar: where you are and the chapter meter.
const bar=el('div','player-bar pl-own','<p class="pb-part"></p><p class="pb-pos"></p><p class="pb-count"></p><span class="meter" aria-hidden="true"><span class="meter-fill"></span></span>');
bar.id='player-bar';bar.hidden=true;
if(progress&&progress.parentElement===main)progress.after(bar);else wrap.before(bar);
// "About this part": the goal and the notes of the part on screen (copies; the originals stay where they are).
const about=el('details','disclosure part-about pl-own','<summary>About this part</summary><div class="inside"></div>');
about.hidden=true;
// Start screen: chips, safety summary, parts list.
const chips=el('ul','player-chips pl-own'),safety=el('details','player-safety pl-own'),partsBox=el('section','player-parts pl-own');
chips.setAttribute('aria-label','About this chapter');
partsBox.setAttribute('aria-labelledby','player-parts-title');
[chips,safety,partsBox].forEach(e=>{e.hidden=true;});
(()=>{
  const time=eyebrow?clean(eyebrow.textContent.split('/').slice(1).join('/')).toLowerCase():'';
  // Text nodes joined with spaces, so "<b>Your project</b><br>Project 6" reads "Your project Project 6".
  const words=e=>{const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),out=[];while(w.nextNode())out.push(w.currentNode.nodeValue);return out.join(' ');};
  const text=preSteps().filter(e=>e!==pageHead).map(words).join(' ');
  const proj=/\bproject (\d+)\b/i.exec(text),os=/\bOS (\d+\.\d+(?:\.\d+)?)( or newer| or later)?/.exec(text);
  chips.innerHTML=[time?time.charAt(0).toUpperCase()+time.slice(1):'',proj?'Project '+proj[1]:'',os?'OS '+os[1]+(os[2]?'+':''):'',
    plural(steps.length,'step','steps')+' in '+plural(parts.length,'part','parts')].filter(Boolean).map(t=>`<li>${esc(t)}</li>`).join('');
  const intro=pageHead&&pageHead.nextElementSibling&&pageHead.nextElementSibling.tagName==='P'?pageHead.nextElementSibling:pageHead;
  if(intro)intro.after(chips);else main.prepend(chips);
  const dangers=preSteps().filter(e=>e.matches('.notice.danger')),hard=steps.filter(li=>/^(delete|overwrite)$/.test(li.dataset.risk||'')).length;
  if(dangers.length){
    safety.innerHTML=`<summary>${icon('warning')}<span>${hard?esc(plural(hard,'action','actions'))+' in this chapter cannot be undone':'Safety: read this before you start'}</span></summary><div class="inside"></div>`;
    dangers.forEach(d=>safety.lastElementChild.append(copy(d)));
    dangers[0].before(safety);
  }
  partsBox.innerHTML='<h2 id="player-parts-title">Parts</h2><ol class="pp-list"></ol>';
  (progress&&progress.parentElement===main?progress:wrap).before(partsBox);
})();
// A copy for the player's own cards: no ids (they stay unique), and not hidden just because the original is put away.
function copy(node){
  const c=node.cloneNode(true);
  c.removeAttribute('id');c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
  if(managed.has(node))c.hidden=false;
  return c;
}
// Player / All steps switch, at the top of the list (list mode) and in the Steps sheet.
const modesHTML='<button type="button" data-mode="player" aria-pressed="false">Player</button><button type="button" data-mode="all" aria-pressed="false">All steps</button>';
const listModes=el('div','player-modes pl-own',modesHTML);
listModes.setAttribute('role','group');listModes.setAttribute('aria-label','Show the steps');listModes.hidden=true;
wrap.before(listModes);
// Checkpoint card and chapter-complete card.
const checkCard=el('section','player-card player-check pl-own'),doneCard=el('section','player-card player-done pl-own');
checkCard.id='player-check';doneCard.id='player-done';
[checkCard,doneCard].forEach(c=>{c.hidden=true;c.tabIndex=-1;});
checkCard.setAttribute('aria-labelledby','player-check-title');doneCard.setAttribute('aria-labelledby','player-done-title');
wrap.after(checkCard,doneCard);
// Action bar, after <main> in reading order.
const actions=el('div','player-actions pl-own',
  `<button class="pa-more" type="button" hidden>${downIcon}More below</button>`+
  `<div class="pa-row"><button class="pa-btn" id="player-back" type="button" aria-keyshortcuts="ArrowLeft">${icon('back')}<span>Back</span></button>`+
  `<button class="pa-btn" id="player-steps-btn" type="button" aria-haspopup="dialog" aria-controls="player-steps" aria-expanded="false">${listIcon}<span>Steps</span></button>`+
  `<button class="btn primary pa-main" id="player-next" type="button"><span class="pa-label">Done · Next</span>${icon('next')}</button>`+
  `<a class="btn primary pa-main" id="player-go" href="./index.html" hidden><span class="pa-label"></span>${icon('next')}</a></div>`+
  '<p class="pa-hint" aria-hidden="true"><kbd class="key">→</kbd> or <kbd class="key">Enter</kbd> Done · Next · <kbd class="key">←</kbd> Back</p>');
actions.id='player-actions';actions.hidden=true;
actions.setAttribute('role','group');actions.setAttribute('aria-label','Step controls');
main.after(actions);
const backBtn=actions.querySelector('#player-back'),stepsBtn=actions.querySelector('#player-steps-btn'),nextBtn=actions.querySelector('#player-next'),goLink=actions.querySelector('#player-go'),more=actions.querySelector('.pa-more');
// Steps sheet: a native <dialog> like the shell's menu.
const sheet=el('dialog','sheet player-sheet pl-own',
  `<div class="sheet-box"><div class="sheet-head"><h2 class="sheet-title" id="player-steps-title">This chapter</h2>`+
  `<button class="icon-btn" type="button" data-close aria-label="Close steps">${icon('close')}</button></div><div class="sheet-body"></div></div>`);
sheet.id='player-steps';sheet.setAttribute('aria-labelledby','player-steps-title');
document.body.append(sheet);
const sheetBody=sheet.querySelector('.sheet-body');

// ---------- State and rendering ----------
let view='',cur=null,part=null,confirmed=null,printing=false,fixOpen=false;
function setHidden(want){
  managed.forEach(e=>{if(!want.has(e)){e.hidden=false;managed.delete(e);}});
  want.forEach(e=>{if(!managed.has(e)&&!e.hidden){e.hidden=true;managed.add(e);}});
}
const isGated=()=>view==='step'&&cur&&gates.has(cur)&&confirmed!==cur;
const tally=list=>{const c=list.filter(li=>C.isDone(li.dataset.step)).length;return{c,n:list.length,text:c?c+' of '+list.length+' done':plural(list.length,'step','steps')};};
function render(){
  const v=printing?'list':view;
  if(v==='list'||!v)delete root.dataset.player;else root.dataset.player=v;
  const want=new Set(),k=kids();
  if(v==='start'){
    want.add(wrap);if(progress)want.add(progress);
    if(safety.childElementCount)preSteps().filter(e=>e.matches('.notice.danger')).forEach(e=>want.add(e));   // the summary holds copies
  }else if(v==='step'&&cur){
    const P=partOf(cur);
    k.forEach(e=>{if(e!==wrap&&e!==note)want.add(e);});
    if(foot)want.add(foot);
    parts.forEach(p=>{if(p!==P)want.add(p.el);});
    [...wrap.children].forEach(e=>{if(!e.contains(cur))want.add(e);});   // anything else in the steps section too
    [...P.el.children].forEach(e=>{if(e.tagName!=='OL'&&e!==about)want.add(e);});
    [...P.el.querySelectorAll(':scope > ol')].forEach(ol=>{if(!ol.contains(cur))want.add(ol);});
    P.steps.forEach(li=>{if(li!==cur)want.add(li);});
    if(isGated())[...cur.children].forEach(e=>{if(!e.matches('.step-head,.preflight,.gate,.check,.here-tag'))want.add(e);});
  }else if(v==='check'||v==='done'){
    k.forEach(e=>{if(e!==note)want.add(e);});
    if(v==='check'&&foot)want.add(foot);
  }
  setHidden(want);
  steps.forEach(li=>li.classList.toggle('is-current',v==='step'&&li===cur));
  gates.forEach((g,li)=>{
    const on=v==='step'&&li===cur,ok=confirmed===li;
    g.box.hidden=!on;g.btn.hidden=ok;g.hint.hidden=ok;g.ok.hidden=!ok;
    const n=g.box.querySelector('.gate-note');if(n)n.hidden=ok;
  });
  bar.hidden=!(v==='step'||v==='check');
  chips.hidden=partsBox.hidden=v!=='start';
  safety.hidden=v!=='start'||!safety.childElementCount;
  about.hidden=!(v==='step'&&about.querySelector('.inside').childElementCount);
  checkCard.hidden=v!=='check';doneCard.hidden=v!=='done';
  listModes.hidden=v!=='list';
  listModes.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode==='all')));
  actions.hidden=v==='list'||!v;
  paint();
}
// Texts that follow the ticks: the bar, the main button.
function paint(){
  const total=C.total(),count=C.count();
  bar.querySelector('.pb-count').textContent=count===total?'All '+total+' steps done':count+' of '+total+' done';
  bar.querySelector('.meter-fill').style.width=(total?Math.round(100*count/total):0)+'%';
  const P=view==='check'?part:cur&&partOf(cur);
  if(P){
    bar.querySelector('.pb-part').textContent='Part '+P.n+' · '+P.title;
    bar.querySelector('.pb-pos').textContent=view==='check'?'Checkpoint':'Step '+(P.steps.indexOf(cur)+1)+' of '+P.steps.length;
  }
  backBtn.hidden=stepsBtn.hidden=view==='start';
  actions.querySelector('.pa-hint').hidden=!(view==='step'||view==='check');
  let label='',go='';
  nextBtn.removeAttribute('aria-disabled');
  if(view==='start'){const r=C.hasProgress()&&C.resumeId();label=r?'Continue at step '+num(byId.get(r)):'Start Part 1';}
  else if(view==='step'&&cur){
    if(isGated()){label='Confirm first';nextBtn.setAttribute('aria-disabled','true');}
    else label=C.isDone(cur.dataset.step)?'Next':'Done · Next';
  }else if(view==='check'&&part){
    const np=parts[part.i+1];
    label=(part.checkpoint?'Yes · ':'')+(np?'Part '+np.n+': '+np.title:'Finish the chapter');
  }else if(view==='done')go=nextLink?'Next: '+nextName:'Back to the course';
  nextBtn.hidden=Boolean(go)||view==='list';goLink.hidden=!go;
  nextBtn.querySelector('.pa-label').textContent=label;
  if(view==='step'||view==='check')nextBtn.setAttribute('aria-keyshortcuts','ArrowRight Enter');else nextBtn.removeAttribute('aria-keyshortcuts');
  if(go){goLink.querySelector('.pa-label').textContent=go;goLink.href=nextLink?nextLink.getAttribute('href'):'./index.html';}
  cue();
}
// "More below": the step card runs on under the action bar.
function cue(){
  let on=view==='step'&&cur&&!actions.hidden;
  if(on){const row=actions.querySelector('.pa-row').getBoundingClientRect(),end=cur.getBoundingClientRect().bottom;on=end>Math.min(row.top,innerHeight)+8;}
  more.hidden=!on;
}
let cueFrame=0;
const cueSoon=()=>{if(!cueFrame)cueFrame=requestAnimationFrame(()=>{cueFrame=0;cue();});};
addEventListener('scroll',cueSoon,{passive:true});addEventListener('resize',cueSoon);
more.addEventListener('click',()=>scrollBy({top:Math.round(innerHeight*.6),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));

function setUrl(hash){
  try{history.replaceState(history.state,'',location.pathname+location.search+(hash||''));}catch(e){}
}
function manual(on){try{history.scrollRestoration=on?'manual':'auto';}catch(e){}}

// ---------- Views ----------
function showStep(li,opt){
  opt=opt||{};
  if(li!==cur)confirmed=null;
  const P=partOf(li),moved=view==='step'&&cur&&cur!==li;
  view='step';cur=li;part=P;P.el.open=true;manual(true);
  // About this part: copies of the goal and notes, opened on the part's first step
  if(about.dataset.part!==String(P.i)){
    about.dataset.part=String(P.i);
    const inside=about.querySelector('.inside');inside.textContent='';
    P.notes.forEach(n=>inside.append(copy(n)));
    const s=about.querySelector('summary'),warn=P.notes.some(n=>n.matches('.notice.danger,.notice.caution')||n.querySelector('.notice.danger,.notice.caution'));
    s.innerHTML='About this part'+(warn?' <span class="tag caution">Safety note</span>':'');
  }
  about.open=P.steps[0]===li;
  if(about.parentElement!==P.el)P.el.append(about);
  render();
  setUrl('#s-'+li.dataset.step);
  document.title='Step '+(P.steps.indexOf(li)+1)+' of '+P.steps.length+' / Part '+P.n+' · '+P.title+' / '+baseTitle;
  if(moved){li.classList.remove('pl-in');void li.offsetWidth;li.classList.add('pl-in');}
  scrollTo(0,0);
  li.tabIndex=-1;
  if(opt.focus!==false)li.focus({preventScroll:true});
  cue();
}
function showStart(){
  view='start';cur=null;manual(false);
  partsBox.querySelector('.pp-list').innerHTML=parts.map(p=>{
    const t=tally(p.steps);
    return `<li><a href="#s-${esc(p.steps[0].dataset.step)}"><span class="pp-n">${p.n}</span><span class="pp-t">${esc(p.title)}</span><span class="tally${t.c&&t.c===t.n?' all':''}">${esc(t.text)}</span></a></li>`;
  }).join('');
  if(safety.childElementCount)safety.open=!C.hasProgress();
  render();
  document.title=baseTitle;
}
function showCheck(P,opt){
  view='check';part=P;cur=P.steps[P.steps.length-1];fixOpen=false;manual(true);
  const np=parts[P.i+1];
  checkCard.innerHTML=`<h2 class="pl-eyebrow" id="player-check-title">Part ${P.n} done${P.checkpoint?' · Checkpoint':''}</h2>`+
    (P.checkpoint?'<div class="pc-q"></div>':`<p class="pc-q">You have reached the end of Part ${P.n}: ${esc(P.title)}.</p>`)+
    (np?`<p class="meta">Next: Part ${np.n} · ${esc(np.title)}</p>`:'<p class="meta">This was the last part of the chapter.</p>')+
    (P.ifnot?'<div class="row"><button class="btn lg pc-not" type="button" aria-expanded="false">Not quite</button></div><div class="pc-fix" hidden></div>':'');
  if(P.checkpoint){const q=copy(P.checkpoint);q.className='';checkCard.querySelector('.pc-q').append(...q.childNodes);}
  if(P.ifnot){
    checkCard.querySelector('.pc-fix').append(copy(P.ifnot));
    const nb=checkCard.querySelector('.pc-not');
    nb.addEventListener('click',()=>{fixOpen=!fixOpen;nb.setAttribute('aria-expanded',String(fixOpen));checkCard.querySelector('.pc-fix').hidden=!fixOpen;});
  }
  render();
  setUrl('#s-'+cur.dataset.step);
  document.title='Part '+P.n+' done / '+baseTitle;
  scrollTo(0,0);
  if(!opt||opt.focus!==false)checkCard.focus({preventScroll:true});
}
function showDone(opt){
  view='done';cur=null;manual(true);
  const open=steps.filter(li=>!C.isDone(li.dataset.step));
  doneCard.innerHTML=`<p class="pl-eyebrow">Chapter ${esc(chNum)} · ${esc(chName)}</p><h2 class="pd-title" id="player-done-title" tabindex="-1">Chapter ${esc(chNum)} done</h2>`+
    (open.length?`<p>${esc(plural(open.length,'step','steps'))} not ticked yet:</p><ul class="pd-open">`+
      open.slice(0,8).map(li=>`<li><a href="#s-${esc(li.dataset.step)}"><span class="pd-n">${num(li)}</span><span class="pd-t">${esc(gist(li))}</span></a></li>`).join('')+'</ul>'+
      (open.length>8?`<p><a href="#all">${esc(plural(open.length-8,'more step','more steps'))}: see All steps</a></p>`:'')
      :`<p>All ${steps.length} steps are ticked.</p>`)+
    (slug!=='setup'?`<div class="notice tip"><b>Back up now.</b> Save a copy of your work with the official EP sample tool, as in <a href="./setup.html#s-backup-open-tool">00 / Start here, part 04</a>.</div>`:'')+
    (nextLink?'<p><a class="btn" href="./index.html">Back to the course</a></p>':'');
  render();
  setUrl('#done');
  document.title='Chapter '+chNum+' done / '+baseTitle;
  scrollTo(0,0);
  if(!opt||opt.focus!==false){const h=doneCard.querySelector('h2');if(h)h.focus({preventScroll:true});}
}
function showList(){
  view='list';cur=null;manual(false);
  render();
  document.title=baseTitle;
}

// ---------- Moving ----------
function next(){
  if(view==='start'){const r=C.hasProgress()&&C.resumeId();showStep(r?byId.get(r):steps[0]);return;}
  if(view==='check'){const np=parts[part.i+1];if(np)showStep(np.steps[0]);else showDone();return;}
  if(view!=='step'||!cur)return;
  if(isGated()){const g=gates.get(cur);g.box.scrollIntoView({block:'center'});g.btn.focus({preventScroll:true});return;}
  const id=cur.dataset.step;
  if(!C.isDone(id))C.setDone(id,true);
  if(window.CoachWake)CoachWake.poke();
  const P=partOf(cur),k=P.steps.indexOf(cur);
  if(k<P.steps.length-1){const n=P.steps[k+1];C.setCurrent(n.dataset.step);showStep(n);return;}
  const np=parts[P.i+1];
  if(np)C.setCurrent(np.steps[0].dataset.step);
  showCheck(P);
}
function back(){
  if(view==='step'&&cur){
    const i=steps.indexOf(cur);
    if(i<=0){showStart();setUrl('#start');return;}
    const p=steps[i-1];C.setCurrent(p.dataset.step);showStep(p);
  }else if(view==='check'&&part){const l=part.steps[part.steps.length-1];C.setCurrent(l.dataset.step);showStep(l);}
  else if(view==='done')showCheck(parts[parts.length-1]);
}
nextBtn.addEventListener('click',next);
backBtn.addEventListener('click',back);
// The card is focused on every step change; its ring shows only for people using the keyboard (.pl-kbd on <html>).
document.addEventListener('keydown',e=>{if(!e.ctrlKey&&!e.metaKey)root.classList.add('pl-kbd');},true);
document.addEventListener('pointerdown',()=>root.classList.remove('pl-kbd'),true);
// Keyboard: → and Enter = the main button, ← = Back, but only when focus is on the page itself or on the step card,
// never in a link, button, summary, field or dialog (Enter there keeps its own meaning).
document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.isComposing)return;
  if(!(view==='step'||view==='check')||document.querySelector('dialog[open]'))return;
  const t=e.target;
  if(!(t===document.body||t===root||t===main||(view==='step'&&t===cur)||(view==='check'&&t===checkCard)))return;
  if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();next();}
  else if(e.key==='ArrowLeft'){e.preventDefault();back();}
});

// ---------- Steps sheet ----------
let pushed=false,popping=false,after=null,down=null;
function fillSheet(){
  const total=C.total(),count=C.count(),here=view==='check'?null:cur,P=view==='check'?part:cur?partOf(cur):parts[0];
  sheetBody.innerHTML=`<div class="ps-progress"><p class="ps-count">${count===total?'All '+total+' steps done':count+' of '+total+' done'}</p><span class="meter" aria-hidden="true"><span class="meter-fill" style="width:${total?Math.round(100*count/total):0}%"></span></span></div>`+
    `<div class="player-modes" role="group" aria-label="Show the steps">${modesHTML}</div>`+
    parts.map(p=>{const t=tally(p.steps);return `<details class="ps-part"${p===P?' open':''}><summary><span class="ps-pn">${p.n}</span><span class="ps-pt">${esc(p.title)}</span><span class="tally${t.c&&t.c===t.n?' all':''}">${esc(t.c+'/'+t.n)}</span></summary><ol class="ps-steps">`+
      p.steps.map(li=>{const d=C.isDone(li.dataset.step),now=li===here;
        return `<li><a class="ps-step${d?' done':''}" href="#s-${esc(li.dataset.step)}"${now?' aria-current="step"':''}><span class="ps-mark" aria-hidden="true"></span><span class="ps-n">${num(li)}</span><span class="ps-t">${esc(gist(li))}</span>`+
          `<span class="sr">${d?', done':''}</span>${now?'<span class="you-here">You are here</span>':''}</a></li>`;}).join('')+'</ol></details>';}).join('')+
    `<ul class="ps-links"><li><a href="#start">${icon('info')}About this chapter</a></li><li><button type="button" data-act="print">${icon('print')}Print all steps</button></li></ul>`+
    `<p><button class="btn danger" type="button" data-act="reset">${icon('undo')}Reset this chapter's checklist</button></p>`;
  sheetBody.querySelectorAll('.player-modes [data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode==='player')));
}
function openSheet(){
  if(sheet.open)return;
  fillSheet();
  if(typeof sheet.showModal==='function')sheet.showModal();else sheet.setAttribute('open','');
  stepsBtn.setAttribute('aria-expanded','true');
  try{history.pushState({coachDialog:sheet.id},'');pushed=true;}catch(e){pushed=false;}
  const c=sheetBody.querySelector('[aria-current="step"]')||sheetBody.querySelector('.ps-part[open] .ps-step');
  if(c){c.scrollIntoView({block:'center'});c.focus({preventScroll:true});}
}
// Close, then run fn once the history entry the sheet added is gone (so a replaceState lands on the right entry).
function closeSheet(fn){
  after=fn||null;
  if(!sheet.open){run();return;}
  if(typeof sheet.close==='function')sheet.close();else{sheet.removeAttribute('open');sheet.dispatchEvent(new Event('close'));}
}
function run(){const f=after;after=null;if(f)f();}
sheet.addEventListener('close',()=>{
  stepsBtn.setAttribute('aria-expanded','false');
  if(!after&&stepsBtn.offsetParent)stepsBtn.focus();
  if(pushed){
    pushed=false;popping=true;history.back();
    setTimeout(()=>{if(popping){popping=false;run();}},500);   // in case the Back never arrives
  }else run();
});
addEventListener('popstate',()=>{
  if(popping){popping=false;run();return;}
  if(pushed){pushed=false;closeSheet();}   // the phone's Back closed the sheet
});
sheet.addEventListener('pointerdown',e=>{down=e.target;},true);
sheet.addEventListener('click',e=>{
  const from=down;down=null;
  if(e.target===sheet){if(!from||from===sheet)closeSheet();return;}
  if(e.target.closest('[data-close]')){closeSheet();return;}
  const m=e.target.closest('[data-mode]');
  if(m){
    const all=m.dataset.mode==='all';
    if(all){setMode('all');const keep=cur;closeSheet(()=>{showList();setUrl('#all');if(keep)C.go(keep.dataset.step);});}
    else{setMode('player');closeSheet();}
    return;
  }
  const act=e.target.closest('[data-act]');
  if(act){const b=document.getElementById(act.dataset.act);closeSheet(()=>{if(b)b.click();});return;}
  const a=e.target.closest('a[href^="#"]');
  if(a&&!(e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)){
    e.preventDefault();
    const h=a.getAttribute('href');
    closeSheet(()=>{
      if(h==='#start'){location.hash='#start';return;}   // its own history entry: Back returns to the step
      const li=byId.get(h.replace(/^#s-/,''));if(li)showStep(li);   // a jump: nothing is ticked and cur stays
    });
  }
});
stepsBtn.addEventListener('click',openSheet);
listModes.addEventListener('click',e=>{
  const m=e.target.closest('[data-mode]');if(!m)return;
  if(m.dataset.mode==='all'){setMode('all');return;}
  setMode('player');
  openDefault();
});

// ---------- Routes ----------
let first=true;
function openDefault(){
  if(!C.hasProgress()){showStart();setUrl('');return;}
  if(C.count()===C.total()){showDone();return;}
  const li=byId.get(C.resumeId())||steps[0];
  showStep(li);
}
function routeTo(hash){
  const was=first;first=false;
  const h=hash&&hash!=='#'?hash:'';
  if(h==='#start'){showStart();return true;}
  if(h==='#all'){showList();if(!was)scrollTo(0,0);return true;}
  if(h==='#done'){showDone({focus:!was});return true;}
  const m=/^#s-(.+)$/.exec(h);
  if(m){
    let id=m[1];try{id=decodeURIComponent(id);}catch(e){}
    const li=byId.get(id);
    if(!li){
      C.say('That step link is out of date. The step may have been rewritten since the link was made.');
      if(mode()==='all'){showList();return true;}
      showStart();setUrl('#start');return true;
    }
    if(mode()==='all'){showList();return false;}   // chapter.js opens its section, scrolls to it and marks it
    showStep(li);return true;
  }
  if(h){
    let target=null;try{target=document.getElementById(decodeURIComponent(h.slice(1)));}catch(e){}
    if(target&&target!==main&&(target===wrap||wrap.contains(target))){showList();return false;}   // a part or the wrapper
    if(target&&target!==main&&main.contains(target)&&target.closest('[hidden]')){showList();target.scrollIntoView({block:'start'});return true;}
    if(!was)return true;   // anything else (the skip link, an id that is on screen) keeps the view
  }
  if(mode()==='all'){showList();return false;}
  openDefault();
  return true;
}

// Print: always the whole chapter as a list (chapter.js opens every part), never the bars.
addEventListener('beforeprint',()=>{if(view&&view!=='list'){printing=true;render();}});
addEventListener('afterprint',()=>{if(printing){printing=false;render();}});
// A tick in the card or the list, a reset, a move of cur.
C.onChange(e=>{
  if(e.type==='reset'&&view&&view!=='list'){showStart();setUrl('#start');return;}
  if(view)paint();
});

C.route(routeTo);
if(C.routed&&C.routed())routeTo(location.hash);
})();
