'use strict';
/* Shared checklist, progress and resume logic for the chapter pages, Chapters 0 to 7: setup.html, first-beat.html,
   song.html, sampling.html, perform.html, hiphop.html, tech-house.html and thodorakis-house.html (site.js lists them
   with the numbers they had before the renumber).
   Each page sets <body data-chapter="slug"> and gives every step <li> inside .steps a stable data-step id.
   Progress is stored per chapter as {v:1,done:[stepId,...],last:stepId,n} under 'koii-coach-ch-<slug>', plus the
   optional fields cur (the step Continue points at), at (ISO time of the last tick), skip and m (the last split
   migration applied: progress.js migrates every record on load; a new record starts at the current level). v stays 1 and fields are only
   ever added. 'koii-coach-meta' gets lastChapter (shared with the other pages: its other fields are kept), and a
   notice that progress.js left there for this chapter ({chapter, text} in meta.notices) is shown once.
   01 and 02 (slugs first-beat and song) were views of the old single-page app: progress.js derives their records from
   its saved position, and every save here passes the record to CoachProgress.mirror() first, which writes the position
   back for that older app and notes it in the record's derivedFrom.
   A step with data-os="2.0" gets a "Needs OS 2.0+" badge that follows the OS chosen in Settings (koii-coach-v2.firmware).
   A link such as sampling.html#s-<step id> opens that step; wake.js (optional) keeps the screen on while ticking.
   How it all looks is up to coach.css and the shell (shell.js); this file only fills in the progress bar and its
   meter, the tick rows, the section tallies and the "You are here" mark on the step to continue at.

   cur is the step to continue at. A tick or an untick sets it to the step after the last tick that is not ticked yet
   (as before); the step player (player.js) also sets it with Done · Next and Back. Opening a step from a link, the
   search or the Steps list never moves it.

   window.CoachChapter is what player.js builds on, so the ticks, the progress bar and the player always agree:
     slug                  the chapter's <body data-chapter>
     steps(), ids()        every step <li> (and its data-step id) in page order
     isDone(id), count(), total()
     setDone(id, on)       ticks or unticks a step exactly as its checkbox does (saves, updates the bar and the shell)
     current()             the id of the step to continue at, or null
     setCurrent(id)        moves cur there (saved; the "You are here" mark follows)
     resumeId()            where to open a chapter that has progress: current(), else the first step not ticked yet
     hasProgress()         true once a step on this page is ticked
     isSkipped(id), setSkipped(ids, on), skipped()   steps the learner chose to skip: a run of optional steps, or a
                           route they are not taking (player.js, data-route), kept in record.skip. A skipped
                           step does not count towards total() and is not where Continue lands; ticking it unskips it
     lastAt()              the time of the last tick (ISO), or null
     onChange(fn)          fn({type:'tick'|'current'|'reset'|'skip', id}) after every change made here (id is null for skip)
     go(id)                list mode: opens the step's section, scrolls to it and focuses it
     say(text, undo)       a message in the page's toast; with undo (a function) it carries an Undo button for 10 s
     saved()               false while the browser refuses to save
     route(fn)             fn(location.hash) runs for the first route and on every hashchange; it returns true when it
                           handled the hash, false to let the list handle it (#s-<id> and section anchors, as below)
     routed()              true once the first route has run */
// Keep punctuation on the line of the keycap or chip before it, before player.js copies any step (shell.js).
if(window.CoachShell&&CoachShell.glue)CoachShell.glue(document);
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

// Steps are numbered within their part (plan 4: "Part 2 · …", "Step 4 of 8"): every part's list starts at 1.
document.querySelectorAll('.steps ol[start]').forEach(ol=>{
  console.warn('chapter.js: <ol start="'+ol.getAttribute('start')+'">: each part numbers its steps from 1 (fixed when JavaScript runs; update the HTML for readers without it)',ol);
  ol.removeAttribute('start');
});

// Load progress, migrating the old position-based keys the first time.
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
let saved=true,note='',state=read(KEY);
const save=()=>{
  if(window.CoachProgress)try{CoachProgress.mirror(slug,state);}catch(e){console.error(e);}
  try{localStorage.setItem(KEY,JSON.stringify(state));saved=true;}catch(e){saved=false;}return saved;
};
// 01 and 02: progress.js knows their steps in page order, to derive and mirror their records. They must agree.
if(window.CoachProgress){const o=CoachProgress.order(slug);if(o.length&&o.join(' ')!==ids.join(' '))console.warn('chapter.js: the steps of this page differ from ORDER["'+slug+'"] in progress.js; update that list');}
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
  // Ticks carried over from the old keys name the steps as they were then: split them like any older record. A record
  // that starts empty starts at the current level, so ticking a step's first part never ticks its other parts.
  if(window.CoachProgress){if(state.done.length)CoachProgress.migrateRecord(slug,state);else if(CoachProgress.level(slug))state.m=CoachProgress.level(slug);}
  // The old keys stay for now, so an older copy of the site still finds them; progress.js removes them 8 weeks after
  // this browser first ran it (plan 8.6). From now on this record wins over them everywhere; Reset all progress clears both.
  save();
}
const done=new Set(state.done.filter(x=>typeof x==='string'));
// Optional or route steps the learner skipped (plan 5.3). Only kept in the record once there are any.
const skip=new Set((Array.isArray(state.skip)?state.skip:[]).filter(x=>typeof x==='string'&&ids.includes(x)));
if(typeof state.last!=='string')state.last=null;
const count=()=>steps.filter(li=>done.has(li.dataset.step)).length;
const isOff=id=>skip.has(id)&&!done.has(id);   // skipped and not ticked: left out of the count
const total=()=>steps.filter(li=>!isOff(li.dataset.step)).length;
// The app's Home card reads these. cur is null when there is nothing to continue at; at is set by ticks only.
// keep: leave a cur that is still a step of this page as it is (the player may have put it there).
const store=(ticked,keep)=>{
  state.done=[...done];state.n=count();
  if(skip.size||Array.isArray(state.skip))state.skip=[...skip];
  if(!(keep&&typeof state.cur==='string'&&ids.includes(state.cur))){const t=target();state.cur=t>=0?ids[t]:null;}
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
// Also adds cur to a record saved before it existed, and recomputes one that names a step no longer on the page
// (Home's Continue link is built from it).
if(state.n!==count()||!('cur' in state)||(typeof state.cur==='string'&&!ids.includes(state.cur)))store(false,true);
remember();
// A notice another page left for this chapter (progress.js, when it carried a place over): shown once, then removed.
(()=>{
  const m=read('koii-coach-meta');
  if(!m||typeof m!=='object'||m.v!==1||!Array.isArray(m.notices))return;
  const mine=m.notices.filter(x=>x&&x.chapter===slug&&typeof x.text==='string');
  if(!mine.length)return;
  note=[note,...mine.map(x=>x.text)].filter(Boolean).join(' ');
  m.notices=m.notices.filter(x=>!mine.includes(x));
  try{localStorage.setItem('koii-coach-meta',JSON.stringify(m));}catch(e){}
})();

// The step after the one ticked most recently (or after the furthest ticked step) that is not ticked yet.
function target(){
  let i=ids.indexOf(state.last);
  if(i<0)for(let j=ids.length-1;j>=0;j--)if(done.has(ids[j])){i=j;break;}
  if(i<0)return -1;
  for(let j=i+1;j<ids.length;j++)if(ids[j]&&!done.has(ids[j])&&!skip.has(ids[j]))return j;
  return -1;
}
// The step to continue at: cur while it is a step of this page, else the step after the last tick (-1: none).
function here(){const i=ids.indexOf(state.cur);return i>=0?i:target();}
function go(j){
  const li=steps[j],d=li.closest('details');
  if(d)d.open=true;
  li.scrollIntoView({block:'start'});
  li.tabIndex=-1;li.focus({preventScroll:true});
}

// Listeners added with CoachChapter.onChange (player.js), told after every change made here.
const listeners=[];
function emit(type,id){listeners.forEach(fn=>{try{fn({type,id});}catch(e){console.error(e);}});}
// Tick or untick one step: the checkbox and CoachChapter.setDone both come here. Returns false when nothing changed.
const boxes={};
function tick(id,on){
  if(!id||!ids.includes(id)||on===done.has(id))return false;
  if(on){done.add(id);state.last=id;skip.delete(id);}
  else{done.delete(id);if(state.last===id)state.last=[...done].pop()||null;}
  if(boxes[id])boxes[id].checked=on;
  store(true);update();emit('tick',id);
  return true;
}
// Checkboxes: "Mark step 4 done" is the accessible name, counted within the part as everywhere else (plan 4); a step
// with a title (h3.step-title) is its description.
steps.forEach((li,i)=>{
  const id=li.dataset.step;if(!id)return;
  const label=document.createElement('label'),box=document.createElement('input'),text=document.createElement('span');
  label.className='check';box.type='checkbox';box.checked=done.has(id);text.textContent='Mark step '+([...li.parentElement.children].filter(x=>x.matches('li[data-step]')).indexOf(li)+1)+' done';
  const title=li.querySelector(':scope > .step-title');
  if(title){if(!title.id)title.id='t-'+id;box.setAttribute('aria-describedby',title.id);}
  label.append(box,text);li.append(label);boxes[id]=box;
  box.addEventListener('change',()=>{
    tick(id,box.checked);
    if(window.CoachWake)CoachWake.poke();   // someone is working at the unit: keep the screen awake
  });
});

// Per-section tallies in each summary.
const sections=[...document.querySelectorAll('.steps > details')].map(d=>{
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
  const count=steps.filter(li=>done.has(li.dataset.step)).length,all=total(),t=here(),btn=$('resume');
  $('progress-count').textContent=count===all?'All '+all+' steps done':count+' of '+all+' done';
  const fill=document.querySelector('#progress .meter-fill');
  if(fill)fill.style.width=(all?Math.round(100*count/all):0)+'%';
  btn.hidden=t<0;
  // Within its part, as the step card counts (plan 4: "Part 2 · …", "Step 4 of 8").
  if(t>=0){
    const li=steps[t],sec=li.closest('details'),k=[...li.parentElement.children].filter(x=>x.matches('li[data-step]')).indexOf(li)+1;
    const pn=(/Part\s+(\d+)/.exec(sec&&sec.querySelector('summary')?sec.querySelector('summary').textContent:'')||[])[1];
    btn.innerHTML='Continue at '+(pn?'Part '+pn+', step '+k:'step '+(t+1))+'<svg class="icon" aria-hidden="true"><use href="icons.svg#i-next"></use></svg>';
  }
  steps.forEach((li,j)=>mark(li,j===t));
  sections.forEach(([s,el])=>{
    const c=s.filter(li=>done.has(li.dataset.step)).length,n=s.filter(li=>!isOff(li.dataset.step)).length;
    el.textContent=c?c+' of '+n+' done':n+' steps';
    el.classList.toggle('all',c>0&&c===n);
  });
  steps.forEach(li=>li.classList.toggle('is-skipped',isOff(li.dataset.step)));
  const msg=[note,saved?'':'This browser is not saving your ticks (storage is blocked or full, or this is a private window). They will be lost when you close the page. Install the coach (add it to your home screen: an installed site keeps its storage), or export a progress file in Settings once ticks save again.'].filter(Boolean).join(' '),p=$('progress-note');
  p.textContent=msg;p.hidden=!msg;
  if(saved)p.removeAttribute('role');else p.setAttribute('role','alert');   // plan 5.10: storage blocked is an alert
  p.className='notice '+(saved?'info':'caution');   // a note about rewritten steps is information; ticks that cannot be saved need care
}

// "Needs OS x+" on the steps that need a newer OS than the one chosen in Settings (the old app's badge, kept as is).
(()=>{
  const fw=window.CoachProgress?CoachProgress.v2().firmware:'2.5',num={'2.5':2.5,'2':2,older:1}[fw],
    name={'2.5':'OS 2.5.x','2':'OS 2.0.x',older:'an OS older than 2.0'}[fw],upd='<a href="./setup.html">Chapter 0 · Set up your K.O. II</a> shows how';
  steps.forEach(li=>{
    const os=li.dataset.os;if(!os||!/^\d+(\.\d+){0,2}$/.test(os))return;
    const b=document.createElement(num>=parseFloat(os)?'p':'div'),tag='Needs OS '+os+'+';
    if(num>=parseFloat(os)){b.className='badge ok';b.textContent=tag+' · your '+name+' has it.';}
    else{b.className='badge warn';b.innerHTML='<b>'+tag+'</b> '+(num?'You chose '+name+' in <a href="./settings.html">Settings</a>, which doesn’t have this. Update to the latest OS first ('+upd+'), or skip this step.':'Not sure which OS you have? Update to the latest OS first ('+upd+'), then choose it in <a href="./settings.html">Settings</a>.');}
    const old=li.querySelector(':scope > .os-badge');
    if(old)old.replaceWith(b);else{const t=li.querySelector(':scope > .step-title');if(t)t.after(b);else li.prepend(b);}
  });
})();
$('resume').addEventListener('click',()=>{const t=here();if(t>=0)go(t);});
const openAll=()=>document.querySelectorAll('details').forEach(d=>d.open=true);
addEventListener('beforeprint',openAll);
$('print').addEventListener('click',()=>{openAll();print();});
// Restart this chapter: asks first, clears its ticks and skips, and can be undone for 10 seconds (plan 5.6). The
// K.O. II keeps what was made, so the question says how to practise again (in project 6, Chapters 1, 2 and 4 share it).
function apply(){
  document.querySelectorAll('.check input').forEach(b=>{b.checked=done.has(b.closest('li').dataset.step);});
  update();
  if(window.CoachShell)CoachShell.refresh();   // no change event fires here, so tell the shell's course list itself
}
$('reset').addEventListener('click',()=>{
  if(!confirm('Restart this chapter?\n\nThis clears every tick in it. Other chapters keep their progress. Your K.O. II keeps what you made. Practise again in a fresh copy with SHIFT + MAIN, or back up first.'+(book==='project-6'?' Project 6 also holds your work from Chapters 1, 2 and 4.':'')+' You can undo this for 10 seconds.'))return;
  const before={done:[...done],skip:[...skip],last:state.last,cur:state.cur,at:state.at};
  done.clear();skip.clear();state.last=null;note='';store();
  apply();
  emit('reset',null);
  say('Chapter restarted.',()=>{
    before.done.forEach(x=>done.add(x));before.skip.forEach(x=>skip.add(x));
    Object.assign(state,{last:before.last,cur:before.cur,at:before.at});store(false,true);
    apply();emit('current',state.cur);
  });
});
['progress','reset','print'].forEach(id=>$(id).hidden=false);
update();
// The progress bar sticks under the app bar. Tell the stylesheet how tall it is (it wraps on narrow screens and
// with large text), so that focus and "Continue" stop below it instead of under it.
const bar=$('progress'),measure=()=>document.documentElement.style.setProperty('--status-h',bar.offsetHeight+'px');
measure();
if(window.ResizeObserver)new ResizeObserver(measure).observe(bar);
// Reopen the section where the learner left off (without scrolling away from the top of the page).
const t=here();
if(t>=0){const d=steps[t].closest('details');if(d)d.open=true;}
// A link to one step (for example sampling.html#s-open-empty-project) opens its section, scrolls the step in below the
// sticky bars, focuses it and marks it for two seconds (coach.css draws the mark; reduced motion gets none).
// An id that no longer exists only says so in the toast (it shows wherever the page is scrolled to): an old link never
// moves the page. The toast is the page's own #toast if it has one, else one made here (wake.js does the same).
function say(text,undo){
  let el=$('toast');
  if(!el){el=document.createElement('div');el.id='toast';el.className='toast hidden';el.setAttribute('role','status');document.body.append(el);}
  el.textContent=text;el.classList.remove('hidden');
  clearTimeout(say.timer);
  if(typeof undo==='function'){
    const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='Undo';
    b.addEventListener('click',()=>{clearTimeout(say.timer);el.classList.add('hidden');undo();});
    el.append(b);
  }
  say.timer=setTimeout(()=>el.classList.add('hidden'),typeof undo==='function'?10000:5000);
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
// The step player (player.js, loaded after this file) may take the routes over with CoachChapter.route(fn). The first
// route waits for DOMContentLoaded, which comes after every deferred script, so the player is there by then.
let router=null,routed=false;
function route(){
  if(router){try{if(router(location.hash))return;}catch(e){console.error(e);}}
  openHash();
}
const firstRoute=()=>{if(routed)return;routed=true;route();};
if(document.readyState==='complete')firstRoute();
else{document.addEventListener('DOMContentLoaded',firstRoute,{once:true});addEventListener('load',firstRoute,{once:true});}
addEventListener('hashchange',route);

window.CoachChapter={
  slug,
  steps:()=>steps.slice(),
  ids:()=>ids.slice(),
  isDone:id=>done.has(id),
  count,
  total,
  setDone(id,on){
    const changed=tick(id,Boolean(on));
    if(changed&&window.CoachShell)CoachShell.refresh();   // no change event fires, so tell the shell's course list
    return changed;
  },
  current(){const i=here();return i>=0?ids[i]:null;},
  setCurrent(id){
    if(!id||!ids.includes(id)||state.cur===id)return;
    state.cur=id;save();update();emit('current',id);
  },
  resumeId(){
    const i=here();if(i>=0)return ids[i];
    if(!count()&&!skip.size)return null;
    return ids.find(id=>id&&!done.has(id)&&!skip.has(id))||null;
  },
  hasProgress:()=>count()>0||skip.size>0,
  isSkipped:id=>isOff(id),
  skipped:()=>[...skip].filter(isOff),
  setSkipped(list,on){
    let changed=false;
    (Array.isArray(list)?list:[list]).forEach(id=>{if(!ids.includes(id)||done.has(id))return;if(on&&!skip.has(id)){skip.add(id);changed=true;}else if(!on&&skip.delete(id))changed=true;});
    if(!changed)return false;
    store(false,true);update();emit('skip',null);
    if(window.CoachShell)CoachShell.refresh();
    return true;
  },
  lastAt:()=>typeof state.at==='string'?state.at:null,
  onChange(fn){if(typeof fn==='function')listeners.push(fn);},
  go(id){const j=ids.indexOf(id);if(j>=0)go(j);},
  say,
  saved:()=>saved,
  route(fn){router=typeof fn==='function'?fn:null;},
  routed:()=>routed   // true once the first route has run (a router added later should then route the page itself)
};

// ---------- Your notes: scene and sample numbers (koii-coach-notes, docs/overhaul-plan.md 7.7) ----------
// A step with data-note="DRUMS" (several: "V1|V2|V3", and data-note-kind="sample" for sample numbers) asks you to
// write a number down; it gets LCD-style fields under its Check for them. Paper still works: the fields are
// optional. Numbers are kept per project, so Chapters 1, 2 and 4 (all in project 6) share theirs:
// koii-coach-notes = {v:1, values:{'project-6/DRUMS':'3', 'tech-house/GROOVE':'5', …}}. A later step that names a
// noted scene or sample in its Before you press or Do lines shows "Your notes: GROOVE 5" there, and "Get back in"
// (player.js) lists every note of the project. Export, import and Reset all progress include the key (progress.js).
const NOTES='koii-coach-notes',book=({'first-beat':'project-6',song:'project-6',perform:'project-6'})[slug]||slug;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readNotes=()=>{try{const v=JSON.parse(localStorage.getItem(NOTES)||'null');if(v&&v.v===1&&v.values&&typeof v.values==='object'&&!Array.isArray(v.values))return v;}catch(e){}return{v:1,values:{}};};
const noted=()=>{const v=readNotes().values;return Object.keys(v).filter(k=>k.startsWith(book+'/')&&/^\d{1,3}$/.test(String(v[k]))).map(k=>[k.slice(book.length+1),String(v[k])]);};
const namesOf=li=>(li.dataset.note||'').split('|').map(s=>s.trim()).filter(Boolean);
const listHTML=list=>list.map(([n,v])=>`<span class="note-pair">${esc(n)} <samp class="lcd">${esc(v)}</samp></span>`).join(' · ');
const mentions=(text,name)=>new RegExp('(^|[^A-Z0-9])'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Z0-9])').test(text);
function recall(){
  const all=noted();
  steps.forEach(li=>{
    li.querySelectorAll(':scope > .note-recall').forEach(e=>e.remove());
    if(!all.length)return;
    const own=namesOf(li),pre=li.querySelector(':scope > .preflight'),dos=[...li.querySelectorAll(':scope > .step-do')];
    if(!dos.length)return;
    const preText=pre?pre.textContent:'',doText=dos.map(d=>d.textContent).join(' ');
    const hits=all.filter(([n])=>!own.includes(n)&&(mentions(preText,n)||mentions(doText,n)));
    if(!hits.length)return;
    const p=document.createElement('p');p.className='note-recall pl-own';
    p.innerHTML='Your notes: '+listHTML(hits);
    (pre&&hits.some(([n])=>mentions(preText,n))?pre:dos[dos.length-1]).after(p);
  });
}
function setNote(name,val){
  const n=readNotes(),k=book+'/'+name;
  if(val)n.values[k]=val;else delete n.values[k];
  try{localStorage.setItem(NOTES,JSON.stringify(n));}catch(e){}
  recall();
}
steps.forEach(li=>{
  const names=namesOf(li);if(!names.length)return;
  const kind=li.dataset.noteKind==='sample'?'sample':'scene',vals=Object.fromEntries(noted());
  const box=document.createElement('div');box.className='note-fields pl-own';
  box.innerHTML=`<p class="note-hint">Keep ${names.length>1?'them':'it'} here too, if you like (paper works as well):</p>`+
    names.map(n=>`<label class="note-field"><span class="note-name">${esc(n)}</span><input class="lcd-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" autocomplete="off" spellcheck="false" data-note-name="${esc(n)}" aria-label="${esc(n)}, ${kind} number" value="${esc(vals[n]||'')}"></label>`).join('');
  box.querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>{const v=i.value.replace(/\D/g,'').slice(0,3);if(v!==i.value)i.value=v;setNote(i.dataset.noteName,v);}));
  // Under the Check (the step's gate is its Do and Check), or under the Do lines when there is none.
  const dos=li.querySelectorAll(':scope > .step-do');(li.querySelector(':scope > .step-check')||dos[dos.length-1]||li.querySelector(':scope > .step-title')||li.firstElementChild).after(box);
});
recall();
addEventListener('storage',e=>{if(e.key===NOTES)recall();});
// chapter(): this chapter's own names, in page order, with what is noted for each ('' when nothing is): [name, value, kind].
const chapterNotes=()=>{const v=Object.fromEntries(noted()),out=[];steps.forEach(li=>namesOf(li).forEach(n=>{if(!out.some(x=>x[0]===n))out.push([n,v[n]||'',li.dataset.noteKind==='sample'?'sample':'scene']);}));return out;};
window.CoachNotes={book,list:noted,chapter:chapterNotes,html:()=>{const l=noted();return l.length?'<p class="note-recall">Your notes: '+listHTML(l)+'</p>':'';}};
})();
