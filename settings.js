'use strict';
/* Settings (settings.html): the K.O. II's OS version (#firmware, saved as koii-coach-v2.firmware; chapter pages show
   "Needs OS x+" badges from it), keeping the screen on (koii-coach-prefs.wake: wake.js reads it on every poke(), so
   switching to Off pokes once to let go of a hold), keyboard shortcuts (koii-coach-prefs.keys: false switches the
   shell's letter shortcuts off), text size and which side Done · Next sits (koii-coach-prefs.text 'default' | 'larger'
   and .hand 'right' | 'left', applied by shell.js as html[data-text] and html[data-hand]), whether the unit is set up (koii-coach-prefs.setup 'ready' | 'new': Home's Continue
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
    OS20='song mode, resampling, hands-free sampling and sidechain',
    OS25='USB audio, sample reverse, a choice of recording sample rates, mono samples up to 40 seconds, equal-length auto chop, an arpeggiator in KEYS, and key and scale selection (hold KEYS, turn X for key and Y for scale)';
  const t={
    '2.5':`OS 2.5.x is the latest release and the one this course is written for. It has the OS 2.0 features (${OS20}) plus the OS 2.5 additions: ${OS25}.`,
    '2':`OS 2.0.x has ${OS20}, but none of the OS 2.5 additions: ${OS25}. This course is written for OS 2.5.x, so <b>update first</b>: ${upd} shows how.`,
    older:`An OS older than 2.0 lacks ${OS20}, and all of the OS 2.5 additions. This course is written for OS 2.5.x, so <b>update first</b>: ${upd} shows how.`,
    unknown:`This app can’t detect your OS, and the official guide doesn’t say how to read the version on the device. The guide recommends keeping the K.O. II up to date with the official <a href="https://teenage.engineering/apps/update" target="_blank" rel="noopener noreferrer">update utility${icon('external')}${NEWTAB}</a>, and ${upd} walks you through it. Then choose OS 2.5.x here.`
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
  r.addEventListener('change',()=>{if(!r.checked)return;P.patch('koii-coach-prefs',{wake:r.value});if(r.value==='off'&&window.CoachWake)CoachWake.poke();});
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
}
choices();
$$('input[name="keys"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked)P.patch('koii-coach-prefs',{keys:r.value==='on'});}));
['text','hand'].forEach(k=>$$(`input[name="${k}"]`).forEach(r=>r.addEventListener('change',()=>{if(r.checked){P.patch('koii-coach-prefs',{[k]:r.value});document.documentElement.dataset[k]=r.value;}})));
$$('input[name="setup"]').forEach(r=>r.addEventListener('change',()=>{if(r.checked){P.patch('koii-coach-prefs',{setup:r.value});refresh();}}));
$('#reset-settings').addEventListener('click',()=>{
  let before=null;
  try{before=localStorage.getItem('koii-coach-prefs');localStorage.removeItem('koii-coach-prefs');}catch(e){alertText('This browser is not saving settings (storage is blocked or full, or this is a private window).');return;}
  choices();refresh();
  if(window.CoachWake)CoachWake.poke();
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
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});}catch(e){}
  const file=P.exportFile(),a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(file,null,1)],{type:'application/json'}));
  a.download=`koii-coach-progress-${file.exported.slice(0,10)}.json`;
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);
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
const line=[site.version&&`Course version ${site.version}`,site.guideChecked&&`checked against the official guide on ${site.guideChecked}`,site.firmware&&`written for ${site.firmware}`].filter(Boolean).join(' · ');
if(line)$('#course-info').textContent=line+'.';
if(site.guideChecked)$('#guide-checked').textContent=`Original teaching text based on the official guide, checked ${site.guideChecked}. Rhythm, melody and arrangement choices are creative suggestions, not manufacturer presets.`;
})();
