'use strict';
/* Target beats on chapter pages: every figure.pattern gets a read-only grid of its rows and a "Hear it" button that
   plays them with the practice sounds (audio.js; load it first). The figure's text list is the one source:
     <figure class="pattern" data-bpm="128"><figcaption>…</figcaption>
       <p class="pattern-text">Kick (A1): <samp class="lcd">1.1.1</samp> <samp class="lcd">1.2.1</samp> …<br>Clap (A2): …</p></figure>
   Each line is "Name (pad): positions" (bar.beat.step). The voice comes from the name (kick, snare, clap, closed or open
   hat, rim, shaker, tom, bass; "answer" is the second bass note). The tempo is data-bpm, or "… BPM" in the caption;
   the length is the highest bar written. The grid (hidden from screen readers: the text list says the same) shows
   every bar side by side, with a playhead while it plays.
   Playback stops when the step changes (the "coach:view" event from player.js), when the figure's disclosure closes
   and before printing. Chapter 1's figures carry data-rows; first-beat.js reads that for its placement helper. */
(()=>{
const VOICES=[['answer','bass2'],['bass','bass'],['open hat','ohat'],['hat','hat'],['clap','clap'],['rim','rim'],['click','rim'],
  ['shaker','shaker'],['snare','snare'],['kick','kick'],['tom','tom']];
const voiceOf=name=>{const n=name.toLowerCase(),v=VOICES.find(([k])=>n.includes(k));return v?v[1]:'rim';};
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const col=p=>{const m=/^(\d+)\.([1-4])\.([1-4])$/.exec(p);return m?(m[1]-1)*16+(m[2]-1)*4+(m[3]-1):-1;};

function read(fig){
  const text=fig.querySelector('.pattern-text');
  if(!text)return null;
  const rows=text.innerHTML.split(/<br\s*\/?>/i).map(line=>{
    const d=document.createElement('div');d.innerHTML=line;
    const name=(d.textContent.split(':')[0]||'').trim(),at=[...d.querySelectorAll('samp')].map(s=>col(s.textContent.trim())).filter(c=>c>=0);
    return name&&at.length?{name:name.replace(/\s*\([^)]*\)\s*$/,''),voice:voiceOf(name),at}:null;
  }).filter(Boolean);
  if(!rows.length)return null;
  const bars=Math.max(1,...rows.flatMap(r=>r.at.map(c=>Math.floor(c/16)+1)));
  const cap=fig.querySelector('figcaption'),m=/(\d{2,3})\s*BPM/.exec(cap?cap.textContent:'');
  const bpm=Number(fig.dataset.bpm)||(m?Number(m[1]):90);
  return{rows,bars,bpm,grid:rows.map(r=>Array.from({length:16*bars},(_,c)=>r.at.includes(c)))};
}

const figures=[...document.querySelectorAll('figure.pattern')].map(fig=>{
  const b=read(fig);
  if(!b)return null;
  const n=16*b.bars,strip=document.createElement('div');
  strip.className='strip'+(b.bars>1?' multi':'');strip.setAttribute('aria-hidden','true');
  strip.style.setProperty('--cols',String(n));
  const head=b.bars>1?Array.from({length:b.bars},(_,i)=>`<span class="strip-beat" style="grid-column:span 16">Bar ${i+1}</span>`).join(''):
    [1,2,3,4].map(i=>`<span class="strip-beat">Beat ${i}</span>`).join('');
  strip.innerHTML='<span></span>'+head+b.rows.map((r,i)=>`<span class="strip-name">${esc(r.name)}</span>`+
    b.grid[i].map((on,c)=>`<span class="strip-cell${on?' on':''}${c%16===0&&c?' barstart':c%4===0?' beatstart':''}" data-c="${c}"></span>`).join('')).join('');
  const tools=document.createElement('div');
  tools.className='strip-tools';
  tools.innerHTML=`<button class="btn hear-btn" type="button">${icon('play')}<span>Hear it</span></button><span class="meta strip-status" role="status"></span>`+
    '<p class="meta strip-tip">No sound? Turn your phone volume up. On iPhone, also switch off Silent mode or use headphones. The practice sounds are made by your browser, not your K.O. II’s samples.</p>';
  // The grid, then Hear it, then the written positions (which can run long for four bars).
  // A note on what the beat leaves out goes under the caption.
  const cap=fig.querySelector('figcaption'),note=fig.querySelector('.pattern-note');
  if(cap&&note)cap.after(note);
  const top=note||cap;
  if(top)top.after(strip);else fig.prepend(strip);
  strip.after(tools);
  const btn=tools.querySelector('.hear-btn'),status=tools.querySelector('.strip-status'),cells=[...strip.querySelectorAll('.strip-cell')];
  const play=window.CoachAudio?CoachAudio.player({
    grid:()=>b.grid,kinds:()=>b.rows.map(r=>r.voice),bpm:()=>b.bpm,volume:()=>.18,
    onStep:c=>cells.forEach(x=>x.classList.toggle('now',Number(x.dataset.c)===c)),
    onState:(t,on,failed)=>{
      status.textContent=t==='Stopped'?'':t;btn.innerHTML=icon(on?'stop':'play')+`<span>${on?'Stop':'Hear it'}</span>`;
      if(failed&&window.CoachChapter&&CoachChapter.say)CoachChapter.say('Audio could not start. The written positions still work.');
    }
  }):null;
  if(play)btn.addEventListener('click',play.toggle);else btn.hidden=true;
  const box=fig.closest('details');
  if(box&&play)box.addEventListener('toggle',()=>{if(!box.open)play.stop();});
  return{fig,play,bars:b.bars,bpm:b.bpm};
}).filter(Boolean);

const stopAll=()=>{if(window.CoachAudio)CoachAudio.stopAll();};
document.addEventListener('coach:view',stopAll);
addEventListener('beforeprint',stopAll);
window.CoachBeat={figures};
})();
