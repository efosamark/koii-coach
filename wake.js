'use strict';
/* Keeps the screen on while someone works at the unit, so a propped-up phone does not dim between steps.
   A plain script: it defines window.CoachWake and mounts one sun button in the app bar's #appbar-actions, so any
   page can load it (every chapter page does).

   window.CoachWake:
     poke()       call it whenever the learner does something (a tick, Next). The first call asks the browser to keep
                  the screen on; every call restarts the 15-minute idle timer. Call it again after changing the setting.
     toggle()     what the sun button does: let go if the screen is held, otherwise hold it now
     held()       true while this page holds the screen
     supported()  true when the browser has the Screen Wake Lock API (secure pages only: https or localhost)

   The hold ends on pagehide and after 15 minutes without a poke() (toast "Screen can sleep again"). Browsers drop it
   whenever the page is hidden, so it is asked for again when the page becomes visible.
   koii-coach-prefs.wake decides what poke() may do: "auto" (the default) holds the screen, "off" never starts a hold.
   The button still works when it is off, because pressing it is the learner's own choice for this page. Switching it
   off with the button keeps poke() quiet for the rest of the page. Nothing is saved: every page load starts free. */
(()=>{
if(window.CoachWake)return;
const IDLE=15*60*1000;
const supported=()=>Boolean(navigator.wakeLock&&typeof navigator.wakeLock.request==='function');
// Settings > Keep screen on. Read each time it matters, so a change made in another tab counts.
function setting(){
  try{const p=JSON.parse(localStorage.getItem('koii-coach-prefs')||'null');return p&&p.wake==='off'?'off':'auto';}catch(e){return 'auto';}
}
let lock=null,      // the WakeLockSentinel while the screen is held
    pending=null,   // the request that is on its way
    want=false,     // this page should hold the screen, so it asks again when it becomes visible
    manual=false,   // the hold began with the button, so the "off" setting does not end it
    quiet=false,    // the button switched it off: poke() leaves it off for the rest of this page
    last=0,timer=0,btn=null;

const sync=()=>{if(btn)btn.setAttribute('aria-pressed',lock?'true':'false');};

// A short message in the page's toast; a page without one gets its own the first time it is needed.
function say(text){
  let el=document.getElementById('toast');
  if(!el){el=document.createElement('div');el.id='toast';el.className='toast hidden';el.setAttribute('role','status');document.body.append(el);}
  el.textContent=text;el.classList.remove('hidden');
  clearTimeout(say.timer);say.timer=setTimeout(()=>el.classList.add('hidden'),5000);
}

// Ask the browser for the lock. Resolves true when this page holds it afterwards; a refusal is quiet.
function take(){
  if(lock)return Promise.resolve(true);
  if(pending)return pending;
  if(document.visibilityState!=='visible')return Promise.resolve(false);   // a hidden page cannot hold it; visibilitychange asks again
  pending=navigator.wakeLock.request('screen').then(s=>{
    if(!want){s.release().catch(()=>{});return false;}   // it was switched off while the request was on its way
    lock=s;
    s.addEventListener('release',()=>{if(lock===s){lock=null;sync();}});   // the browser took it back (page hidden, battery saver)
    return true;
  },()=>false).then(ok=>{pending=null;sync();return ok;});
  return pending;
}
function stop(announce){
  want=false;manual=false;clearTimeout(timer);
  const s=lock;lock=null;
  if(s)s.release().catch(()=>{});
  sync();
  if(announce&&s)say('Screen can sleep again');
}
// Hold the screen and (re)start the idle timer.
function hold(){
  want=true;last=Date.now();
  clearTimeout(timer);timer=setTimeout(()=>stop(true),IDLE);
  return take();
}

function poke(){
  if(!supported())return;
  if(setting()==='off'&&!manual){if(want)stop(false);return;}   // "off" never starts a hold, and ends one that poke() started
  if(!quiet)hold();
}
function toggle(){
  if(!supported())return;
  if(lock){quiet=true;stop(false);return;}
  quiet=false;manual=true;
  hold().then(ok=>{if(!ok&&want){stop(false);say('Your browser would not keep the screen on.');}});
}

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible'||!want)return;
  if(Date.now()-last>=IDLE)stop(false);   // it went idle while the page was away: nothing to announce
  else take();
});
addEventListener('pagehide',()=>stop(false));

// The sun button. aria-pressed says whether the screen is held, and coach.css lights a dot on it then.
function mount(){
  if(btn||!supported())return true;
  const host=document.getElementById('appbar-actions');
  if(!host)return false;
  btn=document.createElement('button');
  btn.type='button';btn.id='wake-toggle';btn.className='icon-btn wake-btn';btn.title='Keep screen on';
  btn.setAttribute('aria-label','Keep screen on');btn.setAttribute('aria-pressed',lock?'true':'false');
  btn.innerHTML='<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-sun"></use></svg>';
  btn.addEventListener('click',toggle);
  host.append(btn);
  return true;
}
// shell.js makes #appbar-actions while the page loads. If it is not there yet, look once more when the page is ready.
if(!mount()&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});

window.CoachWake={poke,toggle,held:()=>Boolean(lock),supported};
})();
