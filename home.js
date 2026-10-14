'use strict';
/* Home (index.html, plan 5.1). The page is complete without JavaScript: the welcome card with the set-up question, the
   course in guided order, the device projects and the tools. This file adds where the learner is:
   - a first run (judged by what has been done, never by which keys exist: CoachProgress.firstRun()) keeps the welcome;
     "It's set up" stores koii-coach-prefs.setup = 'ready'.
   - everyone else gets "Welcome back" and one Continue card (#resume) that opens the exact step: Chapter 00 while
     set-up is not 'ready'; else the unfinished chapter that moved last (its record's "at"); else meta.lastChapter;
     else the first one with progress; else the next one not started. All eight done: a course-complete card.
   - each course row shows its state (LED, x/N, a name that says it) and links to where that chapter continues.
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

function target(all){
  const open=all.filter(p=>!p.done),setup=open.find(p=>p.c.slug==='setup'),last=P.meta().lastChapter;
  if(!open.length)return null;
  if(setup&&P.prefs().setup!=='ready')return setup;
  return open.filter(p=>p.at).sort((a,b)=>b.at-a.at)[0]||(last&&open.find(p=>p.c.slug===last))||open.find(p=>p.x>0)||open.find(p=>p!==setup)||open[0];
}
function continueCard(all){
  const p=target(all);
  if(!p)return`<section class="card continue" aria-labelledby="continue-title"><p class="eyebrow">Course complete</p><h2 id="continue-title">All ${all.length} chapters done</h2><p>Revisit any chapter below. The cheat sheet keeps the moves you learned in one place.</p><a class="btn primary lg" id="resume" href="./cheat-sheet.html">Open the cheat sheet${icon('next')}</a></section>`;
  const{c,x,n}=p,started=x>0||p.at>0;
  return`<section class="card continue" aria-labelledby="continue-title"><p class="eyebrow">${started?'Continue':'Next'} · Chapter ${esc(c.num)}</p><h2 id="continue-title">${esc(c.title)}</h2>`+
    `<p class="where">${started?`${x} of ${n} done`:`${n} steps`}</p><span class="meter" aria-hidden="true"><span class="meter-fill" style="width:${Math.round(100*x/Math.max(1,n))}%"></span></span>`+
    `<p class="meta">${esc(about(p))}</p><a class="btn primary lg" id="resume" href="${esc(p.href)}">${started?'Continue':'Start Chapter '+esc(c.num)}${icon('next')}</a>`+
    (P.migratedSetup?'<p class="meta">Home is new: it found your progress, so Continue picks up where you left off. Chapter 00 stays in the course list as optional set-up checks.</p>':'')+'</section>';
}
function rows(all){
  const ready=P.prefs().setup==='ready',list=$$('#course-list > li');
  all.forEach((p,i)=>{
    const li=list[i];if(!li)return;
    const{c,x,n,done}=p,st=done?'done':x>0?'doing':'todo',opt=st==='todo'&&c.slug==='setup'&&ready;
    const count=done?'Done':x>0?`${x}/${n}`:opt?'Optional':'Not started',said=done?'done':x>0?`in progress, ${x} of ${n} steps`:opt?'optional set-up checks':'not started';
    li.dataset.state=st;
    li.innerHTML=`<span class="led" aria-hidden="true"></span><span><span class="num">${esc(c.num)}</span> <a href="${esc(p.href)}">${esc(c.title)}<span class="sr">, ${said}</span></a><span class="sub meta">${esc(about(p))}</span></span><span class="meta" aria-hidden="true">${count}</span>`;
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
  }else if(card){
    const r=$('#setup-ready');
    if(r)r.addEventListener('click',()=>P.patch('koii-coach-prefs',{setup:'ready'}));
  }
  rows(all);
}
render();
const line=[site.version&&`Course version ${site.version}`,site.guideChecked&&`checked against the official guide on ${site.guideChecked}`,site.firmware&&`written for ${site.firmware}`].filter(Boolean).join(' · ');
const info=$('#course-info');if(info&&line)info.textContent=line+'.';
// Back from a chapter (the back/forward cache keeps the old page): show the progress made since.
addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
})();
