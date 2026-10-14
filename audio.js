'use strict';
/* Practice sounds made in the browser (Web Audio), for the Rhythm lab (lab.js) and the target rhythm of 01 (first-beat.js).
   They are synthesised: a kick, a snare, a hat and a bass note, not the K.O. II's factory samples.
   A plain script: it defines window.CoachAudio. Load it before the page script that uses it.

   CoachAudio.player({grid, bpm, volume, onStep, onState}) returns {toggle(), stop(), playing()}:
     grid()    4 rows (kick, snare, hat, bass) of 16 booleans, read on every step, so edits play at once
     bpm()     tempo; volume() 0 to 0.25
     onStep(c) the column that is sounding now (for a playhead), or -1 when playback stops
     onState(text, playing, failed)  a status line for a role="status" element; failed when audio could not start
   Only one player sounds at a time: starting one stops the others. Every player stops when the page is hidden or left,
   and CoachAudio.stopAll() stops them from anywhere (first-beat.js does when the step changes).
   Notes are timed on the audio clock with a short look-ahead; the timer only wakes the scheduler. */
(()=>{
if(window.CoachAudio)return;
let ctx=null,noise=null;
const players=new Set();
function context(){
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}   // iPhone: play with the silent switch on
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)throw Error('no Web Audio');
  if(!ctx)ctx=new AC();
  return ctx;
}
function noiseBuffer(){
  if(!noise||noise.sampleRate!==ctx.sampleRate){
    const len=Math.floor(ctx.sampleRate*.12);noise=ctx.createBuffer(1,len,ctx.sampleRate);
    const a=noise.getChannelData(0);for(let i=0;i<len;i++)a[i]=Math.random()*2-1;
  }
  return noise;
}
// kind: 0 kick, 1 snare, 2 hat, 3 bass
function sound(kind,t,volume){
  if(!ctx||volume<=0)return;
  const d=kind===3?.24:kind===0?.18:.09,g=ctx.createGain();
  g.connect(ctx.destination);
  g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume*(kind===0?.8:kind===3?.45:.25),t+.003);g.gain.exponentialRampToValueAtTime(.001,t+d);
  let n,f;
  if(kind===0||kind===3){n=ctx.createOscillator();n.type='triangle';n.frequency.setValueAtTime(kind===0?140:65.41,t);if(kind===0)n.frequency.exponentialRampToValueAtTime(45,t+.12);n.connect(g);}
  else{n=ctx.createBufferSource();n.buffer=noiseBuffer();f=ctx.createBiquadFilter();f.type=kind===1?'bandpass':'highpass';f.frequency.value=kind===1?1700:7000;n.connect(f);f.connect(g);}
  n.start(t);n.stop(t+d+.02);
  n.onended=()=>{n.disconnect();if(f)f.disconnect();g.disconnect();};
}
function player(o){
  let timer=null,token=0,starting=false,index=0,next=0;
  const ui=new Set();
  const say=(t,on,failed)=>{try{if(o.onState)o.onState(t,on,Boolean(failed));}catch(e){console.error(e);}};
  const step=c=>{try{if(o.onStep)o.onStep(c);}catch(e){console.error(e);}};
  function tick(){
    timer=null;
    if(!ctx)return;
    const len=60/o.bpm()/4,grid=o.grid();
    while(next<ctx.currentTime-.03){next+=len;index=(index+1)%16;}
    while(next<ctx.currentTime+.12){
      const c=index,t=next,vol=o.volume();
      grid.forEach((row,i)=>{if(row[c])sound(i,t,vol);});
      const id=setTimeout(()=>{ui.delete(id);step(c);},Math.max(0,(t-ctx.currentTime)*1000));
      ui.add(id);next+=len;index=(index+1)%16;
    }
    timer=setTimeout(tick,25);
  }
  function stop(){
    token++;starting=false;
    if(timer!==null)clearTimeout(timer);
    timer=null;ui.forEach(clearTimeout);ui.clear();
    step(-1);say('Stopped',false);
    if(ctx&&ctx.state==='running'&&![...players].some(p=>p!==api&&p.playing()))ctx.suspend().catch(()=>{});
  }
  async function start(){
    players.forEach(p=>{if(p!==api&&p.playing())p.stop();});
    const mine=++token;starting=true;say('Starting…',true);
    try{
      const c=context();
      if(!c.onstatechange)c.onstatechange=()=>{if(c.state!=='running')players.forEach(p=>{if(p.playing()){p.stop();p.paused();}});};
      if(c.state!=='running')await c.resume();
      if(mine!==token)return;
      if(c.state!=='running')throw Error('blocked');
      starting=false;index=0;next=c.currentTime+.06;
      say('Playing. No sound? See the tip below.',true);
      tick();
    }catch(e){if(mine===token){starting=false;say('Stopped',false,true);}}
  }
  const api={
    toggle(){if(timer!==null||starting)stop();else start();},
    stop(){if(timer!==null||starting)stop();},
    playing:()=>timer!==null||starting,
    paused(){say('Paused by your device. Tap play to restart.',false);}
  };
  players.add(api);
  return api;
}
const stopAll=()=>players.forEach(p=>p.stop());
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
addEventListener('pagehide',stopAll);
window.CoachAudio={player,stopAll};
})();
