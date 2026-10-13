'use strict';
/* Shared checklist, progress and resume logic for the chapter pages: setup.html (00), sampling.html (07),
   perform.html (08), hiphop.html (09), tech-house.html (10) and thodorakis-house.html (11).
   Each page sets <body data-chapter="slug"> and gives every step <li> inside .steps a stable data-step id.
   Progress is stored per chapter as {v:1,done:[stepId,...],last:stepId,n} under 'koii-coach-ch-<slug>', plus the
   optional fields cur (the step Continue points at) and at (ISO time of the last tick). v stays 1 and fields are only
   ever added. 'koii-coach-meta' gets lastChapter (shared with the app: its other fields are kept).
   A link such as sampling.html#s-<step id> opens that step; wake.js (optional) keeps the screen on while ticking.
   How it all looks is up to coach.css and the shell (shell.js); this file only fills in the progress bar and its
   meter, the tick rows, the section tallies and the "You are here" mark on the step to continue at. */
(()=>{
// Step ids in the order the pages had when ticks were still saved by list position.
// Used once to migrate those ticks. Frozen history: do not edit when steps change.
const LEGACY={
  hiphop:{key:'koii-hiphop-vocal-checklist-v2',old:['koii-hiphop-checklist-v1'],ids:`
note-original-scene copy-to-work-scene group-a-two-bars group-b-two-bars prepare-c-d-tempo-timing
turntable-line-switch connect-turntable-input choose-main-phrase mark-phrase-and-answer set-line-input-level
sample-main-phrase sample-answer-word trim-phrase-start trim-phrase-end oneshot-phrase-answer
clear-old-c-notes check-phrase-timing place-answer check-vocal-pattern play-drums-with-vocal
check-bass-pulses tune-bass-to-voice swap-or-drop-bass balance-parts save-hook-copy-main
main-remove-vocal check-main-and-hook make-intro-scene check-intro-main-hook make-break-scene
break-remove-snare break-thin-hats play-break make-return-scene check-return-scene
find-repeat-word sample-repeat-word trim-repeat-word place-repeat-word make-end-scene
read-song-map open-song-list enter-song-positions play-song-list manual-performance
final-listen-balance optional-effects check-break-return record-performance write-down-scenes`},
  'tech-house':{key:'koii-tech-house-checklist-v1',old:[],ids:`
choose-empty-project set-tempo-128 set-timing-16 check-empty-patterns
choose-kick choose-clap-and-hat choose-percussion choose-bass
write-kicks write-claps write-offbeat-hats double-drums-four-bars
add-hat-accents add-open-hats add-rim add-shaker-and-tom
make-bass-four-bars bass-bar-1 bass-bars-2-3 bass-bar-4
check-kick-and-bass optional-sidechain commit-drop-a stand-up-test
sample-vocal-hook place-vocal-hook add-synth-answer check-all-groups
make-intro make-groove make-break make-build-and-peak
add-vocal-reverb optional-impact check-section-order make-outro
check-four-bar-scenes open-song-list assign-positions play-song-list
list-three-dislikes first-fix-levels second-fix-low-end third-fix-speaker
check-drop-transition record-full-pass write-down-scenes finished-check`},
  'vocal-house':{key:'koii-thodorakis-club-checklist-v1',old:['koii-thodorakis-checklist-v1','koii-thodorakis-voice-checklist-v1'],ids:`
choose-empty-project set-tempo-128 set-timing-16 check-empty-patterns
choose-kick choose-clap-and-hat choose-open-hat choose-bass audition-kit
write-first-kick write-kicks write-claps write-offbeat-hats
double-drums-two-bars double-drums-four-bars add-hat-accents add-open-hats play-drum-loop
make-bass-four-bars bass-bar-1 bass-bars-2-3 bass-bar-4 check-drums-and-bass
assign-main-hook assign-answer assign-chop assign-texture-and-second-phrase
level-main-hook level-answer level-chop level-texture hold-second-phrase
make-hook-four-bars place-main-hook place-answer play-hook-groove
make-c-four-bars place-chops place-texture play-everything
listen-drop fix-voice-overlap add-voice-reverb commit-drop-a
make-dj-intro make-groove make-drop-b check-section-build
make-break make-build make-peak make-outro
open-song-list assign-positions check-four-bar-scenes play-song-list
dance-test low-end-test voice-test contrast-test record-full-pass`}
};
const $=id=>document.getElementById(id),slug=document.body.dataset.chapter,KEY='koii-coach-ch-'+slug;
const steps=[...document.querySelectorAll('.steps ol>li')],ids=steps.map(li=>li.dataset.step||'');
if(!slug)console.error('chapter.js: <body> needs a data-chapter attribute');
steps.forEach((li,i)=>{if(!li.dataset.step)console.error('chapter.js: step '+(i+1)+' has no data-step id, so its tick cannot be saved',li);});
ids.forEach((id,i)=>{if(id&&ids.indexOf(id)!==i)console.error('chapter.js: duplicate data-step id "'+id+'"');});

// Number the lists continuously, so step numbers never depend on hand-typed start attributes.
let n=0;
document.querySelectorAll('.steps ol').forEach(ol=>{
  if(ol.hasAttribute('start')&&ol.start!==n+1)console.warn('chapter.js: <ol start="'+ol.getAttribute('start')+'"> should be '+(n+1)+' (fixed when JavaScript runs; update the HTML for readers without it)',ol);
  ol.start=n+1;n+=ol.querySelectorAll(':scope>li').length;
});

// Load progress, migrating the old position-based keys the first time.
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
let saved=true,note='',state=read(KEY);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));saved=true;}catch(e){saved=false;}return saved;};
if(!(state&&state.v===1&&Array.isArray(state.done))){
  state={v:1,done:[],last:null};
  const L=LEGACY[slug];
  if(L){
    const list=L.ids.trim().split(/\s+/),old=read(L.key);
    if(Array.isArray(old)){
      const idx=old.filter(i=>Number.isInteger(i)&&i>=0&&i<list.length);
      state.done=[...new Set(idx.map(i=>list[i]))];
      if(idx.length)state.last=list[idx[idx.length-1]];
      const gone=state.done.filter(id=>!ids.includes(id)).length;
      if(gone)note='This chapter was rewritten since you last ticked steps here. '+gone+' of your ticks were on steps that changed, so they are no longer shown. Tick again any step you have already done.';
    }
    L.old.forEach(k=>{const o=read(k);if(Array.isArray(o)&&o.length)note='This chapter was rewritten since you last ticked steps here, so ticks from that older version could not be carried over.';});
  }
  // The old keys stay (plan 7.7: nothing deletes a legacy key before the P8 clean-up, so an older copy of the site still
  // finds them). From now on this record wins over them everywhere; Reset all progress clears both.
  save();
}
const done=new Set(state.done.filter(x=>typeof x==='string'));
if(typeof state.last!=='string')state.last=null;
const count=()=>steps.filter(li=>done.has(li.dataset.step)).length;
// The app's Home card reads these. cur is null when there is nothing to continue at; at is set by ticks only.
const store=ticked=>{
  state.done=[...done];state.n=count();
  const t=target();state.cur=t>=0?ids[t]:null;
  if(ticked)state.at=new Date().toISOString();
  save();
  if(ticked)remember();
};
// koii-coach-meta also holds notices and more for the app: change lastChapter only, and leave a newer format alone.
function remember(){
  if(!slug)return;
  const m=read('koii-coach-meta'),meta=m&&typeof m==='object'&&!Array.isArray(m)?m:{v:1};
  if(meta.v!==1||meta.lastChapter===slug)return;
  meta.lastChapter=slug;
  try{localStorage.setItem('koii-coach-meta',JSON.stringify(meta));}catch(e){}
}
if(state.n!==count()||!('cur' in state))store();   // also adds cur to a record saved before it existed
remember();

// The step after the one ticked most recently (or after the furthest ticked step) that is not ticked yet.
function target(){
  let i=ids.indexOf(state.last);
  if(i<0)for(let j=ids.length-1;j>=0;j--)if(done.has(ids[j])){i=j;break;}
  if(i<0)return -1;
  for(let j=i+1;j<ids.length;j++)if(ids[j]&&!done.has(ids[j]))return j;
  return -1;
}
function go(j){
  const li=steps[j],d=li.closest('details');
  if(d)d.open=true;
  li.scrollIntoView({block:'start'});
  li.tabIndex=-1;li.focus({preventScroll:true});
}

// Checkboxes: the visible label text is the accessible name.
steps.forEach((li,i)=>{
  const id=li.dataset.step;if(!id)return;
  const label=document.createElement('label'),box=document.createElement('input'),text=document.createElement('span');
  label.className='check';box.type='checkbox';box.checked=done.has(id);text.textContent='I tried step '+(i+1);
  label.append(box,text);li.append(label);
  box.addEventListener('change',()=>{
    if(box.checked){done.add(id);state.last=id;}
    else{done.delete(id);if(state.last===id)state.last=[...done].pop()||null;}
    store(true);update();
    if(window.CoachWake)CoachWake.poke();   // someone is working at the unit: keep the screen awake
  });
});

// Per-section tallies in each summary.
const sections=[...document.querySelectorAll('.steps details')].map(d=>{
  const t=document.createElement('span');t.className='tally';
  const s=d.querySelector('summary');if(s)s.append(' ',t);
  return [steps.filter(li=>d.contains(li)),t];
});

// The step to continue at carries a "You are here" tag, aria-current="step" and the .here class (coach.css draws the ring).
function mark(li,here){
  li.classList.toggle('here',here);
  let tag=li.querySelector(':scope>.here-tag');
  if(!here){li.removeAttribute('aria-current');if(tag)tag.remove();return;}
  li.setAttribute('aria-current','step');
  if(!tag){tag=document.createElement('span');tag.className='tag here-tag';tag.textContent='You are here';li.prepend(tag);}
}
function update(){
  const count=steps.filter(li=>done.has(li.dataset.step)).length,t=target(),btn=$('resume');
  $('progress-count').textContent=count===steps.length?'All '+steps.length+' steps done':count+' of '+steps.length+' done';
  const fill=document.querySelector('#progress .meter-fill');
  if(fill)fill.style.width=(steps.length?Math.round(100*count/steps.length):0)+'%';
  btn.hidden=t<0;
  if(t>=0)btn.innerHTML='Continue at step '+(t+1)+'<svg class="icon" aria-hidden="true"><use href="icons.svg#i-next"></use></svg>';
  steps.forEach((li,j)=>mark(li,j===t));
  sections.forEach(([s,el])=>{
    const c=s.filter(li=>done.has(li.dataset.step)).length;
    el.textContent=c?c+' of '+s.length+' done':s.length+' steps';
    el.classList.toggle('all',c>0&&c===s.length);
  });
  const msg=[note,saved?'':'This browser is not saving your ticks (storage is blocked or full, or this is a private window). They will be lost when you close the page.'].filter(Boolean).join(' '),p=$('progress-note');
  p.textContent=msg;p.hidden=!msg;
  p.className='notice '+(saved?'info':'caution');   // a note about rewritten steps is information; ticks that cannot be saved need care
}

$('resume').addEventListener('click',()=>{const t=target();if(t>=0)go(t);});
const openAll=()=>document.querySelectorAll('details').forEach(d=>d.open=true);
addEventListener('beforeprint',openAll);
$('print').addEventListener('click',()=>{openAll();print();});
$('reset').addEventListener('click',()=>{
  if(!confirm('Clear every tick in this chapter? Other chapters and the main app keep their progress.'))return;
  done.clear();state.last=null;note='';store();
  document.querySelectorAll('.check input').forEach(b=>b.checked=false);
  update();
  if(window.CoachShell)CoachShell.refresh();   // no change event fires here, so tell the shell's course list itself
});
['progress','reset','print'].forEach(id=>$(id).hidden=false);
update();
// The progress bar sticks under the app bar. Tell the stylesheet how tall it is (it wraps on narrow screens and
// with large text), so that focus and "Continue" stop below it instead of under it.
const bar=$('progress'),measure=()=>document.documentElement.style.setProperty('--status-h',bar.offsetHeight+'px');
measure();
if(window.ResizeObserver)new ResizeObserver(measure).observe(bar);
// Reopen the section where the learner left off (without scrolling away from the top of the page).
const t=target();
if(t>=0){const d=steps[t].closest('details');if(d)d.open=true;}
// A link to one step (for example sampling.html#s-open-empty-project) opens its section, scrolls the step in below the
// sticky bars, focuses it and marks it for two seconds (coach.css draws the mark; reduced motion gets none).
// An id that no longer exists only says so in the toast (it shows wherever the page is scrolled to): an old link never
// moves the page. The toast is the page's own #toast if it has one, else one made here (wake.js does the same).
function say(text){
  let el=$('toast');
  if(!el){el=document.createElement('div');el.id='toast';el.className='toast hidden';el.setAttribute('role','status');document.body.append(el);}
  el.textContent=text;el.classList.remove('hidden');
  clearTimeout(say.timer);say.timer=setTimeout(()=>el.classList.add('hidden'),5000);
}
let marked=null,markTimer=0;
function openStep(){
  const m=/^#s-(.+)$/.exec(location.hash);
  if(!m)return false;
  let id=m[1];try{id=decodeURIComponent(id);}catch(e){}
  const j=ids.indexOf(id);
  if(j<0){say('That step link is out of date. The step may have been rewritten since the link was made.');return true;}
  go(j);
  if(marked)marked.classList.remove('linked');
  marked=steps[j];marked.classList.add('linked');
  clearTimeout(markTimer);markTimer=setTimeout(()=>marked.classList.remove('linked'),2000);
  return true;
}
// A link to a section (for example sampling.html#make-your-own-kit) opens it and scrolls to it.
const openHash=()=>{
  if(openStep())return;
  let el=null;try{el=location.hash.length>1?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;}catch(e){}
  const d=el&&el.closest('details');if(d){d.open=true;el.scrollIntoView({block:'start'});}
};
openHash();addEventListener('hashchange',openHash);

if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
