'use strict';
/* Home (index.html, plan 5.1). The page is complete without JavaScript: the welcome card with the set-up question, the
   course in guided order, the device projects and the tools. This file adds where the learner is:
   - a first run (judged by what has been done, never by which keys exist: CoachProgress.firstRun()) keeps the welcome;
     "It's set up" stores koii-coach-prefs.setup = 'ready'.
   - everyone else gets "Welcome back" and one Continue card (#resume) that opens the exact step: Chapter 0 while
     set-up is not 'ready'; else the unfinished chapter that moved last (its record's "at"); else meta.lastChapter;
     else the first one with progress; else the next one not started (CoachProgress.continueTarget). The card names
     the part and the step it opens at, read from the chapter's own page (precached; without it the card still works).
     All eight done: a course-complete card that lists what each chapter made (site.js "made"), and leads to the
     cheat sheet's route for a track of your own (cheat-sheet.html#own-track).
   - each course row shows its state (LED, x/N, a name that says it) and links to where that chapter continues; the
     Continue chapter is marked "You are here". 00, when the learner said their unit is set up, reads "Skipped · do it
     any time", or "Optional · set-up checks" when Home moved an existing learner past it (meta.setupReason).
     The rows are #course-list li, in site.js order, in two labelled lists: Chapters 0-2 in order, then 3-7 in any order
     (guided order, Continue and numbering stay 0-7). A row's one-line goal (.goal, written in index.html) is kept.
   - the first-run card links to Settings' progress card (settings.html#your-progress, focus on Load progress file), for a learner whose
     progress is in another browser or was cleared.
   Old addresses (index.html#first and the other views of the retired single-page app) are sent to their pages by the
   script at the top of <head>; any other hash is dropped, so "/" always means Home. */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const P=window.CoachProgress,site=window.COACH_SITE;
if(!P||!site)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
if(location.hash){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}

const PROJECT={setup:'Project 9 (scratch)','first-beat':'Project 6',song:'Project 6',sampling:'Project 7',perform:'Project 6',hiphop:'Project 8','tech-house':'Project 9','vocal-house':'Reuses a project'};
const mins=m=>Array.isArray(m)&&m.length===2?(m[0]>=120&&m[0]%60===0&&m[1]%60===0?`${m[0]/60}–${m[1]/60} h`:`${m[0]}–${m[1]} min`):'';
const about=p=>[PROJECT[p.c.slug],mins(p.c.minutes)].filter(Boolean).join(' · ');
const hours=all=>{const t=all.reduce((a,p)=>Array.isArray(p.c.minutes)?[a[0]+p.c.minutes[0],a[1]+p.c.minutes[1]]:a,[0,0]);return`about ${Math.round(t[0]/60)}–${Math.round(t[1]/60)} hours`;};

function continueCard(all){
  const p=P.continueTarget(all);
  if(!p)return`<section class="card continue complete" aria-labelledby="continue-title"><p class="eyebrow">Course complete</p><h2 id="continue-title">All ${all.length} chapters done</h2>`+
    `<p>What you made:</p><ul class="made-list">${all.map(q=>`<li><span class="num">${esc(q.c.num)}</span> <a href="${esc(q.c.href)}">${esc(q.c.title)}</a>${q.c.made?`<span class="sub meta">${esc(q.c.made.charAt(0).toUpperCase()+q.c.made.slice(1))}.</span>`:''}</li>`).join('')}</ul>`+
    `<p>The cheat sheet keeps the moves you learned in one place. It also lists the parts you have done, in order, from an empty project to a finished track.</p>`+
    `<a class="btn primary lg" id="resume" href="./cheat-sheet.html#own-track">Make your own track${icon('next')}</a></section>`;
  const{c,x,n}=p,started=x>0||p.at>0;
  return`<section class="card continue" aria-labelledby="continue-title"><p class="eyebrow">${started?'Continue':'Next'} · Chapter ${esc(c.num)}</p><h2 id="continue-title">${esc(c.title)}</h2>`+
    `<p class="where" id="continue-part" hidden></p><p class="where-step meta" id="continue-step" hidden></p>`+
    `<p class="continue-count"><span class="meter" aria-hidden="true"><span class="meter-fill" style="width:${Math.round(100*x/Math.max(1,n))}%"></span></span><span>${started?`${x} of ${n} done`:`${n} steps`}</span></p>`+
    `<ul class="chips" aria-label="About this chapter">${about(p).split(' · ').filter(Boolean).map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`+
    `<a class="btn primary lg" id="resume" href="${esc(p.href)}">${started?'Continue':'Start Chapter '+esc(c.num)}${icon('next')}</a>`+
    (P.migratedSetup&&x?`<p class="meta">Your progress was carried over: ${x} of ${n} in Chapter ${esc(c.num)}. Chapter 0 stays in the list as optional set-up checks.</p>`:'')+'</section>';
}
// The part and the step Continue opens at, from the chapter's page. Without it (offline before the first full visit)
// the card keeps its count and the button.
async function where(p){
  if(!p||!p.cur)return;
  try{
    const res=await fetch(p.c.href);if(!res.ok)return;
    const dom=new DOMParser().parseFromString(await res.text(),'text/html');
    const li=dom.querySelector(`.steps li[data-step="${CSS.escape(p.cur)}"]`),d=li&&li.closest('details'),s=d&&d.querySelector('summary');
    if(!li||!s)return;
    const m=/^(?:Part\s+)?(\d+)\s*[\/·]\s*(.*)$/.exec(s.textContent.replace(/\s+/g,' ').trim()),list=[...d.querySelectorAll('ol > li[data-step]')],t=li.querySelector('.step-title');
    const part=$('#continue-part'),step=$('#continue-step');
    if(m){part.textContent=`Part ${+m[1]} · ${m[2]}`;part.hidden=false;}
    step.textContent=`Step ${list.indexOf(li)+1} of ${list.length}`+(t?' · '+t.textContent.replace(/\s+/g,' ').trim():'');step.hidden=false;
    const os=/\bOS (\d+\.\d+(?:\.\d+)?)( or newer| or later)?/.exec([...dom.querySelectorAll('main > p')].slice(0,6).map(e=>e.textContent).join(' '));
    if(os)$('.continue .chips').insertAdjacentHTML('beforeend',`<li>OS ${esc(os[1])}${os[2]?'+':''}</li>`);
  }catch(e){}
}
function rows(all){
  const ready=P.prefs().setup==='ready',moved=P.meta().setupReason==='existing-progress',list=$$('#course-list li'),here=P.continueTarget(all);
  all.forEach((p,i)=>{
    const li=list[i];if(!li)return;
    const goal=li.querySelector('.goal');
    const{c,x,n,done}=p,st=done?'done':x>0?'doing':'todo',opt=st==='todo'&&c.slug==='setup'&&ready,now=p===here&&!P.firstRun();
    const label=moved?'Optional · set-up checks':'Skipped · do it any time';
    const count=done?'Done':x>0?`${x}/${n}`:opt?label:'Not started',said=done?'done':x>0?`in progress, ${x} of ${n} steps`:opt?label.toLowerCase().replace(' · ',', '):'not started';
    li.dataset.state=st;li.classList.toggle('here',now);
    li.innerHTML=`<span class="led" aria-hidden="true"></span><span><span class="num">${esc(c.num)}</span> <a href="${esc(p.href)}">${esc(c.title)}<span class="sr">, ${said}${now?', where you continue':''}</span></a>`+
      `${now?'<span class="tag here-tag" aria-hidden="true">You are here</span>':''}${goal?goal.outerHTML:''}<span class="sub meta">${esc(about(p))}</span></span><span class="meta" aria-hidden="true">${count}</span>`;
  });
  const done=all.filter(p=>p.done).length;
  $('#course-meta').textContent=`Guided order · ${hours(all)} · ${done} of ${all.length} done`;
}
function render(){
  const all=P.chapters(),card=$('#home-card');
  if(card&&!P.firstRun()){
    const h=document.createElement('header');
    h.className='page-head compact';h.innerHTML='<h1>Welcome back</h1>';
    $('#main').prepend(h);
    card.outerHTML=continueCard(all);
    where(P.continueTarget(all));
  }else if(card){
    const r=$('#setup-ready');
    if(r)r.addEventListener('click',()=>P.patch('koii-coach-prefs',{setup:'ready'}));
  }
  rows(all);
}
render();
// The Spec look shows the OS the course is written for as a starburst on the welcome or Continue card (decision 28).
const panel=document.querySelector('.home .card.welcome,.home .card.continue');
if(panel&&site.firmware)panel.dataset.os=site.firmware;
const line=[site.version&&`Version ${site.version}`,site.firmware&&`written for ${site.firmware}`].filter(Boolean).join(' · ');
const info=$('#course-info');if(info&&line)info.textContent=line+'.';
// Back from a chapter (the back/forward cache keeps the old page): show the progress made since.
addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
})();
