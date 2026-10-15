'use strict';
/* Practice sounds made in the browser (Web Audio), for the Rhythm lab (lab.js) and the target beats of the chapters (beat.js).
   They are synthesised, not the K.O. II's factory samples: kick, snare, clap, hat, open hat, rim, shaker, tom, bass and
   a second bass note a fourth higher (bass2, for an "answer" pad).
   A plain script: it defines window.CoachAudio. Load it before the page script that uses it.

   CoachAudio.player({grid, bpm, volume, onStep, onState}) returns {toggle(), stop(), playing()}:
     grid()    rows of 16 × bars booleans, read on every step, so edits play at once
     kinds()   the voice of each row (names above); without it the rows are kick, snare, hat, bass (the lab's order)
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
// A voice by name, or by the lab's row number (0 kick, 1 snare, 2 hat, 3 bass).
const ROW=['kick','snare','hat','bass'];
function out(t,peak,d,attack){
  const g=ctx.createGain();g.connect(ctx.destination);
  g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(peak,t+(attack||.003));g.gain.exponentialRampToValueAtTime(.001,t+d);
  return g;
}
function tone(t,volume,{type='triangle',f0,f1,glide=.12,d,level}){
  const g=out(t,volume*level,d),n=ctx.createOscillator();
  n.type=type;n.frequency.setValueAtTime(f0,t);if(f1)n.frequency.exponentialRampToValueAtTime(f1,t+glide);
  n.connect(g);n.start(t);n.stop(t+d+.02);n.onended=()=>{n.disconnect();g.disconnect();};
}
function hiss(t,volume,{filter,freq,d,level,attack,q}){
  const g=out(t,volume*level,d,attack),n=ctx.createBufferSource(),f=ctx.createBiquadFilter();
  n.buffer=noiseBuffer();n.loop=d>.11;f.type=filter;f.frequency.value=freq;if(q)f.Q.value=q;
  n.connect(f);f.connect(g);n.start(t);n.stop(t+d+.02);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};
}
const VOICES={
  kick:(t,v)=>tone(t,v,{f0:140,f1:45,d:.18,level:.8}),
  bass:(t,v)=>tone(t,v,{f0:65.41,d:.24,level:.45}),
  bass2:(t,v)=>tone(t,v,{f0:87.31,d:.24,level:.45}),
  tom:(t,v)=>tone(t,v,{type:'sine',f0:190,f1:110,glide:.15,d:.22,level:.6}),
  rim:(t,v)=>{tone(t,v,{f0:1700,d:.035,level:.22});hiss(t,v,{filter:'bandpass',freq:2600,d:.03,level:.12});},
  snare:(t,v)=>hiss(t,v,{filter:'bandpass',freq:1700,d:.09,level:.25}),
  clap:(t,v)=>{for(const k of [0,.011,.022])hiss(t+k,v,{filter:'bandpass',freq:1200,q:1.2,d:k===.022?.14:.012,level:.3});},
  hat:(t,v)=>hiss(t,v,{filter:'highpass',freq:7000,d:.09,level:.25}),
  ohat:(t,v)=>hiss(t,v,{filter:'highpass',freq:6500,d:.34,level:.18}),
  shaker:(t,v)=>hiss(t,v,{filter:'highpass',freq:5000,d:.07,level:.13,attack:.012})
};
function sound(kind,t,volume){
  if(!ctx||volume<=0)return;
  const play=VOICES[typeof kind==='number'?ROW[kind]:kind];
  if(play)play(t,volume);
}
function player(o){
  let timer=null,token=0,starting=false,index=0,next=0;
  const ui=new Set();
  const say=(t,on,failed)=>{try{if(o.onState)o.onState(t,on,Boolean(failed));}catch(e){console.error(e);}};
  const step=c=>{try{if(o.onStep)o.onStep(c);}catch(e){console.error(e);}};
  function tick(){
    timer=null;
    if(!ctx)return;
    const len=60/o.bpm()/4,grid=o.grid(),kinds=o.kinds?o.kinds():ROW,steps=grid[0]?grid[0].length:16;
    while(next<ctx.currentTime-.03){next+=len;index=(index+1)%steps;}
    while(next<ctx.currentTime+.12){
      const c=index,t=next,vol=o.volume();
      grid.forEach((row,i)=>{if(row[c])sound(kinds[i],t,vol);});
      const id=setTimeout(()=>{ui.delete(id);step(c);},Math.max(0,(t-ctx.currentTime)*1000));
      ui.add(id);next+=len;index=(index+1)%steps;
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
    // This player counts as playing before the others stop, so their stop() does not suspend the context under it.
    const mine=++token;starting=true;
    players.forEach(p=>{if(p!==api&&p.playing())p.stop();});
    say('Starting…',true);
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
