'use strict';
/* The Rhythm lab (lab.html): a one-bar, four-row grid of 64 buttons (#beat: kick, snare, hat, bass) that plays with the
   practice sounds of audio.js, the positions to copy to the K.O. II, and three small challenges. The grid is saved as
   koii-coach-v2.lab ([row][columns that are on]), where the old app kept it. On a phone (under 760px) each row shows
   half a bar at a time, beats 1-2 above beats 3-4. */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const el=$('#beat');
if(!el||!window.CoachAudio)return;
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const P=window.CoachProgress;
const HITS=[[0,6,8,14],[4,12],[0,2,4,6,8,10,12,14],[0,8]],NAMES=['Kick A1','Snare A2','Hat A3','Bass B1'];
const pos=c=>`1.${Math.floor(c/4)+1}.${c%4+1}`,lcd=t=>`<samp class="lcd">${t}</samp>`;
const recipe=()=>HITS.map(row=>Array.from({length:16},(_,i)=>row.includes(i)));
const saved=P&&P.v2().lab;
let grid=saved?saved.map(r=>Array.from({length:16},(_,i)=>r.includes(i))):recipe();
let bpm=90,volume=.18;
const narrow=matchMedia('(max-width:760px)');

function render(){
  const half=narrow.matches,per=half?8:16;let h='';
  for(let b=0;b<16;b+=per){
    if(b)h+='<span class="spacer" aria-hidden="true"></span>';
    h+='<span aria-hidden="true"></span>'+Array.from({length:per/4},(_,k)=>{const beat=b/4+k+1;return`<span class="beathead" aria-hidden="true">Beat ${beat}<small>1.${beat}.1–1.${beat}.4</small></span>`;}).join('')+
      grid.map((row,r)=>`<span class="label">${NAMES[r]}</span>${row.slice(b,b+per).map((on,j)=>{const c=b+j;return`<button type="button" class="${on?'on':''}${r===3?' bass':''}${c%4===0?' beatstart':''}" data-r="${r}" data-c="${c}" aria-label="${NAMES[r]}, step ${c+1}, position ${pos(c)}" aria-pressed="${on}">${c+1}</button>`;}).join('')}`).join('');
  }
  el.classList.toggle('half',half);
  el.innerHTML=h;
}
function changed(keep){
  $('#lab-positions').innerHTML=grid.map((row,r)=>{const p=row.flatMap((on,c)=>on?[pos(c)]:[]);return`<p class="line"><b>${NAMES[r]}:</b> ${p.length?p.map(lcd).join(' '):'no notes'}</p>`;}).join('');
  const same=(row,cs)=>row.every((on,c)=>on===cs.includes(c));
  const goals=[['Kick on every beat only: 1.1.1, 1.2.1, 1.3.1 and 1.4.1',g=>same(g[0],[0,4,8,12])],['Hats on all 16 steps',g=>g[2].every(Boolean)],['No bass at all: hear how much it carried',g=>!g[3].some(Boolean)]];
  $('#goals').innerHTML=goals.map(([t,f])=>{const ok=f(grid);return`<li class="goal${ok?' ok':''}" data-state="${ok?'done':'todo'}"><span class="led" aria-hidden="true"></span><span>${t}${ok?'<span class="sr"> (done)</span>':''}</span></li>`;}).join('');
  if(keep!==false&&P)P.writeV2({lab:grid.map(r=>r.flatMap((on,c)=>on?[c]:[]))});
}
el.addEventListener('click',e=>{
  const b=e.target.closest('button[data-r]');if(!b)return;
  const r=Number(b.dataset.r),c=Number(b.dataset.c);
  grid[r][c]=!grid[r][c];
  b.classList.toggle('on',grid[r][c]);b.setAttribute('aria-pressed',String(grid[r][c]));
  changed();
});
$('#recipe').addEventListener('click',()=>{grid=recipe();render();changed();});
$('#clear').addEventListener('click',()=>{grid=HITS.map(()=>Array(16).fill(false));render();changed();});
const play=$('#audio-play'),status=$('#audio-status');
const player=CoachAudio.player({
  grid:()=>grid,bpm:()=>bpm,volume:()=>volume,
  onStep:c=>{$$('#beat .now').forEach(b=>b.classList.remove('now'));if(c>=0)$$(`#beat [data-c="${c}"]`).forEach(b=>b.classList.add('now'));},
  onState:(t,on,failed)=>{status.textContent=t;play.innerHTML=on?icon('stop')+'Stop':icon('play')+'Play lab';if(failed){const x=$('#toast');if(x){x.textContent='Audio could not start. The visual guide still works.';x.classList.remove('hidden');setTimeout(()=>x.classList.add('hidden'),5000);}}}
});
play.addEventListener('click',player.toggle);
$('#volume').addEventListener('input',e=>{volume=Number(e.target.value)/100;});
$('#bpm').addEventListener('input',e=>{bpm=Number(e.target.value);$('#bpm-text').textContent=bpm;});
const onNarrow=()=>render();
if(narrow.addEventListener)narrow.addEventListener('change',onNarrow);else if(narrow.addListener)narrow.addListener(onNarrow);
render();changed(false);
})();
