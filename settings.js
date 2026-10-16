'use strict';
/* Settings (settings.html): the K.O. II's OS version (#firmware, saved as koii-coach-v2.firmware; chapter pages show
   "Needs OS x+" badges from it), keeping the screen on (koii-coach-prefs.wake: wake.js, on the chapter pages, reads it
   on every poke(); this page loads no wake.js and holds no lock), keyboard shortcuts (koii-coach-prefs.keys: false switches the
   shell's letter shortcuts off), text size and which side Done · Next sits (koii-coach-prefs.text 'default' | 'larger'
   and .hand 'right' | 'left', applied by shell.js as html[data-text] and html[data-hand]), the look (koii-coach-prefs.look
   'studio' | 'minimal' | 'spec', applied by shell.js as html[data-look] with CoachShell.setLook), whether the unit is set up (koii-coach-prefs.setup 'ready' | 'new': Home's Continue
   opens Chapter 0 until it is 'ready'), the progress file, Reset all progress and Reset settings. Loading a file and
   Reset all progress touch progress only: koii-coach-prefs and the OS choice stay. Reset settings clears
   koii-coach-prefs (progress.js sets setup again on the next page load for a learner with progress, as it does for
   every existing learner). Both resets can be undone for 10 seconds. */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const P=window.CoachProgress,site=window.COACH_SITE||{};
if(!P||!$('#firmware'))return;
const icon=n=>`<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#i-${n}"></use></svg>`;
const NEWTAB='<span class="sr"> (opens in a new tab)</span>';

// A short message; with undo, it carries an Undo button and stays 10 s instead of 5 s.
function toast(t,undo){
  const el=$('#toast');el.textContent=t;clearTimeout(toast.timer);
  if(undo){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='Undo';b.onclick=()=>{clearTimeout(toast.timer);el.classList.add('hidden');undo();};el.append(b);}
  el.classList.remove('hidden');toast.timer=setTimeout(()=>el.classList.add('hidden'),undo?10000:5000);
}
// Errors stay next to the control until the next action (plan 5.12).
function alertText(t){const a=$('#progress-alert');a.textContent=t||'';a.hidden=!t;}
const refresh=()=>{if(window.CoachShell)CoachShell.refresh();};

// ---------- OS version ----------
const fw=$('#firmware');
function versionNote(){
  const v=fw.value,upd='<a href="./setup.html">Chapter 0 · Set up your K.O. II</a>',
    OS20='song mode, resampling and sidechain',
    OS25='USB audio, reverse, the arpeggiator, and scales in KEYS';
  const t={
    '2.5':`OS 2.5.x is the latest release, and the course is written for it.`,
    '2':`OS 2.0.x lacks ${OS25}. <b>Update first</b>: ${upd} shows how.`,
    older:`An OS older than 2.0 lacks ${OS20}, and much more. <b>Update first</b>: ${upd} shows how.`,
    unknown:`The coach can’t read the OS on your K.O. II. Keep it up to date with the official <a href="https://teenage.engineering/apps/update" target="_blank" rel="noopener noreferrer">update utility${icon('external')}${NEWTAB}</a>, and ${upd} walks you through it. Then choose OS 2.5.x here.`
  }[v]||'';
  const n=$('#version-note');
  n.className='notice '+(v==='2'||v==='older'?'caution':'info');
  n.innerHTML=t;
}
fw.value=P.v2().firmware;
fw.addEventListener('change',()=>{if(!P.writeV2({firmware:fw.value}))alertText('This browser is not saving settings (storage is blocked or full, or this is a private window).');versionNote();});
versionNote();

// ---------- Keep the screen on ----------
const wake=P.prefs().wake==='off'?'off':'auto';
$$('input[name="wake"]').forEach(r=>{
  r.checked=r.value===wake;
  r.addEventListener('change',()=>{if(!r.checked)return;P.patch('koii-coach-prefs',{wake:r.value});});
});
if(!('wakeLock' in navigator))$('#wake-note').append(' This browser can’t keep the screen on, so give your device a longer screen timeout instead.');

// ---------- Keyboard shortcuts and Chapter 0 ----------
function choices(){
  const pr=P.prefs();
  $$('input[name="keys"]').forEach(r=>{r.checked=r.value===(pr.keys===false?'off':'on');});
  $$('input[name="setup"]').forEach(r=>{r.checked=r.value===(pr.setup==='ready'?'ready':'new');});
  $$('input[name="wake"]').forEach(r=>{r.checked=r.value===(pr.wake==='off'?'off':'auto');});
  const text=pr.text==='larger'?'larger':'default',hand=pr.hand==='left'?'left':'right';
  $$('input[name="text"]').forEach(r=>{r.checked=r.value===text;});
  $$('input[name="hand"]').forEach(r=>{r.checked=r.value===hand;});
  document.documentElement.dataset.text=text;document.documentElement.dataset.hand=hand;
  const look=['minimal','spec'].includes(pr.look)?pr.look:'studio';
  $$('input[name="look"]').forEach(r=>{r.checked=r.value===look;});
  if(window.CoachShell)CoachShell.setLook(look);
}
choices();
$$('input[name="keys"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked)P.patch('koii-coach-prefs',{keys:r.value==='on'});}));
['text','hand'].forEach(k=>$$(`input[name="${k}"]`).forEach(r=>r.addEventListener('change',()=>{if(r.checked){P.patch('koii-coach-prefs',{[k]:r.value});document.documentElement.dataset[k]=r.value;}})));
$$('input[name="look"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked){P.patch('koii-coach-prefs',{look:r.value});CoachShell.setLook(r.value);}}));
$$('input[name="setup"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked){P.patch('koii-coach-prefs',{setup:r.value});refresh();}}));
$('#reset-settings').addEventListener('click',()=>{
  let before=null;
  try{before=localStorage.getItem('koii-coach-prefs');localStorage.removeItem('koii-coach-prefs');}catch(e){alertText('This browser is not saving settings (storage is blocked or full, or this is a private window).');return;}
  choices();refresh();
  toast('Settings reset.',()=>{try{if(before===null)localStorage.removeItem('koii-coach-prefs');else localStorage.setItem('koii-coach-prefs',before);}catch(e){}choices();refresh();toast('Settings restored.');});
});

// ---------- Progress ----------
function summary(){
  const all=P.chapters(),d=all.filter(p=>p.done).length,ip=all.filter(p=>!p.done&&p.x>0).length;
  $('#progress-summary').textContent=d&&d===all.length?`All ${all.length} chapters done.`:d||ip?`So far: ${d} of ${all.length} chapters done${ip?`, ${ip} in progress`:''}.`:'No chapter started yet.';
}
summary();
$('#export').addEventListener('click',()=>{
  alertText('');
  P.saveFile();
  toast('Progress file saved. Keep it somewhere safe.');
});
$('#import-file').addEventListener('change',async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';
  alertText('');
  if(!f)return;
  let data={};
  try{if(f.size>500000)throw Error('too big');data=P.readFile(JSON.parse(await f.text()));}catch(x){data={};}
  const n=Object.keys(data).length;
  if(!n){alertText('That file is not a K.O. II Coach progress file. Nothing was changed.');return;}
  if(!confirm(`Replace the progress in this browser with the ${n} saved item${n===1?'':'s'} from “${f.name}”?\n\nYour settings and OS choice here are kept.`))return;
  P.applyFile(data);
  fw.value=P.v2().firmware;versionNote();summary();refresh();
  toast('Progress loaded.');
});
$('#reset').addEventListener('click',()=>{
  alertText('');
  if(!confirm('Reset all K.O. II Coach progress in this browser?\n\nThis clears the ticks and your place in every chapter, the lessons you marked and your Rhythm lab pattern. Your settings and OS choice are kept. Music on your EP-133 is not affected.\n\nYou can undo this for 10 seconds. To keep a copy, choose Cancel and save a progress file first.'))return;
  const snap=P.resetAll();
  summary();refresh();
  toast('All progress reset.',()=>{P.restore(snap);summary();refresh();toast('Progress restored.');});
});

// ---------- Version and sources ----------
const line=[site.version&&`Version ${site.version}`,site.firmware&&`written for ${site.firmware}`].filter(Boolean).join(' · ');
if(line)$('#course-info').textContent=line+'.';
// "13 October 2026" from site.guideChecked (2026-10-13).
const day=d=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(d||'');return m?`${+m[3]} ${['January','February','March','April','May','June','July','August','September','October','November','December'][m[2]-1]} ${m[1]}`:d;};
if(site.guideChecked)$('#guide-checked').textContent=`Based on teenage engineering’s EP-133 guide, last checked on ${day(site.guideChecked)}.`;
})();
