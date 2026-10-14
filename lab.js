'use strict';
/* The Rhythm lab (lab.html): one bar of four sounds (kick ●, snare ■, hat ▲, bass ◆; a hit shows its glyph in ink,
   coach.css) that plays with the practice sounds of audio.js, the positions to copy to the K.O. II, and three small
   challenges. The grid is saved as koii-coach-v2.lab ([row][columns that are on]), where the old app kept it.
   #beat is a role=grid that always holds all 64 buttons (data-r sound, data-c step, aria-pressed):
   - under 760px wide, tabs pick one sound and its bar shows as 4×4, a row per beat, so the cell in row 2, column 3 is
     1.2.3 as on the display; the other sounds' rows stay in the grid, hidden;
   - wider, the four sounds are rows of 16 steps.
   One button is in the tab order; the arrow keys move between cells (Up and Down move a beat on a phone, a sound when
   wider), Home and End go to the start and end of the row, and Space or Enter toggles. The playhead outlines the whole
   column and the LCD beside Play shows its position. Tempo and volume are −/+ steppers with an LCD value, each a
   role=spinbutton (arrow keys, Page Up and Down; holding −/+ repeats). */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const el=$('#beat');
if(!el||!window.CoachAudio)return;
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const P=window.CoachProgress;
const HITS=[[0,6,8,14],[4,12],[0,2,4,6,8,10,12,14],[0,8]],NAMES=['Kick A1','Snare A2','Hat A3','Bass B1'],GLYPHS=['●','■','▲','◆'];
const SHORT=['Kick','Snare','Hat','Bass'];
const pos=c=>`1.${Math.floor(c/4)+1}.${c%4+1}`,lcd=t=>`<samp class="lcd">${t}</samp>`;
const recipe=()=>HITS.map(row=>Array.from({length:16},(_,i)=>row.includes(i)));
const saved=P&&P.v2().lab;
let grid=saved?saved.map(r=>Array.from({length:16},(_,i)=>r.includes(i))):recipe();
const compact=matchMedia('(max-width:759px)');
let sel=0,focus={r:0,c:0};

// ---------- The grid ----------
const tabs=$('#lab-tabs');
function cell(r,c){
  const on=grid[r][c];
  return `<span role="gridcell"><button type="button" class="${on?'on':''}${c%4===0?' beatstart':''}" data-r="${r}" data-c="${c}" tabindex="-1" `+
    `aria-label="${NAMES[r]}, step ${c+1}, position ${pos(c)}" aria-pressed="${on}"><span class="cell-pos">${compact.matches?pos(c):c%4+1}</span></button></span>`;
}
function render(){
  const small=compact.matches;let h='';
  if(small){
    for(let r=0;r<4;r++){
      h+=`<div class="inst" role="rowgroup" data-r="${r}"${r===sel?'':' hidden'}>`+
        `<div class="beat-row beat-cols" aria-hidden="true"><span></span>${[1,2,3,4].map(k=>`<span>.${k}</span>`).join('')}</div>`+
        [0,1,2,3].map(b=>`<div class="beat-row" role="row"><span class="label" role="rowheader">Beat ${b+1}</span>${[0,1,2,3].map(k=>cell(r,b*4+k)).join('')}</div>`).join('')+'</div>';
    }
  }else{
    h=`<div class="beat-row beat-heads" aria-hidden="true"><span></span>${[1,2,3,4].map(b=>`<span class="beathead">Beat ${b}<small>1.${b}.1–1.${b}.4</small></span>`).join('')}</div>`+
      grid.map((row,r)=>`<div class="beat-row" role="row"><span class="label" role="rowheader"><span class="glyph" aria-hidden="true">${GLYPHS[r]}</span>${NAMES[r]}</span>${row.map((_,c)=>cell(r,c)).join('')}</div>`).join('');
  }
  el.className='beat '+(small?'compact':'wide');
  el.setAttribute('aria-label',small?`${NAMES[sel]}: one bar, a row for each beat`:'One bar: a row for each sound, 16 steps');
  el.innerHTML=h;
  tabs.hidden=!small;
  if(small)focus.r=sel;
  roving();
}
const button=(r,c)=>el.querySelector(`button[data-r="${r}"][data-c="${c}"]`);
function roving(){
  let t=button(focus.r,focus.c);
  if(!t||t.closest('[hidden]')){focus={r:compact.matches?sel:0,c:0};t=button(focus.r,focus.c);}
  $$('#beat button').forEach(b=>{b.tabIndex=b===t?0:-1;});
}
el.addEventListener('click',e=>{
  const b=e.target.closest('button[data-r]');if(!b)return;
  const r=Number(b.dataset.r),c=Number(b.dataset.c);
  grid[r][c]=!grid[r][c];
  b.classList.toggle('on',grid[r][c]);b.setAttribute('aria-pressed',String(grid[r][c]));
  focus={r,c};roving();
  changed();
});
el.addEventListener('keydown',e=>{
  const b=e.target.closest('button[data-r]');if(!b||e.altKey||e.ctrlKey||e.metaKey)return;
  const small=compact.matches;let r=Number(b.dataset.r),c=Number(b.dataset.c);
  switch(e.key){
    case 'ArrowRight':c=Math.min(15,c+1);break;
    case 'ArrowLeft':c=Math.max(0,c-1);break;
    case 'ArrowDown':if(small)c=Math.min(15,c+4);else r=Math.min(3,r+1);break;
    case 'ArrowUp':if(small)c=Math.max(0,c-4);else r=Math.max(0,r-1);break;
    case 'Home':c=small?c-c%4:0;break;
    case 'End':c=small?c-c%4+3:15;break;
    default:return;
  }
  e.preventDefault();
  focus={r,c};roving();button(r,c).focus();
});

// ---------- Sound tabs (phone) ----------
tabs.innerHTML=SHORT.map((n,r)=>`<button type="button" role="tab" id="lab-tab-${r}" aria-controls="beat" data-r="${r}">`+
  `<span class="glyph" aria-hidden="true">${GLYPHS[r]}</span>${n}<span class="tab-count"></span></button>`).join('');
function pick(r,move){
  sel=r;
  $$('#lab-tabs [role="tab"]').forEach(t=>{const on=Number(t.dataset.r)===r;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;});
  $$('#beat .inst').forEach(g=>{g.hidden=Number(g.dataset.r)!==r;});
  el.setAttribute('aria-label',`${NAMES[r]}: one bar, a row for each beat`);
  focus.r=r;roving();
  if(move)$(`#lab-tab-${r}`).focus();
}
tabs.addEventListener('click',e=>{const t=e.target.closest('[role="tab"]');if(t)pick(Number(t.dataset.r));});
tabs.addEventListener('keydown',e=>{
  const d={ArrowRight:1,ArrowLeft:-1,Home:-9,End:9}[e.key];if(d==null)return;
  e.preventDefault();pick(d===-9?0:d===9?3:(sel+d+4)%4,true);
});

// ---------- What it means on the K.O. II ----------
function changed(keep){
  $('#lab-positions').innerHTML=grid.map((row,r)=>{const p=row.flatMap((on,c)=>on?[pos(c)]:[]);return`<p class="line"><b>${NAMES[r]}:</b> ${p.length?p.map(lcd).join(' '):'no notes'}</p>`;}).join('');
  const same=(row,cs)=>row.every((on,c)=>on===cs.includes(c));
  const goals=[['Kick on every beat only: 1.1.1, 1.2.1, 1.3.1 and 1.4.1',g=>same(g[0],[0,4,8,12])],['Hats on all 16 steps',g=>g[2].every(Boolean)],['No bass at all: hear how much it carried',g=>!g[3].some(Boolean)]];
  $('#goals').innerHTML=goals.map(([t,f])=>{const ok=f(grid);return`<li class="goal${ok?' ok':''}" data-state="${ok?'done':'todo'}"><span class="led" aria-hidden="true"></span><span>${t}${ok?'<span class="sr"> (done)</span>':''}</span></li>`;}).join('');
  $$('#lab-tabs [role="tab"]').forEach(t=>{const n=grid[Number(t.dataset.r)].filter(Boolean).length;t.querySelector('.tab-count').textContent=n===1?'1 hit':n+' hits';});
  if(keep!==false&&P)P.writeV2({lab:grid.map(r=>r.flatMap((on,c)=>on?[c]:[]))});
}
$('#recipe').addEventListener('click',()=>{grid=recipe();render();changed();});
$('#clear').addEventListener('click',()=>{grid=HITS.map(()=>Array(16).fill(false));render();changed();});

// ---------- Steppers: tempo and volume ----------
const values={bpm:90,vol:7};
const LIMITS={bpm:[50,160,'BPM'],vol:[0,10,'']};
function setValue(k,v){
  const [lo,hi]=LIMITS[k];v=Math.max(lo,Math.min(hi,v));values[k]=v;
  const out=$(`#${k}-text`);out.textContent=String(v);out.setAttribute('aria-valuenow',String(v));
  out.setAttribute('aria-valuetext',k==='bpm'?v+' BPM':v*10+'%');
  $$(`.step-btn[data-k="${k}"]`).forEach(b=>{const d=Number(b.dataset.d);b.disabled=d<0?v<=lo:v>=hi;});
}
let hold=null,held=false;
const stopHold=()=>{clearTimeout(hold);clearInterval(hold);hold=null;};
$$('.step-btn').forEach(b=>{
  const k=b.dataset.k,d=Number(b.dataset.d);
  b.addEventListener('click',()=>{if(held){held=false;return;}setValue(k,values[k]+d);});
  b.addEventListener('pointerdown',()=>{held=false;stopHold();hold=setTimeout(()=>{held=true;hold=setInterval(()=>setValue(k,values[k]+d),70);},450);});
  ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,stopHold));
});
$$('.stepper-value').forEach(out=>out.addEventListener('keydown',e=>{
  const k=out.id.replace('-text',''),[lo,hi]=LIMITS[k];
  const v={ArrowUp:values[k]+1,ArrowRight:values[k]+1,ArrowDown:values[k]-1,ArrowLeft:values[k]-1,PageUp:values[k]+10,PageDown:values[k]-10,Home:lo,End:hi}[e.key];
  if(v==null)return;e.preventDefault();setValue(k,v);
}));
setValue('bpm',90);setValue('vol',7);

// ---------- Play ----------
const play=$('#audio-play'),status=$('#audio-status'),now=$('#lab-pos');
const player=CoachAudio.player({
  grid:()=>grid,bpm:()=>values.bpm,volume:()=>values.vol*.025,
  onStep:c=>{$$('#beat .now').forEach(b=>b.classList.remove('now'));if(c>=0)$$(`#beat [data-c="${c}"]`).forEach(b=>b.classList.add('now'));now.textContent=c>=0?pos(c):'–.–.–';},
  onState:(t,on,failed)=>{status.textContent=t;play.innerHTML=on?icon('stop')+'Stop':icon('play')+'Play lab';if(!on)now.textContent='–.–.–';
    if(failed){const x=$('#toast');if(x){x.textContent='Audio could not start. The visual guide still works.';x.classList.remove('hidden');setTimeout(()=>x.classList.add('hidden'),5000);}}}
});
play.addEventListener('click',player.toggle);
const onCompact=()=>render();
if(compact.addEventListener)compact.addEventListener('change',onCompact);else if(compact.addListener)compact.addListener(onCompact);
render();pick(0);changed(false);
})();
