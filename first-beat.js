'use strict';
/* The practice helpers of 01 First beat (first-beat.html), on top of chapter.js and player.js:
   - the target rhythm: each figure.pattern[data-rows="N"] gets the first N rows of the recipe (kick, snare, hat, bass)
     drawn as a read-only grid (hidden from screen readers: the figure's text list says the same) and a
     "Hear this recipe" button that plays those rows at 90 BPM (audio.js). Playback stops when the step changes.
   - the placement helper: on a step with data-place="<pad> <position> <position> …" the player shows one position at a
     time (#placement says "1.2.3 · A1") and "Placed · next position" (#note-next) moves on. Positions in data-placed
     were written in an earlier step and start ticked. It never runs on into the next instrument; the last position
     makes Done · Next pulse once. Where it is, is saved as koii-coach-v2.note (0-15 across the whole recipe), as the
     old app saved it.
   It works in the player only (the "coach:view" event from player.js); All steps and print show the text lists. */
(()=>{
const ROWS=[['Kick','A1',[0,6,8,14]],['Snare','A2',[4,12]],['Hat','A3',[0,2,4,6,8,10,12,14]],['Bass','B1',[0,8]]];
const pos=c=>`1.${Math.floor(c/4)+1}.${c%4+1}`;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const P=window.CoachProgress;

// ---------- Target rhythm ----------
const figures=[...document.querySelectorAll('figure.pattern[data-rows]')].map(fig=>{
  const rows=Math.max(1,Math.min(4,parseInt(fig.dataset.rows,10)||1));
  const grid=ROWS.map((r,i)=>Array.from({length:16},(_,c)=>i<rows&&r[2].includes(c)));
  const strip=document.createElement('div');
  strip.className='strip';strip.setAttribute('aria-hidden','true');
  strip.innerHTML='<span></span>'+[1,2,3,4].map(b=>`<span class="strip-beat">Beat ${b}</span>`).join('')+
    ROWS.slice(0,rows).map(([name],i)=>`<span class="strip-name">${name}</span>`+grid[i].map((on,c)=>`<span class="strip-cell${on?' on':''}${c%4===0?' beatstart':''}" data-c="${c}"></span>`).join('')).join('');
  const tools=document.createElement('div');
  tools.className='strip-tools';
  tools.innerHTML=`<button class="btn hear-btn" type="button">${icon('play')}<span>Hear this recipe</span></button><span class="meta strip-status" role="status"></span>`+
    '<p class="meta strip-tip">No sound? Turn your phone volume up. On iPhone, also switch off Silent mode or use headphones. The practice sounds are made by your browser, not your K.O. II’s samples.</p>';
  const cap=fig.querySelector('figcaption');
  if(cap)cap.after(strip);else fig.prepend(strip);
  fig.append(tools);
  const btn=tools.querySelector('.hear-btn'),status=tools.querySelector('.strip-status');
  const cells=[...strip.querySelectorAll('.strip-cell')];
  const play=window.CoachAudio?CoachAudio.player({
    grid:()=>grid,bpm:()=>90,volume:()=>.18,
    onStep:c=>cells.forEach(x=>x.classList.toggle('now',Number(x.dataset.c)===c)),
    onState:(t,on,failed)=>{status.textContent=t==='Stopped'?'':t;btn.innerHTML=icon(on?'stop':'play')+`<span>${on?'Stop':'Hear this recipe'}</span>`;if(failed)say('Audio could not start. The written positions still work.');}
  }):null;
  if(play)btn.addEventListener('click',play.toggle);else btn.hidden=true;
  return{fig,play};
});
const stopAll=()=>{if(window.CoachAudio)CoachAudio.stopAll();};

function say(text){
  if(window.CoachChapter&&CoachChapter.say)CoachChapter.say(text);
}

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
  const after=li.querySelector(':scope > .step-do');
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
window.CoachFirstBeat={figures};
})();
