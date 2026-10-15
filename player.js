'use strict';
/* The step player for every chapter page (Chapters 0-7): a start screen, one step at a time with a fixed action
   bar, a checkpoint card after each part and a chapter-complete screen. Load it straight after chapter.js:
     <script src="player.js" defer></script>
   It reads the page's own markup and never re-renders it: other steps, parts and page sections are only hidden
   (the hidden attribute), so ids, ticks, anchors and the list stay exactly as they are. Ticks, cur, skips and the
   progress bar come from chapter.js (window.CoachChapter), so the list, the menu and the player always agree. Without
   JavaScript nothing here runs and the page reads top to bottom as before. Spec: docs/overhaul-plan.md 4.5, 5.2-5.13.

   Markup it reads (section.steps > details, one per part):
     summary "Part 2 · Build a drum kit" (an h2.part-title inside; "02 / Build a drum kit" is read too); p with <b>Goal:</b> and other notes; p.checkpoint; the p
     starting <b>If it doesn't:</b>; ol > li[data-step]: the step. Inside a step, when the chapter has been marked up:
       h3.step-title the step's name (other steps are named by their first line)
       p.preflight   the check that keeps a risky press safe ("Before you press", shown first in a caution box)
       p.step-consequence  a risk step's scope: what the press clears or deletes, before the Do lines
       p.step-do     the instruction (large); a step without one is a stage-1 step: its whole text is shown large
       p.step-undo   how to undo it, straight after the press; p.step-noundo says there is none
       p.step-check  what you hear or see afterwards (its own block, with an ear or an eye); every step has one,
                     except li[data-kind="info"|"recap"]
       p.step-note   more about the step, at body size; p.step-source names the official guide page
     li[data-risk="erase"]              recoverable clear: orange "Clears notes" tag, no gate
     li[data-risk="delete"|"overwrite"|"erase-scene"]  no undo: red tag ("Deletes", "Overwrites", "Erases the scene"),
                                        and the rest of the step stays folded until
                                        "Yes, I have checked" is pressed (per visit, never saved)
                                        (each risk tag links to its entry on safety.html)
     li[data-setting="401"]             neutral "System setting 401" tag
     li[data-os="2.5"]                  "Needs OS 2.5+" tag (chapter.js's badge then shows only when it warns)
     li[data-optional]                  "Optional" tag; a run of optional steps in one part can be skipped at once
     li[data-kind="recap"]              the chapter's recap: ticked by itself on the chapter-complete screen once
                                        every other step is done; its ul.step-moves show there as "New moves"
     a step whose text starts with a bold "Checkpoint." gets the checkpoint styling
     kbd.key inside the current step render hot (yellow) in the player, except inside p.step-check
   Around the steps: p.makes ("You will make: …": the start screen, and "You made" when the chapter is complete),
   .reference cards (folded into "Reference for this chapter" on the start screen) and .reentry (perform's "How every
   section starts": a "Get back in" card above the step when the last tick is more than 30 minutes old).

   Views and routes (the hash is the address of what is on screen; moving between steps uses replaceState):
     #start     the start screen          #s-<id>   the player at that step (list mode when the learner chose it)
     #all       All steps (list mode)     #done     chapter complete
     no hash    the start screen while the chapter has no ticks, #done once every step is ticked, else the player
                at the step to continue at (CoachChapter.resumeId()), with a "Welcome back" toast; list mode when the
                learner chose it. The wrapper id (sampling.html#sampling) means the same as no hash.
     a part anchor (sampling.html#make-your-own-kit) opens list mode at that part
   The choice between Player and All steps is saved per chapter in koii-coach-prefs.modes[<slug>] ('player' | 'all'),
   read-modify-write, so the other preferences stay. Only the switch saves it; a #all link does not.
   Opening a step from the menu, a link or search marks nothing and leaves cur where it is; a "Back to step N" pill
   then leads back to the step to continue at. A part's checkpoint answer (Yes / Not quite) is kept for the learner
   in koii-coach-meta.checkpoints[<slug>][<part id>] = 'yes' | 'not-yet'; it never changes a tick.

   The start screen's chips include "Formerly 07" for a chapter renumbered in 2026.10.14.4 (site.js formerly), once
   the learner has progress anywhere in the course.

   What it adds (all marked .pl-own): the app bar's two-line title and 4px meter (CoachShell.setTitle, setMeter); the
   menu's "This chapter" part and the desktop rail's chapter contents (CoachShell.registerChapter: progress, Player |
   All steps, every part and step, About, Print, Restart); a ⋮ button (#chapter-actions-btn) with the chapter actions
   (#chapter-actions: the switch, About this chapter, Print all steps, Report this step, Restart this chapter);
   #player-actions (Back, Tools, Done · Next); #player-check; #player-done; #player-report (the "This step doesn't
   match my K.O. II" link, moved into the step on screen and pre-filled for it); the start screen's chips, safety and
   reference summaries and parts list; .player-modes; .back-pill; .getback; and inside each step a .step-head (the
   part-relative "1 of 4" and the tags), a .skip-box on the first of a run of optional steps and, for a delete or
   overwrite step, a .gate. coach.css, "Step player", draws them. <html data-player="start|step|check|done"> is set
   while the player shows one of its views.
   After every change of view it fires a "coach:view" event on document, detail {view: 'start'|'step'|'check'|'done'|
   'list', step: the id on screen or null}; first-beat.js and the Tools sheet (toolsheet.js) use it.
   window.CoachPlayer = {view(), current()}: what is on screen. */
(()=>{
const C=window.CoachChapter,main=document.getElementById('main'),wrap=document.querySelector('.steps');
if(!C||!main||!wrap)return;
const root=document.documentElement,slug=C.slug||'',steps=C.steps().filter(li=>li.dataset.step);
if(!steps.length)return;
const Shell=window.CoachShell||null;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const downIcon='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg>';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const managed=new Set();   // elements this file hid (the hidden attribute); only these are ever shown again
const plural=(n,one,many)=>n+' '+(n===1?one:many);
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
// Text without what this file added (the "Step 2 of 5:" for screen readers, tags).
const own=e=>{let t='';e.childNodes.forEach(n=>{if(n.nodeType===1&&n.matches('.pl-own,.here-tag'))return;t+=n.textContent;});return clean(t);};

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
  const m=/^(?:Part\s+)?(\d+)\s*[\/·]\s*(.*)$/.exec(head),kids=[...d.children].filter(e=>e!==sum);
  const checkpoint=kids.find(e=>e.classList.contains('checkpoint'))||null;
  const ifnot=kids.find(e=>e.tagName==='P'&&/^If it doesn['’]t\b/i.test(firstBold(e)))||null;
  const notes=kids.filter(e=>e.tagName!=='OL'&&e!==checkpoint&&e!==ifnot);
  return{el:d,i,n:m?parseInt(m[1],10):i+1,title:m?m[2]:head,id:d.id||'part-'+(i+1),steps:steps.filter(li=>d.contains(li)),checkpoint,ifnot,notes};
});
const byId=new Map(steps.map(li=>[li.dataset.step,li]));
const partOf=li=>parts.find(p=>p.steps.includes(li));
const inPart=li=>{const P=partOf(li);return[P.steps.indexOf(li)+1,P.steps.length];};
// Steps are numbered within their part everywhere the learner reads a number (plan 4: "Part 2 · …", "Step 4 of 8").
const where=li=>'Part '+partOf(li).n+', step '+inPart(li)[0];
// One line of a step for the menu and the "not ticked yet" list: its title, else its first words.
function gist(li){
  const title=li.querySelector(':scope > .step-title');
  if(title)return own(title);
  const src=li.querySelector(':scope > .step-do')||li;let t='';
  src.childNodes.forEach(n=>{if(n.nodeType===1&&n.matches('.check,.here-tag,.step-head,.gate,.preflight,.skip-box,.badge,.pl-own'))return;t+=n.textContent;});
  return clean(t);
}
const isDone=li=>C.isDone(li.dataset.step),isSkipped=li=>Boolean(C.isSkipped&&C.isSkipped(li.dataset.step));
const settled=li=>isDone(li)||isSkipped(li);

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
const makes=main.querySelector(':scope > .makes');
const references=[...main.querySelectorAll(':scope > .reference')];
const reentry=main.querySelector('.reentry');
const fw=window.CoachProgress?CoachProgress.v2().firmware:'2.5',fwNum={'2.5':2.5,'2':2,older:1}[fw]||0;
// "Formerly 07" helps someone who knew the old numbers (decision 1): it shows once you have progress anywhere in the
// course, never to a first-time learner. Search finds the old numbers for everyone.
const returning=(()=>{try{return CoachProgress.chapters().some(p=>p.x>0);}catch(e){return true;}})();

// koii-coach-prefs.modes[<slug>]: 'player' (the default) or 'all'. koii-coach-meta.checkpoints[<slug>][<part id>].
// Both read-modify-write, so the other fields stay; a meta of a newer format is left alone.
const PREFS='koii-coach-prefs',META='koii-coach-meta';
const readObj=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}catch(e){return null;}};
const sub=(o,k)=>o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])?o[k]:{};
function mode(){const p=readObj(PREFS),m=p?sub(p,'modes')[slug]:null;return m==='all'?'all':'player';}
function setMode(m){
  const p=readObj(PREFS)||{v:1};if(!p.v)p.v=1;
  const modes=sub(p,'modes');modes[slug]=m;p.modes=modes;
  try{localStorage.setItem(PREFS,JSON.stringify(p));}catch(e){}
}
function answer(P,a){
  const m=readObj(META)||{v:1};if(m.v!==1)return;
  const all=sub(m,'checkpoints'),mine=sub(all,slug);
  mine[P.id]=a;all[slug]=mine;m.checkpoints=all;
  try{localStorage.setItem(META,JSON.stringify(m));}catch(e){}
}

// ---------- Inside each step: the head (number and tags), the check's sense, the gate, the skip box ----------
const RISK={erase:['caution','Clears notes','recoverable'],delete:['danger','Deletes · no undo','delete-sample'],overwrite:['danger','Overwrites · no undo','crop-sample'],'erase-scene':['danger','Erases the scene · no undo','erase-scene']};
const gates=new Map(),heads=new Map();
steps.forEach(li=>{
  const risk=RISK[li.dataset.risk]||null,setting=clean(li.dataset.setting),os=/^\d+(\.\d+){0,2}$/.test(li.dataset.os||'')?li.dataset.os:'';
  const isCheck=/^Checkpoint\b/.test(firstBold(li.querySelector(':scope > .step-do')||li));
  if(isCheck)li.classList.add('is-checkpoint');
  const tags=[risk?`<a class="tag ${risk[0]}" href="./safety.html#${risk[2]}">${risk[1]}</a>`:'',setting?`<span class="tag info">System setting ${esc(setting)}</span>`:'',os?`<span class="tag os">Needs OS ${os}+</span>`:'',
    'optional' in li.dataset?'<span class="tag">Optional</span>':'',isCheck?'<span class="tag done">Checkpoint</span>':'','<span class="tag skipped-tag" hidden>Skipped</span>'].join('');
  // Every step names its source (plan 6.7): a step without its own p.step-source shows its part's "Official guide"
  // links in the step player (the list shows them once per part).
  if(!li.querySelector(':scope > .step-source')){
    const g=(partOf(li)||{notes:[]}).notes.find(e=>e.tagName==='P'&&/^\s*Official guide/.test(e.textContent));
    if(g){const s=copy(g);s.className='step-source pl-own part-source';li.append(s);}
  }
  const [k,n]=inPart(li);
  // The step's place in its part ("2 of 5"), as the list numbers it. Screen readers hear it once, from the title
  // ("Step 2 of 5: …"), so the chip itself is hidden from them.
  const head=el('div','step-head pl-own',`<span class="step-num" aria-hidden="true">${k} of ${n}</span>${tags}`);
  li.prepend(head);heads.set(li,head);
  // A titled step's focus lands on its title, which then says where it is.
  const title=li.querySelector(':scope > .step-title');
  if(title)title.prepend(el('span','sr pl-own',`Step ${k} of ${n}: `));
  const chk=li.querySelector(':scope > .step-check');
  if(chk)chk.dataset.sense=/\b(hear|hears|heard|listen|sounds?|plays?|playing|silent|silence|quiet|loud|louder|thud|tick|click)\b/i.test(chk.textContent)?'hear':'see';
  if(!risk||risk[0]!=='danger')return;
  // Delete and overwrite: the rest of the step waits for "Yes, I have checked". A stage-1 step's loose text is put in
  // one <div class="step-body"> first, so it can be folded away (its text is unchanged).
  const keep=n=>n.nodeType===1&&n.matches('.step-head,.step-title,.preflight,.step-consequence,.check,.here-tag');
  if([...li.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())){
    const body=el('div','step-body');
    [...li.childNodes].filter(n=>!keep(n)).forEach(n=>body.append(n));
    (li.querySelector(':scope > .preflight')||title||head).after(body);
  }
  const pre=li.querySelector(':scope > .preflight');
  const g=el('div','gate pl-own',
    (pre?'':`<p class="gate-note">${li.dataset.risk==='overwrite'?'There is no undo. Check that you are on the right sound before you press.':'There is no undo. Check that you are on the right sound or scene before you press.'}</p>`)+
    '<button class="btn gate-btn" type="button">Yes, I have checked</button>'+
    '<p class="gate-hint">The rest of this step shows once you confirm.</p>'+
    `<span class="tag done gate-ok" hidden>${icon('check')}Checked</span>`);
  g.hidden=true;
  (li.querySelector(':scope > .step-consequence')||pre||title||head).after(g);
  gates.set(li,{box:g,btn:g.querySelector('.gate-btn'),hint:g.querySelector('.gate-hint'),ok:g.querySelector('.gate-ok')});
  gates.get(li).btn.addEventListener('click',()=>{confirmed=li;render();focusStep(li);});
});
// A run of optional steps in one part: its first step offers to skip the whole run (plan 5.3). Skipped steps stop
// counting towards the chapter; ticking one later brings it back.
const groups=new Map();   // first step of a run -> the run
parts.forEach(P=>{
  let run=[];
  const flush=()=>{if(run.length)groups.set(run[0],run);run=[];};
  P.steps.forEach(li=>{if('optional' in li.dataset)run.push(li);else flush();});
  flush();
});
groups.forEach((run,li)=>{
  const n=run.length,box=el('div','skip-box pl-own',
    `<p>You can skip ${n===1?'this step':n===2?'this step and the next':'these '+n+' steps'}: ${n===1?'it won’t':'they won’t'} hold up the chapter, and you can come back later.</p>`+
    `<button class="btn" type="button" data-skip>${n===1?'Skip this step':'Skip these '+n+' steps'}</button>`);
  box.hidden=true;
  (li.querySelector(':scope > .step-title')||heads.get(li)).after(box);
  box.querySelector('[data-skip]').addEventListener('click',()=>skipRun(run));
});

// ---------- Elements the player adds ----------
// "About this part": the goal and the notes of the part on screen (copies; the originals stay where they are).
const about=el('details','disclosure part-about pl-own','<summary>About this part</summary><div class="inside"></div>');
about.hidden=true;
// A copy for the player's own cards: no ids (they stay unique), and not hidden just because the original is put away.
function copy(node){
  const c=node.cloneNode(true);
  c.removeAttribute('id');c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
  if(managed.has(node))c.hidden=false;
  return c;
}
// Start screen: chips, safety summary, reference summary, parts list.
const chips=el('ul','player-chips pl-own'),safety=el('details','player-safety pl-own'),refBox=el('details','disclosure player-reference pl-own'),partsBox=el('section','player-parts pl-own'),
  moreBox=el('details','disclosure player-more pl-own');
chips.setAttribute('aria-label','About this chapter');
partsBox.setAttribute('aria-labelledby','player-parts-title');
[chips,safety,refBox,partsBox,moreBox].forEach(e=>{e.hidden=true;});
// Safety on the start screen: the danger notices, and a caution notice that starts with "Safety".
const isSafety=e=>e.matches('.notice.danger')||(e.matches('.notice.caution')&&/^\s*Safety/i.test(e.textContent));
// One screen (plan 5.2): with a p.promise and section.needs on the page, the long preamble (the intro, "What you need",
// other notices) folds into "About this chapter in full" under the parts. List mode and print show it as written.
// With a short safety list (ul.safety-short), the safety notices in full join it there too.
const shortSafety=main.querySelector(':scope > .safety-short');
const longPre=document.querySelector('main > .promise')?preSteps().filter(e=>e!==pageHead&&!e.classList.contains('pl-own')&&(shortSafety||!isSafety(e))&&!e.matches('.promise,.needs,.makes,.reference,.safety-short')):[];
(()=>{
  const time=eyebrow?clean(eyebrow.textContent.replace(/^[^·\/]*[·\/]/,'')).toLowerCase():'';  // "Chapter 3 · About 2–3 hours"
  // Text nodes joined with spaces, so "<b>Your project</b><br>Project 6" reads "Your project Project 6".
  const words=e=>{const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),out=[];while(w.nextNode())out.push(w.currentNode.nodeValue);return out.join(' ');};
  const text=preSteps().filter(e=>e!==pageHead&&!e.classList.contains('reference')).map(words).join(' ');
  const proj=/\bproject (\d+)\b/i.exec(text),os=/\bOS (\d+\.\d+(?:\.\d+)?)( or newer| or later)?/.exec(text);
  // The OS chip turns to caution, with the way to update, when the OS chosen in Settings is older than the chapter's.
  const need=os?parseFloat(os[1]):0,old=Boolean(need&&fwNum&&fwNum<need);
  const osText=os?'OS '+esc(os[1])+(os[2]?'+':''):'';
  // "About 2–3 hours" in the eyebrow is "2–3 h" on its chip (plan 5.2).
  const short=time.replace(/^about\s+/,'').replace(/\s*hours?$/,' h').replace(/\s*minutes?$/,' min');
  chips.innerHTML=[short?esc(short):'',proj?'Project '+proj[1]:'',
    os&&!old?osText:'',
    info&&info.formerly&&returning?'Formerly '+esc(info.formerly):''].filter(Boolean).map(t=>`<li>${t}</li>`).join('')+
    (old?`<li class="warn">${icon('warning')}<span>Needs ${osText} · <a href="./setup.html#s-update-open-utility">Update first</a></span></li>`:'');
  const intro=pageHead&&pageHead.nextElementSibling&&pageHead.nextElementSibling.tagName==='P'?pageHead.nextElementSibling:pageHead;
  if(intro)intro.after(chips);else main.prepend(chips);
  const dangers=preSteps().filter(isSafety),hard=steps.filter(li=>/^(delete|overwrite|erase-scene)$/.test(li.dataset.risk||'')).length;
  if(dangers.length){
    safety.innerHTML=`<summary>${icon('warning')}<span>${hard?esc(plural(hard,'action','actions'))+' here can’t be undone':'Safety: read this first'}</span></summary><div class="inside"></div>`;
    // The page's short list (ul.safety-short, plan 5.2: a few lines), with the notices in full under "About this
    // chapter in full"; without one, the notices themselves.
    const box=safety.lastElementChild;
    if(shortSafety){const l=copy(shortSafety);l.insertAdjacentHTML('beforeend','<li class="safety-more">In full below, and in <a href="./safety.html">Safety and erasing</a>.</li>');box.append(l);}
    else{dangers.forEach(d=>box.append(copy(d)));box.insertAdjacentHTML('beforeend','<p class="meta"><a href="./safety.html">Safety and erasing</a> lists every action that erases something.</p>');}
    // Above "Before you start" (decision 24), so on the smallest phone the warnings, not the list, are on the first screen.
    const needs=main.querySelector(':scope > .needs');
    (shortSafety&&needs?needs:dangers[0]).before(safety);
  }
  partsBox.innerHTML='<h2 id="player-parts-title">Parts</h2><ol class="pp-list"></ol>';
  (progress&&progress.parentElement===main?progress:wrap).before(partsBox);
  // Below the parts (plan 5.2): the reference cards, then the preamble in full.
  if(references.length){
    refBox.innerHTML=`<summary>${icon('list')}<span>Reference for this chapter</span></summary><div class="inside"></div>`;
    references.forEach(r=>{const c=copy(r);c.classList.remove('card','reference','reentry');c.classList.add('ref-part');refBox.lastElementChild.append(c);});
    partsBox.after(refBox);
  }
  if(longPre.length){
    moreBox.innerHTML=`<summary>${icon('info')}<span>About this chapter in full</span></summary><div class="inside"></div>`;
    longPre.forEach(e=>{const c=copy(e);c.classList.remove('card');moreBox.lastElementChild.append(c);});
    (references.length?refBox:partsBox).after(moreBox);
  }
})();
// Player / All steps switch: at the top of the list (list mode), in the menu and in the chapter actions.
const modesHTML='<button type="button" data-mode="player" aria-pressed="false">Step by step</button><button type="button" data-mode="all" aria-pressed="false">All steps</button>';
const pressModes=box=>box.querySelectorAll('.player-modes [data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===(view==='list'?'all':'player'))));
const listModes=el('div','player-modes pl-own',modesHTML);
listModes.setAttribute('role','group');listModes.setAttribute('aria-label','Show the steps');listModes.hidden=true;
wrap.before(listModes);
// All steps (plan 5.10): where you are, in the first screen, with the way there ("You're on Part 3, step 31 of 61").
const listBanner=el('p','list-resume pl-own');listBanner.hidden=true;
(pageHead||h1||wrap).after(listBanner);
listBanner.addEventListener('click',e=>{if(!e.target.closest('[data-resume]'))return;const id=C.resumeId();if(id){setUrl('#s-'+id);C.go(id);}});
// Above the step card: the way back to the step to continue at, and "Get back in" after a break.
const pill=el('button','back-pill pl-own');pill.type='button';pill.hidden=true;
// It shows perform's "How every section starts" (.reentry) and the scene and sample numbers on your notes (chapter.js).
const getback=el('section','getback pl-own');getback.hidden=true;getback.setAttribute('aria-labelledby','getback-title');
getback.innerHTML='<h2 id="getback-title">Get back in</h2><p class="meta">It has been a while since your last tick. Before you go on:</p><div class="getback-body"></div><div class="getback-notes"></div><p><button class="btn" type="button" data-getback>Got it</button></p>';
if(reentry){const c=copy(reentry);c.querySelectorAll('h2').forEach(h=>h.remove());getback.querySelector('.getback-body').append(...c.childNodes);}
getback.querySelector('[data-getback]').addEventListener('click',()=>{getback.hidden=true;if(cur)focusStep(cur);});
const notesHTML=()=>window.CoachNotes?CoachNotes.html():'';
wrap.before(pill,getback);
pill.addEventListener('click',()=>{const li=byId.get(C.current());if(li)showStep(li);});
// Checkpoint card and chapter-complete card.
const checkCard=el('section','player-card player-check pl-own'),doneCard=el('section','player-card player-done pl-own');
checkCard.id='player-check';doneCard.id='player-done';
[checkCard,doneCard].forEach(c=>{c.hidden=true;c.tabIndex=-1;});
checkCard.setAttribute('aria-labelledby','player-check-title');doneCard.setAttribute('aria-labelledby','player-done-title');
wrap.after(checkCard,doneCard);
// Action bar, after <main> in reading order: Back, Tools, the one primary.
const actions=el('div','player-actions pl-own',
  // "More below" is for pointers: it hides itself as the page scrolls, and Tab already scrolls, so it is not a Tab stop.
  `<button class="pa-more" type="button" tabindex="-1" hidden>${downIcon}<span>More below</span></button>`+
  `<div class="pa-row"><button class="pa-btn" id="player-back" type="button" aria-keyshortcuts="ArrowLeft">${icon('back')}<span>Back</span></button>`+
  `<button class="pa-btn" id="player-tools-btn" type="button" aria-haspopup="dialog" aria-keyshortcuts="T">${icon('grid')}<span>Tools</span></button>`+
  `<button class="btn primary pa-main" id="player-next" type="button"><span class="pa-label">Done · Next</span>${icon('next')}</button>`+
  `<a class="btn primary pa-main" id="player-go" href="./index.html" hidden><span class="pa-label"></span>${icon('next')}</a></div>`+
  '<p class="pa-hint" aria-hidden="true"><kbd class="key">→</kbd> or <kbd class="key">Enter</kbd> Done · Next · <kbd class="key">←</kbd> Back · <kbd class="key">T</kbd> Tools</p>');
actions.id='player-actions';actions.hidden=true;
actions.setAttribute('role','group');actions.setAttribute('aria-label','Step controls');
main.after(actions);
const backBtn=actions.querySelector('#player-back'),toolsBtn=actions.querySelector('#player-tools-btn'),nextBtn=actions.querySelector('#player-next'),goLink=actions.querySelector('#player-go'),more=actions.querySelector('.pa-more');
toolsBtn.addEventListener('click',()=>{if(window.CoachTools)CoachTools.open(toolsBtn);else loadTools(()=>{if(window.CoachTools)CoachTools.open(toolsBtn);});});
// The Tools sheet and the keys panel (toolsheet.js) load once the page is idle (decision 19), or at once when Tools is
// pressed first. Same release as this page: the address carries its version, like the page's own scripts.
let toolsWaiting=[];
function loadTools(then){
  if(window.CoachTools){if(then)then();return;}
  if(then)toolsWaiting.push(then);
  if(document.querySelector('script[data-coach-tools]'))return;
  const s=document.createElement('script');s.dataset.coachTools='';
  s.src='toolsheet.js'+(site&&site.version?'?v='+encodeURIComponent(site.version):'');
  s.onload=()=>{const w=toolsWaiting;toolsWaiting=[];w.forEach(f=>f());};
  document.head.append(s);
}
if(Shell){const later=()=>(window.requestIdleCallback||(f=>setTimeout(f,200)))(()=>loadTools(),{timeout:2000});if(document.readyState==='complete')later();else addEventListener('load',later,{once:true});}
if(Shell)Shell.addShortcut('t','Tools, in a chapter',()=>toolsBtn.click());
// "This step doesn't match my K.O. II": one link, moved to the end of the step on screen and filled in for it
// (the fields of .github/ISSUE_TEMPLATE/wrong-instruction.yml).
const reportEl=el('p','step-report pl-own',`<a id="player-report" href="#" target="_blank" rel="noopener noreferrer">This step doesn’t match my K.O. II<span class="sr"> (opens in a new tab)</span></a>`);
reportEl.hidden=true;
function reportUrl(li){
  const P=partOf(li),title=li.querySelector(':scope > .step-title'),src=li.querySelector(':scope > .step-source a, :scope > .step-do a[href*="/guides/"]');
  const said=['.preflight','.step-do','.step-undo','.step-check'].map(q=>[...li.querySelectorAll(':scope > '+q)]).flat().map(e=>clean(e.textContent)).join(' ')||gist(li);
  const q={title:'[Wrong instruction] Chapter '+chNum+' · '+chName+', '+where(li).toLowerCase(),page:'Chapter '+chNum+' · '+chName,
    step:where(li)+' / '+(title?gist(li):'Part '+P.n+' · '+P.title)+' ['+li.dataset.step+']','app-says':said.slice(0,1500),
    firmware:{'2.5':'2.5.x','2':'2.0.x',older:'older than 2.0',unknown:'not sure'}[fw]||'',guide:src?src.href:''};
  return ((site&&site.report)||'https://github.com/efosamark/koii-coach/issues/new?template=wrong-instruction.yml')+Object.entries(q).filter(([,v])=>v).map(([k,v])=>'&'+k+'='+encodeURIComponent(v)).join('');
}
// The chapter actions: ⋮ in the app bar opens a sheet with the switch, About, Print, Report this step, Restart.
const moreBtn=el('button','icon-btn chapter-actions-btn pl-own',icon('more'));
moreBtn.type='button';moreBtn.id='chapter-actions-btn';
moreBtn.setAttribute('aria-label','Chapter actions');moreBtn.setAttribute('aria-haspopup','dialog');moreBtn.setAttribute('aria-controls','chapter-actions');moreBtn.setAttribute('aria-expanded','false');
const barActions=document.getElementById('appbar-actions');
const actSheet=el('dialog','sheet actions-sheet pl-own',
  `<div class="sheet-box"><div class="sheet-head"><h2 class="sheet-title" id="chapter-actions-title">${esc(chNum?chNum+' · ':'')}${esc(chName)}</h2>`+
  `<button class="icon-btn" type="button" data-close aria-label="Close">${icon('close')}</button></div><div class="sheet-body"></div></div>`);
actSheet.id='chapter-actions';actSheet.setAttribute('aria-labelledby','chapter-actions-title');
let actModal=null;
if(Shell&&barActions){
  barActions.append(moreBtn);document.body.append(actSheet);
  actModal=Shell.modal(actSheet,moreBtn,()=>{
    actSheet.querySelector('.sheet-body').innerHTML=`<div class="player-modes" role="group" aria-label="Show the steps">${modesHTML}</div>`+
      `<ul class="ps-links"><li><a href="#start">${icon('info')}About this chapter</a></li>`+
      `<li><button type="button" data-act="print">${icon('print')}Print all steps</button></li>`+
      (view==='step'&&cur?`<li><a href="${esc(reportUrl(cur))}" target="_blank" rel="noopener noreferrer">${icon('external')}Report this step<span class="sr"> (opens in a new tab)</span></a></li>`:'')+
      `</ul><p><button class="btn danger" type="button" data-act="restart">${icon('undo')}Restart this chapter</button></p>`;
    pressModes(actSheet);
  });
  moreBtn.addEventListener('click',()=>actModal.open());
}

// "Back up now" on the chapter-complete screen (plan 5.9): Chapter 0's backup part in a sheet, read-only, from the
// saved copy of setup.html when offline. The link beside the button goes to the chapter itself.
const backupSheet=el('dialog','sheet backup-sheet pl-own',
  `<div class="sheet-box"><div class="sheet-head"><h2 class="sheet-title" id="player-backup-title">Back up your work</h2>`+
  `<button class="icon-btn" type="button" data-close aria-label="Close">${icon('close')}</button></div><div class="sheet-body"><p class="meta">Loading the backup steps…</p></div></div>`);
backupSheet.id='player-backup';backupSheet.setAttribute('aria-labelledby','player-backup-title');
let backupModal=null,backupOpener=null;
if(Shell&&slug!=='setup'){
  document.body.append(backupSheet);
  backupModal=Shell.modal(backupSheet,null,()=>{
    const body=backupSheet.querySelector('.sheet-body');
    fetch('./setup.html').then(r=>{if(!r.ok)throw new Error(r.status);return r.text();}).then(t=>{
      const doc=new DOMParser().parseFromString(t,'text/html'),first=doc.querySelector('li[data-step="backup-open-tool"]'),P=first&&first.closest('details');
      if(!P)throw new Error('no backup part');
      const h=P.querySelector('summary'),list=P.querySelector('ol');
      list.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
      list.querySelectorAll('.check,.step-extras,.step-report').forEach(x=>x.remove());
      list.querySelectorAll('li[data-step]').forEach(li=>{const t=li.querySelector(':scope > .step-title');if(t){const a=document.createElement('a');a.href='./setup.html#s-'+li.dataset.step;a.innerHTML=t.innerHTML;t.replaceChildren(a);}});
      body.innerHTML=`<p class="sub">From Chapter 0 · ${esc(clean(h?h.textContent:'Back up'))}</p><ol class="steps backup-steps">${list.innerHTML}</ol>`+
        `<p><a class="btn" href="./setup.html#s-backup-open-tool">Open it in Chapter 0${icon('next')}</a></p><p class="meta">Nothing here is ticked: your place in this chapter stays where it is.</p>`;
    }).catch(()=>{body.innerHTML=`<p>The backup steps could not be loaded. They are in <a href="./setup.html#s-backup-open-tool">Chapter 0 · Set up your K.O. II, Part 4</a>.</p>`;});
  });
  backupSheet.addEventListener('close',()=>{if(backupOpener&&backupOpener.isConnected)backupOpener.focus();});
}

// ---------- State and rendering ----------
let view='',cur=null,part=null,confirmed=null,printing=false,fixOpen=false;
function setHidden(want){
  managed.forEach(e=>{if(!want.has(e)){e.hidden=false;managed.delete(e);}});
  want.forEach(e=>{if(!managed.has(e)&&!e.hidden){e.hidden=true;managed.add(e);}});
}
const isGated=()=>view==='step'&&cur&&gates.has(cur)&&confirmed!==cur;
const tally=list=>{const live=list.filter(li=>!isSkipped(li)),c=live.filter(isDone).length;return{c,n:live.length,text:c?c+' of '+live.length+' done':plural(live.length,'step','steps')};};
const wideStart=matchMedia('(min-width:1360px)');
function render(){
  const v=printing?'list':view;
  if(v==='list'||!v)delete root.dataset.player;else root.dataset.player=v;
  const want=new Set(),k=kids();
  if(v==='start'){
    want.add(wrap);if(progress)want.add(progress);
    if(safety.childElementCount)preSteps().filter(isSafety).forEach(e=>want.add(e));   // the summary holds copies
    longPre.forEach(e=>want.add(e));   // so does "About this chapter in full"
    if(references.length)references.forEach(e=>want.add(e));   // so does "Reference for this chapter"
  }else if(v==='step'&&cur){
    const P=partOf(cur);
    k.forEach(e=>{if(e!==wrap&&e!==note)want.add(e);});
    if(foot)want.add(foot);
    parts.forEach(p=>{if(p!==P)want.add(p.el);});
    [...wrap.children].forEach(e=>{if(!e.contains(cur))want.add(e);});   // anything else in the steps section too
    [...P.el.children].forEach(e=>{if(e.tagName!=='OL'&&e!==about)want.add(e);});
    [...P.el.querySelectorAll(':scope > ol')].forEach(ol=>{if(!ol.contains(cur))want.add(ol);});
    P.steps.forEach(li=>{if(li!==cur)want.add(li);});
    if(isGated())[...cur.children].forEach(e=>{if(!e.matches('.step-head,.step-title,.preflight,.step-consequence,.gate,.check,.here-tag'))want.add(e);});
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
  chips.hidden=partsBox.hidden=v!=='start';
  safety.hidden=v!=='start'||!safety.childElementCount;
  refBox.hidden=v!=='start'||!references.length;
  moreBox.hidden=v!=='start'||!longPre.length;
  about.hidden=!(v==='step'&&about.querySelector('.inside').childElementCount);
  checkCard.hidden=v!=='check';doneCard.hidden=v!=='done';
  listModes.hidden=v!=='list';
  const here=v==='list'&&!printing&&C.hasProgress()&&C.count()<C.total()&&byId.get(C.resumeId());
  listBanner.hidden=!here;
  if(here)listBanner.innerHTML=`<span>You’re on Part ${partOf(here).n}, step ${inPart(here)[0]} of ${inPart(here)[1]}</span><button class="btn" type="button" data-resume>Continue${icon('next')}</button>`;
  pressModes(main);
  actions.hidden=v==='list'||!v;
  if(v!=='step')getback.hidden=true;
  reportEl.hidden=!(v==='step'&&cur);
  if(v==='step'&&cur){reportEl.querySelector('a').href=reportUrl(cur);if(reportEl.parentElement!==cur)cur.append(reportEl);}
  // Desktop start screen: the parts list is a second column beside everything above it (coach.css).
  if(v==='start')main.style.setProperty('--start-rows',String(kids().concat([chips,safety,refBox]).filter(e=>!e.hidden&&e!==partsBox).length||1));
  paint();
  document.dispatchEvent(new CustomEvent('coach:view',{detail:{view:v||'list',step:v==='step'&&cur?cur.dataset.step:null}}));
}
// What follows the ticks: the app bar's title and meter, the main button, the pill, the tags, the skip boxes, the menu.
function paint(){
  const total=C.total(),count=C.count();
  const P=view==='check'?part:cur&&partOf(cur);
  if(Shell){
    Shell.setMeter(total?count/total:0);
    if((view==='step'||view==='check')&&P){
      const [k,n]=cur?inPart(cur):[0,0];
      Shell.setTitle((chNum?chNum+' · ':'')+chName,'','Part '+P.n+' · '+P.title+' · '+(view==='check'?'Checkpoint':'Step '+k+' of '+n));
    }else Shell.setTitle(chName,chNum?'Chapter '+chNum:'');
  }
  backBtn.hidden=view==='start';
  toolsBtn.hidden=view==='start'||!Shell;
  actions.querySelector('.pa-hint').hidden=!(view==='step'||view==='check');
  let label='',go='';
  nextBtn.removeAttribute('aria-disabled');
  if(view==='start'){const r=C.hasProgress()&&C.resumeId();label=r?'Continue at '+where(byId.get(r)):'Start Part 1';}
  else if(view==='step'&&cur){
    if(isGated()){label='Confirm first';nextBtn.setAttribute('aria-disabled','true');}
    else{const P=partOf(cur),last=P.steps[P.steps.length-1]===cur;label=isDone(cur)?'Next':last&&P.checkpoint?'Done · Checkpoint':'Done · Next';}
  }else if(view==='check'&&part){
    const np=parts[part.i+1];
    label=(part.checkpoint?'Yes · ':'')+(np?'Part '+np.n+': '+np.title:'Finish the chapter');
  }else if(view==='done')go=nextLink?'Next: '+nextName:'Back to the course';
  nextBtn.hidden=Boolean(go)||view==='list';goLink.hidden=!go;
  nextBtn.querySelector('.pa-label').textContent=label;
  if(view==='step'||view==='check')nextBtn.setAttribute('aria-keyshortcuts','ArrowRight Enter');else nextBtn.removeAttribute('aria-keyshortcuts');
  if(go){goLink.querySelector('.pa-label').textContent=go;goLink.href=nextLink?nextLink.getAttribute('href'):'./index.html';}
  // "Back to step N": a step opened from the menu, a link or search while the step to continue at is another one.
  const home=view==='step'&&cur&&C.hasProgress()&&byId.get(C.current());
  pill.hidden=!(home&&home!==cur);
  if(!pill.hidden)pill.innerHTML=`${icon('back')}<span>Back to ${partOf(home)===partOf(cur)?'step '+inPart(home)[0]:where(home)}<span class="sr">, where you continue</span></span>`;
  heads.forEach((h,li)=>{const t=h.querySelector('.skipped-tag');t.hidden=!isSkipped(li);h.classList.toggle('bare',!h.querySelector('.tag:not([hidden])'));});
  groups.forEach((run,li)=>{const b=li.querySelector(':scope > .skip-box');if(b)b.hidden=!(view==='step'&&li===cur)||run.every(settled);});
  if(Shell)Shell.refreshChapter();
  cue();
}
// "More below": the step card runs on under the action bar. On a risk step whose undo or Check is hidden there, it
// says so (plan 5.4): "Undo and Check below".
function cue(){
  let on=view==='step'&&cur&&!actions.hidden,risky=false;
  if(on){const row=actions.querySelector('.pa-row').getBoundingClientRect(),limit=Math.min(row.top,innerHeight)+8,end=cur.getBoundingClientRect().bottom;on=end>limit;
    const after=cur.dataset.risk&&[...cur.querySelectorAll(':scope > .step-undo,:scope > .step-noundo,:scope > .step-check')].filter(e=>e.offsetParent);
    risky=Boolean(on&&after&&after.length&&after[after.length-1].getBoundingClientRect().bottom>limit);}
  more.hidden=!on;
  more.lastChild.textContent=risky?(cur.querySelector(':scope > .step-noundo')?'No undo and Check below':'Undo and Check below'):'More below';
}
let cueFrame=0;
const cueSoon=()=>{if(!cueFrame)cueFrame=requestAnimationFrame(()=>{cueFrame=0;cue();});};
addEventListener('scroll',cueSoon,{passive:true});addEventListener('resize',cueSoon);
more.addEventListener('click',()=>scrollBy({top:Math.round(innerHeight*.6),behavior:reduced()?'auto':'smooth'}));
if(wideStart.addEventListener)wideStart.addEventListener('change',()=>{if(view==='start')render();});

function setUrl(hash){
  try{history.replaceState(history.state,'',location.pathname+location.search+(hash||''));}catch(e){}
}
function manual(on){try{history.scrollRestoration=on?'manual':'auto';}catch(e){}}
// Focus goes to the step's title when it has one (it reads "Step 2 of 5: …"), else to the step itself.
function focusStep(li){
  const t=li.querySelector(':scope > .step-title')||li;
  t.tabIndex=-1;t.focus({preventScroll:true});
}

// ---------- Views ----------
function showStep(li,opt){
  opt=opt||{};
  if(li!==cur)confirmed=null;
  const P=partOf(li),moved=view==='step'&&cur&&cur!==li;
  if(moved)getback.hidden=true;
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
  const [k,n]=inPart(li);
  document.title=(li.querySelector(':scope > .step-title')?gist(li)+' · ':'')+'Step '+k+' of '+n+' / Part '+P.n+' · '+P.title+' / '+baseTitle;
  if(moved&&!reduced()){li.classList.remove('pl-in');void li.offsetWidth;li.classList.add('pl-in');}
  scrollTo(0,0);
  if(opt.focus!==false)focusStep(li);
  cue();
}
function showStart(){
  view='start';cur=null;manual(false);
  partsBox.querySelector('.pp-list').innerHTML=parts.map(p=>{
    const t=tally(p.steps),first=p.steps.find(li=>!settled(li))||p.steps[0];
    return `<li><a href="#s-${esc(first.dataset.step)}"><span class="pp-n">${p.n}</span><span class="pp-t">${esc(p.title)}</span><span class="tally${t.c&&t.c===t.n?' all':''}">${esc(t.text)}</span></a></li>`;
  }).join('');
  if(safety.childElementCount)safety.open=!C.hasProgress();
  render();
  document.title=baseTitle;
}
// A row of LEDs, lit for what is done (the chapter's parts on a checkpoint, all 16 when the chapter is complete).
const leds=(list,lit)=>`<span class="led-row" aria-hidden="true">${list.map((x,i)=>`<span class="led${lit(x)?' on':''}" style="--i:${i}"></span>`).join('')}</span>`;
function showCheck(P,opt){
  view='check';part=P;cur=P.steps[P.steps.length-1];fixOpen=false;manual(true);
  const np=parts[P.i+1],full=p=>p.steps.every(settled),doneParts=parts.filter(full).length;
  checkCard.innerHTML=`<h2 class="pl-eyebrow" id="player-check-title">Part ${P.n} done${P.checkpoint?' · Checkpoint':''}</h2>`+
    `<p class="pc-leds">${leds(parts,full)}<span class="meta">${doneParts} of ${plural(parts.length,'part','parts')} done</span></p>`+
    (P.checkpoint?'<div class="pc-q"></div>':`<p class="pc-q">You have reached the end of Part ${P.n}: ${esc(P.title)}.</p>`)+
    (np?`<p class="meta">Next: Part ${np.n} · ${esc(np.title)}</p>`:'<p class="meta">This was the last part of the chapter.</p>')+
    (P.checkpoint?'<div class="row"><button class="btn lg pc-not" type="button" aria-expanded="false">Not quite</button></div>':'')+
    `<div class="pc-fix" hidden><div class="pc-fix-text"></div><p><button class="btn" type="button" data-redo>${icon('back')}Redo Part ${P.n} from its first step</button></p></div>`;
  if(P.checkpoint){const q=copy(P.checkpoint);q.className='';checkCard.querySelector('.pc-q').append(...q.childNodes);}
  const fix=checkCard.querySelector('.pc-fix');
  if(P.ifnot)fix.querySelector('.pc-fix-text').innerHTML=fixCards(P);
  fix.querySelectorAll('[data-redo-step]').forEach(b=>b.addEventListener('click',()=>{const li=byId.get(b.dataset.redoStep);if(li){C.setCurrent(li.dataset.step);showStep(li);}}));
  const nb=checkCard.querySelector('.pc-not');
  if(nb)nb.addEventListener('click',()=>{fixOpen=!fixOpen;nb.setAttribute('aria-expanded',String(fixOpen));fix.hidden=!fixOpen;if(fixOpen)answer(P,'not-yet');});
  fix.querySelector('[data-redo]').addEventListener('click',()=>{C.setCurrent(P.steps[0].dataset.step);showStep(P.steps[0]);});
  render();
  setUrl('#s-'+cur.dataset.step);
  document.title='Part '+P.n+' done / '+baseTitle;
  scrollTo(0,0);
  if(!opt||opt.focus!==false)checkCard.focus({preventScroll:true});
}
// "Not quite": the part's "If it doesn't" text as one card per symptom (plan 5.9). A sentence ending in "?" starts a
// card ("No bass? Tap B…"), and so does "symptom: fix" ("the bass repeats after one bar: repeat…"); the sentences
// after it are its fix. A fix that links to a step of this chapter gets a "Redo step N" button. Text without a
// symptom stays one card.
function fixCards(P){
  const c=copy(P.ifnot),b=c.querySelector('b');
  if(b&&/^If it doesn['’]t/i.test(b.textContent))b.remove();
  const plain=h=>h.replace(/<[^>]+>/g,'').trim(),cap=h=>h.replace(/^([^<]*?)([a-z])/,(m,a,l)=>a+l.toUpperCase());
  const parts=c.innerHTML.trim().replace(/K\.O\. /g,'K.O.\u00a0').replace(/([.?!])\s+(?=[A-Z0-9<“"])/g,'$1\u0000').split('\u0000').map(s=>s.trim()).filter(Boolean);
  // With "?" symptoms, a "label: …" sentence starts a card only for a short label ("USB:", "Older OS:"), never an instruction.
  const asks=parts.some(s=>/\?$/.test(plain(s))),cards=[];
  const label=h=>{const w=plain(h).split(/\s+/);return !asks||w.length<=3&&!/^(Try|Press|Hold|Tap|Go|Use|Check|Repeat|Select|Set|Turn|Open|Stop|Then)$/.test(w[0]);};
  parts.forEach(s=>{
    const last=cards[cards.length-1],k=s.indexOf(': ');
    if(/\?$/.test(plain(s)))cards.push({sym:s,fix:[]});
    else if(k>0&&(!last||last.fix.length)&&!/<kbd/.test(s.slice(0,k))&&plain(s.slice(0,k)).length<plain(s).length*0.7&&label(s.slice(0,k)))cards.push({sym:s.slice(0,k),fix:[s.slice(k+2)]});
    else if(last)last.fix.push(s);
    else cards.push({sym:'',fix:[s]});
  });
  return cards.map(x=>{
    const fix=x.fix.join(' '),m=/href="#s-([^"]+)"/.exec(fix),li=m&&byId.get(m[1]);
    let redo='';
    if(li){const [k]=inPart(li),Q=partOf(li);redo=`<p><button class="btn" type="button" data-redo-step="${esc(li.dataset.step)}">${icon('back')}Redo ${Q===P?'':'Part '+Q.n+', '}step ${k}</button></p>`;}
    return`<div class="fix-card">${x.sym?`<p class="fix-sym">${cap(x.sym)}</p>`:''}${fix?`<p>${cap(fix)}</p>`:''}${redo}</div>`;
  }).join('');
}
// "You made: …" from the page's "You will make" line.
function made(){
  const c=copy(makes),b=c.querySelector('b');
  if(b)b.textContent=/have/i.test(b.textContent)?'You now have:':'You made:';
  return c.innerHTML;
}
function showDone(opt){
  // Arriving here ticks the recap, but only once every other step that counts is done (plan 5.9).
  const recaps=steps.filter(li=>li.dataset.kind==='recap');
  if(recaps.some(li=>!isDone(li))&&steps.every(li=>recaps.includes(li)||settled(li)))recaps.forEach(li=>C.setDone(li.dataset.step,true));
  view='done';cur=null;manual(true);
  const open=steps.filter(li=>!settled(li)),complete=!open.length,skipped=steps.filter(isSkipped).length;
  const moves=recaps.map(li=>li.querySelector(':scope > .step-moves')).filter(Boolean),kept=window.CoachNotes&&CoachNotes.chapter?CoachNotes.chapter():[];
  // Every chapter done: the course-complete list (plan 5.9), what each one made.
  const course=complete&&window.CoachProgress?CoachProgress.chapters():[],all=course.length&&course.every(p=>p.done||p.c.slug===slug);
  const head=complete?'Chapter '+esc(chNum)+' done':'Chapter '+esc(chNum)+' · '+esc(plural(open.length,'step','steps'))+' not ticked yet';
  doneCard.innerHTML=`<p class="pl-eyebrow">Chapter ${esc(chNum)} · ${esc(chName)}</p><h2 class="pd-title" id="player-done-title" tabindex="-1">${head}</h2>`+
    (complete?`<p class="pd-leds">${leds(Array.from({length:16}),()=>true)}</p>`+(makes?`<p class="pd-made">${made()}</p>`:'')+
      `<p>All ${C.total()} steps are ticked${skipped?` (${plural(skipped,'optional step','optional steps')} skipped)`:''}.</p>`+
      (kept.length?`<h3 class="pd-moves-title">${kept.some(k=>k[2]==='scene')?'Scene numbers to keep':'Numbers to keep'}</h3><p class="pd-notes">`+
        kept.map(([n,v])=>`<span class="note-pair">${esc(n)} <samp class="lcd">${v?esc(v):'–'}</samp></span>`).join(' ')+'</p>'+
        (kept.some(k=>!k[1])?'<p class="meta">– is a number you did not note here: take it from your paper.</p>':''):'')+
      (moves.length?'<h3 class="pd-moves-title">New moves</h3>'+moves.map(m=>{const c=copy(m);c.classList.add('pd-moves');return c.outerHTML;}).join(''):'')
    :`<p>Tick them, or skip the optional ones, and this chapter is done:</p><ul class="pd-open">`+
      open.slice(0,8).map(li=>`<li><a href="#s-${esc(li.dataset.step)}"><span class="pd-n">${inPart(li)[0]}</span><span class="pd-t">${esc(gist(li))} <span class="meta">Part ${partOf(li).n}</span></span></a></li>`).join('')+'</ul>'+
      (open.length>8?`<p><a href="#all">${esc(plural(open.length-8,'more step','more steps'))}: see All steps</a></p>`:''))+
    (all?`<section class="pd-course"><h3>Course complete</h3><p>All ${course.length} chapters are done. What you made:</p><ul class="made-list">`+
      course.map(p=>`<li><span class="num">${esc(p.c.num)}</span> <a href="${esc(p.c.href)}">${esc(p.c.title)}</a>${p.c.made?`<span class="sub meta">${esc(p.c.made.charAt(0).toUpperCase()+p.c.made.slice(1))}.</span>`:''}</li>`).join('')+
      `</ul><p><a href="./cheat-sheet.html">The cheat sheet</a> keeps every move and reference table in one place.</p></section>`:'')+
    (slug!=='setup'&&complete?`<div class="notice tip pd-backup"><p><b>Back up now.</b> Save a copy of your work with the official EP sample tool, as in <a href="./setup.html#s-backup-open-tool">Chapter 0 · Set up your K.O. II, Part 4</a>.</p>`+
      (backupModal?`<p><button class="btn" type="button" data-backup aria-haspopup="dialog" aria-controls="player-backup">${icon('list')}Show the backup steps</button></p>`:'')+'</div>':'')+
    `<div class="row pd-actions">${complete?`<a class="btn" href="#all" data-review>${icon('list')}Review steps</a>`:''}${nextLink?'<a class="btn" href="./index.html">Back to the course</a>':''}`+
    (complete?`<button class="btn ghost" type="button" data-act="restart">${icon('undo')}Restart this chapter</button>`:'')+'</div>';
  render();
  setUrl('#done');
  document.title=(complete?'Chapter '+chNum+' done':plural(open.length,'step','steps')+' not ticked yet')+' / '+baseTitle;
  scrollTo(0,0);
  if(!opt||opt.focus!==false){const h=doneCard.querySelector('h2');if(h)h.focus({preventScroll:true});}
}
let listed=false;
function showList(){
  view='list';cur=null;manual(false);
  // The first time: finished parts fold away, the part with the step to continue at opens.
  if(!listed){
    listed=true;
    const here=byId.get(C.resumeId());
    parts.forEach(p=>{if(here&&p.steps.includes(here))p.el.open=true;else if(p.steps.every(settled))p.el.open=false;});
  }
  render();
  document.title=baseTitle;
}

// ---------- Moving ----------
function next(){
  if(view==='start'){const r=C.hasProgress()&&C.resumeId();showStep(r?byId.get(r):steps[0]);return;}
  if(view==='check'){if(part.checkpoint)answer(part,'yes');const np=parts[part.i+1];if(np)showStep(np.steps[0]);else showDone();return;}
  if(view!=='step'||!cur)return;
  if(isGated()){const g=gates.get(cur);g.box.scrollIntoView({block:'center'});g.btn.focus({preventScroll:true});return;}
  if(!isDone(cur))C.setDone(cur.dataset.step,true);
  if(window.CoachWake)CoachWake.poke();
  advance(cur);
}
// After a step: the next one in its part, else the part's checkpoint.
function advance(li){
  const P=partOf(li),k=P.steps.indexOf(li);
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
// Skip a run of optional steps: they stop counting, the player moves past them, and the toast can undo it.
function skipRun(run){
  const ids=run.map(li=>li.dataset.step);
  C.setSkipped(ids,true);
  advance(run[run.length-1]);
  C.say(run.length===1?'Step skipped. It no longer counts towards this chapter.':run.length+' steps skipped. They no longer count towards this chapter.',()=>{
    C.setSkipped(ids,false);C.setCurrent(ids[0]);showStep(run[0]);
  });
}
nextBtn.addEventListener('click',next);
backBtn.addEventListener('click',back);
// The card is focused on every step change; its ring shows only for people using the keyboard (.pl-kbd on <html>).
document.addEventListener('keydown',e=>{if(!e.ctrlKey&&!e.metaKey)root.classList.add('pl-kbd');},true);
document.addEventListener('pointerdown',()=>root.classList.remove('pl-kbd'),true);
// Keyboard: → and Enter = the main button, ← = Back, but only when focus is on the page itself, the step card or its
// title, never in a link, button, summary, field or dialog (Enter there keeps its own meaning).
document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.isComposing)return;
  if(!(view==='step'||view==='check')||document.querySelector('dialog[open]'))return;
  const t=e.target,title=cur&&cur.querySelector(':scope > .step-title');
  if(!(t===document.body||t===root||t===main||(view==='step'&&(t===cur||t===title))||(view==='check'&&t===checkCard)))return;
  if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();next();}
  else if(e.key==='ArrowLeft'){e.preventDefault();back();}
});
if(Shell){
  Shell.addShortcut('→','Done · Next in a chapter (Enter too)',null);
  Shell.addShortcut('←','Back in a chapter',null);
}

// ---------- "This chapter": the menu's tab (phones and tablets) and the rail (desktop) ----------
function renderPanel(box,where){
  const total=C.total(),count=C.count(),here=view==='step'?cur:null,resume=C.hasProgress()?byId.get(C.current()):null;
  const P=view==='check'?part:cur?partOf(cur):resume?partOf(resume):parts[0];
  box.innerHTML=(where==='rail'?`<p class="nav-label">This chapter</p>`:'')+
    `<div class="ps-progress"><p class="ps-count">${count===total?'All '+total+' steps done':count+' of '+total+' done'}</p><span class="meter" aria-hidden="true"><span class="meter-fill" style="width:${total?Math.round(100*count/total):0}%"></span></span></div>`+
    (where==='sheet'?`<div class="player-modes" role="group" aria-label="Show the steps">${modesHTML}</div>`:'')+
    parts.map(p=>{const t=tally(p.steps);return `<details class="ps-part"${p===P?' open':''}><summary><span class="ps-pn">${p.n}</span><span class="ps-pt">${esc(p.title)}</span><span class="tally${t.c&&t.c===t.n?' all':''}">${esc(t.c+'/'+t.n)}</span></summary><ol class="ps-steps">`+
      p.steps.map(li=>{const d=isDone(li),s=!d&&isSkipped(li),now=li===here,res=li===resume;
        return `<li><button type="button" class="ps-step${d?' done':s?' skipped':''}${res?' resume':''}" data-jump="${esc(li.dataset.step)}"${now?' aria-current="step"':''}><span class="ps-mark" aria-hidden="true"></span><span class="ps-n">${inPart(li)[0]}</span><span class="ps-t">${esc(gist(li))}</span>`+
          `<span class="sr">${d?', done':s?', skipped':''}${now?', on screen':''}${res?', where you continue':''}</span>${res?'<span class="you-here" aria-hidden="true">You are here</span>':''}</button></li>`;}).join('')+'</ol></details>';}).join('')+
    `<ul class="ps-links"><li><a href="#start">${icon('info')}About this chapter</a></li>`+
    (where==='rail'?`<li><button type="button" data-mode="${view==='list'?'player':'all'}">${icon('list')}${view==='list'?'Step by step':'All steps'}</button></li>`:'')+
    `<li><button type="button" data-act="print">${icon('print')}Print all steps</button></li></ul>`+
    (where==='sheet'?`<p><button class="btn danger" type="button" data-act="restart">${icon('undo')}Restart this chapter</button></p>`:'');
  pressModes(box);
}
// Clicks in the menu, the rail, the chapter actions and the complete card: jump, switch mode, print, restart. close(fn)
// closes the sheet the click came from (if any), then runs fn.
function act(e,close){
  const jump=e.target.closest('[data-jump]');
  if(jump){
    const li=byId.get(jump.dataset.jump);
    if(li)close(()=>{if(view==='list'){setUrl('#s-'+li.dataset.step);C.go(li.dataset.step);}else showStep(li);});   // a jump: nothing is ticked and cur stays
    return;
  }
  const m=e.target.closest('[data-mode]');
  if(m){
    if(m.dataset.mode==='all'){setMode('all');const keep=view==='step'?cur:null;close(()=>{showList();setUrl('#all');if(keep)C.go(keep.dataset.step);else scrollTo(0,0);});}
    else{setMode('player');close(()=>openDefault());}
    return;
  }
  const a=e.target.closest('[data-act]');
  if(a){
    const b=document.getElementById(a.dataset.act==='restart'?'reset':'print');
    close(()=>{if(b)b.click();});
  }
}
const now=fn=>fn();
if(Shell){
  const panes=Shell.registerChapter({render:renderPanel});
  panes.sheet.addEventListener('click',e=>act(e,fn=>Shell.close(fn)));
  panes.rail.addEventListener('click',e=>act(e,now));
}
actSheet.addEventListener('click',e=>{if(actModal)act(e,fn=>actModal.close(fn));});
listModes.addEventListener('click',e=>{
  const m=e.target.closest('[data-mode]');if(!m)return;
  if(m.dataset.mode==='all'){setMode('all');pressModes(main);return;}
  setMode('player');
  openDefault();
});
doneCard.addEventListener('click',e=>{
  if(e.target.closest('[data-review]')){e.preventDefault();showList();setUrl('#all');scrollTo(0,0);return;}
  const bk=e.target.closest('[data-backup]');if(bk&&backupModal){backupOpener=bk;backupModal.open();return;}
  act(e,now);
});

// ---------- Routes ----------
let first=true;
function openDefault(welcome){
  if(!C.hasProgress()){showStart();setUrl('');return;}
  if(C.count()>=C.total()){showDone();return;}
  const li=byId.get(C.resumeId())||steps[0];
  showStep(li);
  if(!welcome)return;
  C.say('Welcome back. '+C.count()+' of '+C.total()+' done; you continue at '+where(li)+'.');
  // "Get back in" (perform's "How every section starts", your notes) when the last tick was more than 30 minutes ago.
  const at=Date.parse(C.lastAt()||'');
  const notes=notesHTML();
  if((reentry||notes)&&Number.isFinite(at)&&Date.now()-at>30*60*1000){getback.querySelector('.getback-notes').innerHTML=notes;getback.hidden=false;}
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
    if(target===wrap){   // the chapter's old address (sampling.html#sampling): the same as no hash
      if(mode()==='all'){showList();return true;}
      openDefault(was);return true;
    }
    if(target&&target!==main&&wrap.contains(target)){showList();return false;}   // a part
    if(target&&target!==main&&main.contains(target)&&target.closest('[hidden]')){showList();target.scrollIntoView({block:'start'});return true;}
    if(!was)return true;   // anything else (the skip link, an id that is on screen) keeps the view
  }
  if(mode()==='all'){showList();return false;}
  openDefault(was);
  return true;
}

// Print: always the whole chapter as a list (chapter.js opens every part), never the bars.
addEventListener('beforeprint',()=>{if(view&&view!=='list'){printing=true;render();}});
addEventListener('afterprint',()=>{if(printing){printing=false;render();}});
// A tick in the card or the list, a skip, a reset, a move of cur.
C.onChange(e=>{
  if(e.type==='reset'&&view&&view!=='list'){showStart();setUrl('#start');return;}
  if(view)paint();
});

C.route(routeTo);
if(C.routed&&C.routed())routeTo(location.hash);
window.CoachPlayer={view:()=>view,current:()=>view==='step'?cur:null};
})();
