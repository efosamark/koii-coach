'use strict';
/* The placement helper of Chapter 1 First beat (first-beat.html), on top of chapter.js and player.js. (Its target
   rhythms, figure.pattern, are drawn and played by beat.js, like every chapter's.)
   - the placement helper: on a step with data-place="<pad> <position> <position> …" the player shows one position at a
     time (#placement says "1.2.3 · A1") and "Placed · next position" (#note-next) moves on. Positions in data-placed
     were written in an earlier step and start ticked. It never runs on into the next instrument; the last position
     makes Done · Next pulse once. Where it is, is saved as koii-coach-v2.note (0-15 across the whole recipe), as the
     old app saved it.
   It works in the player only (the "coach:view" event from player.js); All steps and print show the text lists. */
(()=>{
const ROWS=[['Kick','A1',[0,6,8,14]],['Snare','A2',[4,12]],['Hat','A3',[0,2,4,6,8,10,12,14]],['Bass','B1',[0,8]]];
const pos=c=>`1.${Math.floor(c/4)+1}.${c%4+1}`;
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const P=window.CoachProgress;

const stopAll=()=>{if(window.CoachAudio)CoachAudio.stopAll();};

// ---------- Placement helper ----------
const flat=ROWS.flatMap(([,pad,cols])=>cols.map(c=>({pad,c})));   // koii-coach-v2.note indexes this list
const runner=document.createElement('div');
runner.className='runner';runner.id='runner';runner.hidden=true;
runner.innerHTML='<p class="runner-head"><span class="eyebrow">Placement helper</span><span id="placement" aria-live="polite"></span></p>'+
  '<p class="runner-list"></p><div class="row runner-row"><button class="btn ghost" type="button" id="note-prev">'+icon('back')+'Previous</button>'+
  '<button class="btn" type="button" id="note-next">Placed · next position'+icon('next')+'</button></div>';
const live=runner.querySelector('#placement'),list=runner.querySelector('.runner-list'),prevBtn=runner.querySelector('#note-prev'),nextBtn=runner.querySelector('#note-next');
let here=null;   // {li, pad, cols, placed:Set, i}
function notes(li){
  const parts=(li.dataset.place||'').trim().split(/\s+/),pad=parts.shift();
  const cols=parts.map(p=>{const m=/^1\.([1-4])\.([1-4])$/.exec(p);return m?(m[1]-1)*4+(m[2]-1):-1;}).filter(c=>c>=0);
  const placed=new Set((li.dataset.placed||'').trim().split(/\s+/).filter(Boolean).map(p=>cols.find(c=>pos(c)===p)).filter(c=>c!==undefined));
  return{pad,cols,placed};
}
const globalIndex=(pad,c)=>flat.findIndex(n=>n.pad===pad&&n.c===c);
function show(li){
  const n=notes(li);
  if(!n.pad||!n.cols.length){runner.hidden=true;here=null;return;}
  // Start where the saved note is, when it is one of this step's; else at the first position not written yet.
  const saved=P?P.v2().note:0,s=flat[saved];
  let i=s&&s.pad===n.pad?n.cols.indexOf(s.c):-1;
  if(i>=0&&n.placed.has(n.cols[i]))i=-1;   // a position an earlier step placed is not where to start
  if(i<0){i=n.cols.findIndex(c=>!n.placed.has(c));if(i<0)i=0;save(n.pad,n.cols[i]);}
  here={li,...n,i,finished:false};
  // Under the Check: the gate is Do and Check, and the helper and the pattern follow them (plan 5.4 e).
  const after=li.querySelector(':scope > .step-check')||[...li.querySelectorAll(':scope > .step-do')].pop();
  (after||li.firstElementChild).after(runner);
  runner.hidden=false;
  paint();
}
function save(pad,c){const g=globalIndex(pad,c);if(P&&g>=0)P.writeV2({note:g});}
function paint(){
  const {pad,cols,placed,i}=here,last=i===cols.length-1;
  live.textContent=`${pos(cols[i])} · ${pad}`;
  list.innerHTML=cols.map((c,j)=>{
    const done=j<i||placed.has(c)&&j!==i||here.finished;
    return `<span class="runner-pos${j===i&&!here.finished?' now':''}${done?' done':''}"><samp class="lcd">${pos(c)}</samp>${done?'<span class="sr"> placed</span>':j===i?'<span class="sr"> now</span>':''}</span>`;
  }).join(' ');
  prevBtn.disabled=i===0&&!here.finished;
  nextBtn.disabled=here.finished;
  nextBtn.innerHTML=here.finished?'All placed':last?'Placed · last one'+icon('check'):'Placed · next position'+icon('next');
}
nextBtn.addEventListener('click',()=>{
  if(!here||here.finished)return;
  if(window.CoachWake)CoachWake.poke();
  if(here.i<here.cols.length-1){here.i++;save(here.pad,here.cols[here.i]);paint();return;}
  here.finished=true;paint();
  const next=document.getElementById('player-next');
  if(next){next.classList.remove('pulse');void next.offsetWidth;next.classList.add('pulse');next.focus({preventScroll:true});}
});
prevBtn.addEventListener('click',()=>{
  if(!here)return;
  if(here.finished)here.finished=false;else if(here.i>0)here.i--;
  save(here.pad,here.cols[here.i]);paint();
});

// The player tells us what is on screen.
document.addEventListener('coach:view',e=>{
  const d=e.detail||{};
  stopAll();
  const li=d.view==='step'&&d.step?document.querySelector(`.steps li[data-step="${CSS.escape(d.step)}"]`):null;
  if(li&&li.dataset.place){if(!here||here.li!==li)show(li);}
  else{runner.hidden=true;here=null;}
});
addEventListener('beforeprint',stopAll);
window.CoachFirstBeat={};
})();
