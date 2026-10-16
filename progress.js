'use strict';
/* Saved progress for every page: one place that reads and writes the koii-coach* keys outside a chapter's own record.
   A plain script (no modules): load it after site.js and before shell.js, on every page:
     <script src="site.js"></script><script src="progress.js"></script><script src="shell.js"></script>
   It runs its migrations as the page loads, before shell.js counts progress and before the deferred chapter.js reads
   a chapter's record. Spec: docs/overhaul-plan.md 5.1, 7.7 and 8.6. Rules: the shape of an existing key never changes,
   migrations only add, an existing koii-coach-ch-* record wins, and a legacy key is deleted only by the clean-up below.

   The keys:
     koii-coach-v2         the old single-page app's record, {schema:4, step, stepId, note, song, songId, view, done,
                           firmware, finished, songFinished, lab}. It stays the home of the OS choice (firmware), the Learn
                           lessons marked as tried (done), the 01 placement helper's note and the Rhythm lab (lab).
                           Writes keep all twelve fields: the old app rebuilt it from these and dropped anything else.
     koii-coach-ch-<slug>  a chapter's ticks, {v:1, done:[ids], last, n, cur?, at?, derivedFrom?, skip?, m?} (chapter.js
                           owns it; m is the last split migration applied to it, below)
     koii-coach-prefs      settings, {v:1, setup, wake, modes, keys, text, hand, look}: Reset and loading a file keep it
     koii-coach-meta       {v:1, lastChapter, appAt, setupReason, notices:[{chapter, text}], since}
     koii-coach-notes      {v:1, values:{'<project>/<NAME>': '<number>'}}: scene and sample numbers typed in a chapter
                           (chapter.js); in the progress file, and cleared with Reset all progress

   01 First beat and 02 Make it a song were views of the old app, which saved a position (step, song) instead of ticks.
   Their records (koii-coach-ch-first-beat, koii-coach-ch-song) are derived from that position: every step before it
   is ticked (all of them once finished) and cur is that step. derivedFrom holds the position the record was derived
   from, so it is derived again only when koii-coach-v2 moved since (an older copy of the site still writes it).
   The other way round, every save of those two records writes the position back into koii-coach-v2 (mirror), so
   reverting to a release with the old app finds the learner where they are now.

   The clean-up (plan 8.6: at least 8 weeks after the release that made 01 and 02 chapter pages). meta.since is when
   this browser first ran this file. From 8 weeks after it, the positions are no longer written back into
   koii-coach-v2, and a chapter's old checklist keys (LEGACY) are removed once its koii-coach-ch-* record exists.
   koii-coach-v2 itself stays: it still holds the OS choice, the Learn lessons tried, the 01 note and the Rhythm lab.
   A progress file saved before that still loads: chapter.js migrates the old keys it brings, and the next page load
   removes them.

   window.CoachProgress:
     v2()                    koii-coach-v2 read and brought up to schema 4 (a fresh one when there is none)
     writeV2(fields)         merges fields into it and saves; false when the browser refuses
     prefs(), meta(), patch(key, fields)
     chapters()              [{c, n, x, done, at, cur, href}] for every chapter in site.js, in guided order; n leaves
                             out the optional steps the learner skipped (record.skip) and has not ticked
     continueTarget(all)     the chapter Continue opens (plan 5.1), or null when every chapter is done
     v2Progress(), firstRun()
     migratedSetup           true when this page load moved an existing learner past the set-up question
     mirror(slug, record)    called by chapter.js before it saves a 01/02 record
     order(slug)             01/02: the step ids in page order (chapter.js checks them against the page)
     migrateRecord(slug, record), level(slug)   split migrations (below), for chapter.js
     exportFile(), readFile(object), applyFile(keys), resetAll(), restore(snapshot)   for Settings
     saveFile()              downloads the progress file (Settings, and the chapter-complete card in player.js)
     persist()               asks the browser to keep this site's storage (saveFile, and chapter.js on a first tick) */
(()=>{
const V2='koii-coach-v2',PREFS='koii-coach-prefs',META='koii-coach-meta',CH='koii-coach-ch-';
// Old checklist keys of Chapters 5-7, by chapter; chapter.js migrates them. Export and Reset cover them as well.
const LEGACY_OF={hiphop:['koii-hiphop-checklist-v1','koii-hiphop-vocal-checklist-v2'],'tech-house':['koii-tech-house-checklist-v1'],
  'vocal-house':['koii-thodorakis-checklist-v1','koii-thodorakis-voice-checklist-v1','koii-thodorakis-club-checklist-v1']};
const LEGACY=Object.values(LEGACY_OF).flat();
const ours=k=>typeof k==='string'&&(k.startsWith('koii-coach')||LEGACY.includes(k));

// Frozen history: the 01 and 02 steps in the order the old app had them. koii-coach-v2's step and song are
// positions in these lists. Do not edit when steps change.
const SPA={
  'first-beat':'beat-empty-project beat-tempo-grid beat-load-kick beat-load-snare beat-load-hat beat-hats-quieter beat-placement-move beat-kicks beat-snares beat-hats beat-listen-drums beat-balance beat-commit-drums beat-bass-sound beat-bass-pulses beat-bass-trim beat-reverb beat-performance beat-live-practice beat-live-record beat-live-undo beat-recap'.split(' '),
  song:'song-find-beat song-copy-intro song-intro-remove-bass song-intro-check song-copy-melody song-melody-sound song-melody-level song-melody-two-bars song-melody-note-1 song-melody-note-2 song-melody-note-3 song-melody-note-4 song-melody-listen song-melody-pitch song-copy-break song-break-clear song-check-scenes song-plan song-list-open song-list-first-half song-list-second-half song-play song-reverb song-recap'.split(' ')
};
// The steps of first-beat.html and song.html in page order. Keep in step with the pages: chapter.js warns when they differ.
const ORDER={
  'first-beat':'beat-empty-project beat-open-project-6 beat-check-empty beat-tempo-grid beat-grid-16 beat-load-kick beat-hear-kick beat-load-snare beat-load-hat beat-hats-quieter beat-placement-move beat-kicks beat-snares beat-hats beat-listen-drums beat-balance beat-balance-levels beat-commit-drums beat-commit-copy beat-bass-sound beat-bass-load beat-bass-pulses beat-bass-trim beat-bass-trim-y beat-reverb beat-reverb-send beat-scene-sync beat-performance beat-perform-start beat-perform beat-live-practice beat-live-play-along beat-live-record beat-live-record-tap beat-live-record-stop beat-live-undo beat-live-erase-note beat-live-beat-clean beat-recap beat-recap-try'.split(' '),
  song:'song-find-beat song-select-beat song-check-beat song-copy-intro song-intro-remove-bass song-intro-erase-bass song-intro-check song-copy-melody song-melody-sound song-melody-load song-melody-level song-melody-two-bars song-melody-note-1 song-melody-note-2 song-melody-note-3 song-melody-note-4 song-melody-listen song-melody-pitch song-copy-break song-break-clear song-check-scenes song-plan song-list-open song-position-1 song-list-first-half song-list-3-6 song-list-second-half song-play song-reverb song-reverb-a song-reverb-c song-recap song-recap-change'.split(' ')
};
// Schema 2 (until 2026-10-12) saved 01's step as a position in that day's 19 steps, and the Learn lessons as positions.
const V2_FIRST='beat-empty-project beat-tempo-grid beat-load-kick beat-load-snare beat-load-hat beat-hats-quieter beat-placement-move beat-kicks beat-snares beat-hats beat-listen-drums beat-balance beat-commit-drums beat-bass-sound beat-bass-pulses beat-bass-trim beat-reverb beat-performance beat-recap'.split(' ');
const V2_LESSONS='samples-notes-and-patterns groups-and-scenes choosing-and-balancing-sounds live-recording-without-panic precise-step-recording timing-swing-and-correction longer-loops keys-one-sample-many-pitches record-your-own-sound trim-and-envelope-safely effects-and-fader automatic-song-arrangement-os-2-0 undo-and-careful-erasing advanced-features-check-firmware'.split(' ');
const FW=['2.5','2','older','unknown'];

const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
const obj=k=>{const v=read(k);return v&&typeof v==='object'&&!Array.isArray(v)?v:null;};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}};
// Merge fields into an object key. Another module may own more fields there, so everything else stays.
function patch(k,o){const v=obj(k)||{};if(!v.v)v.v=1;Object.assign(v,o);return write(k,v);}
const prefs=()=>obj(PREFS)||{};
const meta=()=>obj(META)||{};
const int=x=>Number.isInteger(x);
const clamp=(i,n)=>Math.max(0,Math.min(n-1,i));

// ---------- koii-coach-v2 ----------
const fresh=()=>({schema:4,step:0,stepId:'',note:0,song:0,songId:'',view:'first',done:[],firmware:'2.5',finished:false,songFinished:false,lab:null});
function at(list,id,i){if(id){const j=list.indexOf(id);if(j>=0)return j;}return int(i)?clamp(i,list.length):0;}
// The old app's load(), without its content: positions by id, lesson positions of schema 2, OS 2.5 as the default.
function v2(){
  const s=fresh(),v=obj(V2);
  if(v){
    const sch=int(v.schema)?v.schema:2,old=sch<3;
    s.step=at(SPA['first-beat'],old&&int(v.step)?V2_FIRST[v.step]:v.stepId,v.step);
    s.song=at(SPA.song,v.songId,v.song);
    s.note=int(v.note)?Math.max(0,Math.min(15,v.note)):0;
    s.done=[...new Set((Array.isArray(v.done)?v.done:[]).map(x=>old?(int(x)?V2_LESSONS[x]:null):x).filter(x=>typeof x==='string'&&x))];
    s.firmware=FW.includes(v.firmware)&&!(sch<4&&v.firmware==='unknown')?v.firmware:'2.5';
    s.finished=v.finished===true;s.songFinished=v.songFinished===true;
    if(typeof v.view==='string')s.view=v.view;
    if(Array.isArray(v.lab)&&v.lab.length===4&&v.lab.every(Array.isArray))s.lab=v.lab.map(r=>r.filter(c=>int(c)&&c>=0&&c<16));
  }
  s.stepId=SPA['first-beat'][s.step];s.songId=SPA.song[s.song];
  return s;
}
function writeV2(fields){
  const s=Object.assign(v2(),fields||{});
  s.schema=4;s.stepId=SPA['first-beat'][s.step]||'';s.songId=SPA.song[s.song]||'';
  return write(V2,s);
}
const v2Progress=()=>{const s=v2();return s.step>0||s.song>0||s.finished||s.songFinished;};

// ---------- 01 and 02: derive the records from koii-coach-v2, and mirror them back ----------
const POS={'first-beat':['step','finished'],song:['song','songFinished']};
const tagOf=(slug,pos,fin)=>SPA[slug][pos]+(fin?':done':'');
const NOTICE='Your place in this chapter was carried over from the old version of the coach, which counted every step before your place as done. Untick any step you skipped.';
function derive(slug){
  if(!obj(V2))return;
  const s=v2(),[pk,fk]=POS[slug],pos=s[pk],fin=s[fk],tag=tagOf(slug,pos,fin);
  const r=read(CH+slug),valid=Boolean(r&&r.v===1&&Array.isArray(r.done));
  if(valid&&r.derivedFrom===tag)return;
  if(!valid&&pos===0&&!fin)return;   // nothing to carry over yet
  if(valid&&pos===0&&!fin){r.derivedFrom=tag;write(CH+slug,r);return;}   // a fresh koii-coach-v2 (a loaded file without one): keep cur
  const order=ORDER[slug],id=SPA[slug][pos],i=order.indexOf(id);
  const rec=valid?r:{v:1,done:[],last:null};
  const before=fin?order:order.slice(0,Math.max(0,i));
  const added=before.filter(x=>!rec.done.includes(x));
  rec.done=[...rec.done,...added];
  rec.n=rec.done.filter(x=>order.includes(x)).length;
  if(added.length)rec.last=added[added.length-1];
  if(typeof rec.last!=='string')rec.last=null;
  rec.cur=fin?null:id;
  const a=meta().appAt;
  if(a&&typeof a==='object'&&typeof a[slug]==='string'&&!(typeof rec.at==='string'&&Date.parse(rec.at)>=Date.parse(a[slug])))rec.at=a[slug];
  rec.derivedFrom=tag;
  if(!write(CH+slug,rec))return;
  if(added.length){
    const m=meta(),list=Array.isArray(m.notices)?m.notices:[];
    if(!list.some(n=>n&&n.chapter===slug))patch(META,{notices:[...list,{chapter:slug,text:NOTICE}]});
  }
}
// rec is the chapter's record as chapter.js is about to save it. Writes its position into koii-coach-v2 and notes it
// in rec.derivedFrom, so the next page load does not derive it again from its own write.
function mirror(slug,rec){
  if(!ORDER[slug]||!rec||!Array.isArray(rec.done))return;
  // After the clean-up the record only notes the position koii-coach-v2 holds, so it is derived again only if an
  // older copy of the site moves it.
  if(cleaned()){const s=v2(),[pk,fk]=POS[slug];rec.derivedFrom=tagOf(slug,s[pk],s[fk]);return;}
  const order=ORDER[slug],spa=SPA[slug],done=new Set(rec.done),fin=spa.every(id=>done.has(id));
  let pos=0,k=typeof rec.cur==='string'?order.indexOf(rec.cur):-1;
  if(k>=0){while(k>=0&&!spa.includes(order[k]))k--;pos=k>=0?spa.indexOf(order[k]):0;}
  else if(fin)pos=spa.length-1;
  const [pk,fk]=POS[slug],s=v2();
  if(s[pk]!==pos||s[fk]!==fin||!obj(V2))writeV2({[pk]:pos,[fk]:fin});
  rec.derivedFrom=tagOf(slug,pos,fin);
}

// ---------- Every chapter's progress, as Home, the menu and Settings show it ----------
const when=t=>{const d=Date.parse(t);return Number.isFinite(d)?d:0;};
function chapters(){
  const site=window.COACH_SITE;
  return (site&&Array.isArray(site.chapters)?site.chapters:[]).map(c=>{
    let n=c.steps||0,x=0,cur='',t=0;const r=obj(CH+c.slug);
    if(r&&Array.isArray(r.done)){
      x=int(r.n)?r.n:r.done.length;if(typeof r.cur==='string'&&/^[a-z0-9-]+$/i.test(r.cur))cur=r.cur;t=when(r.at);
      if(Array.isArray(r.skip))n-=new Set(r.skip.filter(id=>typeof id==='string'&&!r.done.includes(id))).size;
    }
    else if(c.legacy){const o=read(c.legacy);if(Array.isArray(o))x=o.length;}
    x=Math.max(0,Math.min(n,x));
    return{c,n,x,done:n>0&&x>=n,at:t,cur,href:c.href+(cur?'#s-'+cur:'')};
  });
}
// Continue: 00 while set-up is not 'ready'; else the unfinished chapter that moved last ("at"); else meta.lastChapter;
// else the first chapter with progress; else the next one not started. null when every chapter is done.
function continueTarget(all){
  all=all||chapters();
  const open=all.filter(p=>!p.done),setup=open.find(p=>p.c.slug==='setup'),last=meta().lastChapter;
  if(!open.length)return null;
  if(setup&&prefs().setup!=='ready')return setup;
  return open.filter(p=>p.at).sort((a,b)=>b.at-a.at)[0]||(last&&open.find(p=>p.c.slug===last))||open.find(p=>p.x>0)||open.find(p=>p!==setup)||open[0];
}
// First run is defined by what the learner has done, never by which keys exist (plan 5.1).
const firstRun=()=>!prefs().setup&&!v2Progress()&&!v2().done.length&&!chapters().some(p=>p.x>0);
// Learners who already have progress are never sent back to Chapter 0. Ticks in Chapter 0 alone do not count.
function migrateSetup(){
  if(prefs().setup||!(v2Progress()||chapters().some(p=>p.c.slug!=='setup'&&p.x>0)))return false;
  patch(PREFS,{setup:'ready'});patch(META,{setupReason:'existing-progress'});
  return true;
}

// ---------- Progress file and Reset (Settings) ----------
function keys(){const ks=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(ours(k))ks.push(k);}}catch(e){}return ks;}
const exportFile=()=>{const data={};keys().forEach(k=>{data[k]=localStorage.getItem(k);});return{app:'koii-coach',version:1,exported:new Date().toISOString(),data};};
// Kept storage is not cleared after a break without a visit (Safari) or when space runs low. The browser decides.
const persist=()=>{try{navigator.storage.persist().catch(()=>{});}catch(e){}};
function saveFile(){
  persist();
  const file=exportFile(),a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(file,null,1)],{type:'application/json'}));
  a.download=`koii-coach-progress-${file.exported.slice(0,10)}.json`;
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);
}
// The keys of a progress file that this app can load: ours, and each one valid JSON. Empty when it is not a progress file.
function readFile(j){
  const src=j&&j.app==='koii-coach'&&j.data&&typeof j.data==='object'?j.data:{};
  const out={};
  Object.keys(src).forEach(k=>{if(!ours(k)||typeof src[k]!=='string')return;try{JSON.parse(src[k]);out[k]=src[k];}catch(e){}});
  return out;
}
// Replaces the progress here with the file's. This browser's settings and OS choice stay; a file's settings are used
// only when this browser has none.
function applyFile(data){
  const fw=v2().firmware,had=localStorage.getItem(PREFS)!==null;
  keys().filter(k=>k!==PREFS).forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
  Object.keys(data).filter(k=>k!==PREFS||!had).forEach(k=>{try{localStorage.setItem(k,data[k]);}catch(e){}});
  writeV2({firmware:fw});
  run();
}
// Clears every progress key, keeping the settings and the OS choice. Returns what it removed, for Undo.
function resetAll(){
  const fw=v2().firmware,snap={};
  keys().filter(k=>k!==PREFS).forEach(k=>{snap[k]=localStorage.getItem(k);try{localStorage.removeItem(k);}catch(e){}});
  const s=fresh();s.firmware=fw;s.stepId=SPA['first-beat'][0];s.songId=SPA.song[0];write(V2,s);
  return snap;
}
function restore(snap){
  keys().filter(k=>k!==PREFS).forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
  Object.keys(snap||{}).forEach(k=>{try{localStorage.setItem(k,snap[k]);}catch(e){}});
}

// ---------- Steps split in a rewrite (plan 7.7, P7) ----------
// When a long step is split, its first part keeps the old id (so links and ticks still find it) and the other parts get
// new ids. A learner who had ticked the old step has every part ticked. Each batch is applied to a record once: the
// record's m holds the last batch applied, and a record made after a batch starts at that batch (chapter.js), so a
// tick on the first part later never ticks the rest. A chapter's batches are applied in v order, whatever their order
// here. Frozen history: add batches with the next v, never edit one that shipped.
const MIGRATIONS={
  // 2026.10.14.12: rewritten to the step budget
  song:[{v:1,split:{'song-find-beat':['song-find-beat','song-select-beat','song-check-beat'],'song-intro-remove-bass':['song-intro-remove-bass','song-intro-erase-bass'],'song-melody-sound':['song-melody-sound','song-melody-load'],'song-list-open':['song-list-open','song-position-1'],'song-list-first-half':['song-list-first-half','song-list-3-6'],'song-reverb':['song-reverb','song-reverb-a','song-reverb-c'],'song-recap':['song-recap','song-recap-change']}}],
  // 2026.10.14.11: rewritten to the step budget
  'first-beat':[{v:1,split:{'beat-empty-project':['beat-empty-project','beat-open-project-6','beat-check-empty'],'beat-tempo-grid':['beat-tempo-grid','beat-grid-16'],'beat-load-kick':['beat-load-kick','beat-hear-kick'],'beat-balance':['beat-balance','beat-balance-levels'],'beat-commit-drums':['beat-commit-drums','beat-commit-copy'],'beat-bass-sound':['beat-bass-sound','beat-bass-load'],'beat-bass-trim':['beat-bass-trim','beat-bass-trim-y'],'beat-reverb':['beat-reverb','beat-reverb-send'],'beat-performance':['beat-performance','beat-perform-start','beat-perform'],'beat-live-practice':['beat-live-practice','beat-live-play-along'],'beat-live-record':['beat-live-record','beat-live-record-tap','beat-live-record-stop'],'beat-live-undo':['beat-live-undo','beat-live-erase-note','beat-live-beat-clean'],'beat-recap':['beat-recap','beat-recap-try']}}],
  // 2026.10.14.10: rewritten to the step budget
  setup:[{v:1,split:{'listen-headphones':['listen-headphones','listen-headphones-volume'],'screen-shift-combo':['screen-shift-combo','screen-shift-minus'],'screen-icons':['screen-icons','screen-icon-table'],'update-connect':['update-connect','update-allow-midi'],'backup-check-file':['backup-check-file','backup-second-copy'],'project-factory-sounds':['project-factory-sounds','project-factory-pads'],'project-empty-six':['project-empty-six','project-empty-six-check'],'project-write-down':['project-write-down','project-write-course'],'library-scratch-project':['library-scratch-project','library-select-pad-1'],'library-browse-kicks':['library-browse-kicks','library-jump-ten'],'library-jump-categories':['library-jump-categories','library-other-categories'],'library-mini-kit':['library-mini-kit','mini-kit-snare-hat','mini-kit-play'],'settings-menu-metronome':['settings-menu-metronome','settings-metronome-on'],'settings-hear-click':['settings-hear-click','settings-click-play'],'settings-code-401':['settings-code-401','settings-401-check'],'ready-empty-project':['ready-empty-project','ready-silence']}},
         // 2026.10.14.21: a recap step after the chapter's last step
         {v:2,split:{'ready-open-first-beat':['ready-open-first-beat','setup-recap']}}],
  // 2026.10.14.9: rewritten to the step budget
  'vocal-house':[{v:1,split:{'choose-project-to-use':['choose-project-to-use','backup-reused-project','open-chosen-project'],'set-timing-16':['set-timing-16','set-quantize'],'check-or-clear-patterns':['check-or-clear-patterns','clear-old-patterns','empty-d-pads'],'prepare-paper':['prepare-paper','paper-scenes'],'choose-vocal-source':['choose-vocal-source','choose-vocal-input'],'set-vocal-level':['set-vocal-level','vocal-threshold'],'record-v1-d1':['record-v1-d1','record-v1-listen'],'record-v2-to-v5':['record-v2-to-v5','record-v2-v5-check'],'upload-files-by-number':['upload-files-by-number','load-files-by-number'],'vocals-already-on-pads':['vocals-already-on-pads','read-vocal-numbers','load-vocals-here','copy-vocal-in-project'],'trim-v1-start':['trim-v1-start','trim-v1-start-x'],'oneshot-vocals':['oneshot-vocals','oneshot-d2-d5'],'choose-clap-and-hat':['choose-clap-and-hat','choose-hat'],'choose-bass-b1':['choose-bass-b1','bass-level'],'write-first-kick':['write-first-kick','write-first-kick-a1'],'optional-sidechain':['optional-sidechain','sidechain-route','sidechain-shape'],'add-voice-reverb-d':['add-voice-reverb-d','voice-reverb-set'],'commit-drop-a-v2':['commit-drop-a-v2','name-drop-b'],'break-add-voice':['break-add-voice','break-listen'],'build-live-kick':['build-live-kick','build-live-kick-play'],'open-song-list':['open-song-list','song-position-1'],'song-positions-2-12':['song-positions-2-12','song-positions-2-12-set']}},
                 // 2026.10.14.21: a recap step after the chapter's last step (filed under song until 2026.10.15.3)
                 {v:2,split:{'backup-and-rights':['backup-and-rights','vocal-recap']}}],
  // 2026.10.14.8: rewritten to the step budget
  'tech-house':[{v:1,split:{'set-timing-16':['set-timing-16','set-quantize'],'choose-kick':['choose-kick','choose-kick-browse'],'choose-clap-and-hat':['choose-clap-and-hat','choose-hat','hat-level'],'choose-percussion':['choose-percussion','choose-rim-shaker','choose-tom'],'choose-bass-copy-b2':['choose-bass-copy-b2','bass-level','copy-bass-b2'],'write-kicks':['write-kicks','write-kicks-four'],'double-drums-four-bars':['double-drums-four-bars','double-drums-again'],'add-rim':['add-rim','rim-level'],'live-tom-fill':['live-tom-fill','live-tom-fill-play','live-tom-fill-stop'],'optional-shaker-push':['optional-shaker-push','optional-shaker-push-move'],'sidechain-kick-to-bass':['sidechain-kick-to-bass','sidechain-route','sidechain-shape'],'commit-groove':['commit-groove','name-drop-a'],'choose-vocal-source':['choose-vocal-source','choose-vocal-input','vocal-input-level','vocal-threshold'],'record-vocal-hook':['record-vocal-hook','record-vocal-listen'],'trim-vocal-hook':['trim-vocal-hook','trim-vocal-open','trim-vocal-start','trim-vocal-end'],'oneshot-vocal-hook':['oneshot-vocal-hook','vocal-hook-level'],'make-c-four-bars':['make-c-four-bars','c-four-bars'],'name-drop-a-commit':['name-drop-a-commit','name-drop-b'],'add-synth-answer':['add-synth-answer','synth-answer-sound','synth-answer-write'],'outro-from-groove':['outro-from-groove','outro-clear'],'intro-from-outro':['intro-from-outro','intro-clear-bass'],'build-from-drop-a':['build-from-drop-a','build-clear'],'break-from-build':['break-from-build','break-clear'],'peak-from-drop-b':['peak-from-drop-b','peak-last-kick'],'add-vocal-reverb':['add-vocal-reverb','vocal-reverb-fx'],'optional-riser-sound':['optional-riser-sound','riser-paste','riser-reverse'],'optional-riser-place':['optional-riser-place','riser-write'],'open-song-list':['open-song-list','song-position-1'],'song-positions-1-12':['song-positions-1-12','song-positions-2-12'],'first-fix-levels':['first-fix-levels','levels-bass-vocal'],'second-fix-low-end':['second-fix-low-end','low-end-duck','low-end-balance'],'record-full-pass':['record-full-pass','record-full-pass-take'],'write-down-scenes':['write-down-scenes','backup-project'],'optional-manual-performance':['optional-manual-performance','manual-next-scenes','manual-instant-again']}},
                // 2026.10.14.21: a recap step after the chapter's last step
                {v:2,split:{'finished-check':['finished-check','tech-house-recap']}}],
  // 2026.10.14.7: rewritten to the step budget
  hiphop:[{v:1,split:{'choose-fresh-project':['choose-fresh-project','check-fresh-project'],'load-drum-kit':['load-drum-kit','load-drum-kit-snare-hat','load-drum-kit-level'],'set-tempo-grid-90':['set-tempo-grid-90','set-grid-16-quantize'],'write-kicks':['write-kicks','write-kicks-four'],'live-snare-count-in':['live-snare-count-in','live-snare-arm','live-snare-play'],'write-bass-pulses':['write-bass-pulses','write-bass-pulses-play'],'optional-lazy-snare':['optional-lazy-snare','optional-lazy-snare-shift'],'name-verse-commit-hook':['name-verse-commit-hook','name-hook'],'choose-main-phrase':['choose-main-phrase','note-phrase'],'set-input-and-level':['set-input-and-level','set-input','set-threshold'],'sample-main-phrase':['sample-main-phrase','sample-phrase-record','sample-phrase-listen'],'copy-phrase-to-c2':['copy-phrase-to-c2','copy-phrase-paste'],'trim-phrase-start':['trim-phrase-start','trim-phrase-start-x'],'trim-answer-word':['trim-answer-word','trim-answer-xy'],'oneshot-phrase-answer':['oneshot-phrase-answer','oneshot-c1','vocal-volume'],'place-answer':['place-answer','place-answer-beat','place-answer-write'],'tune-bass-to-voice':['tune-bass-to-voice','tune-bass'],'swap-or-drop-hook-bass':['swap-or-drop-hook-bass','drop-hook-bass'],'balance-parts':['balance-parts','balance-vocal','balance-bass'],'check-hook-and-verse':['check-hook-and-verse','check-verse'],'make-intro-scene-v2':['make-intro-scene-v2','intro-clear-bass'],'check-intro-main-hook':['check-intro-main-hook','check-verse-hook-kept'],'break-rebuild-hats':['break-rebuild-hats','break-hats-write'],'copy-phrase-to-d1':['copy-phrase-to-d1','copy-phrase-d1-paste'],'trim-repeat-word':['trim-repeat-word','trim-repeat-xy','trim-repeat-level'],'optional-reverse-word':['optional-reverse-word','optional-reverse-word-rev'],'place-repeat-word':['place-repeat-word','place-repeat-write'],'make-end-scene-v2':['make-end-scene-v2','end-kicks'],'check-twist-and-end':['check-twist-and-end','check-end'],'lengthen-intro-and-end':['lengthen-intro-and-end','lengthen-intro','lengthen-end'],'open-song-list':['open-song-list','song-position-1'],'enter-six-song-positions':['enter-six-song-positions','song-positions-rest'],'final-listen-balance':['final-listen-balance','final-balance'],'optional-effects':['optional-effects','optional-reverb'],'optional-live-performance':['optional-live-performance','live-start-intro','live-next-scenes','live-instant-again'],'record-performance':['record-performance','record-song'],'write-down-scenes':['write-down-scenes','backup-project']}},
          // 2026.10.14.21: a recap step after the chapter's last step
          {v:2,split:{'final-song-check':['final-song-check','hiphop-recap']}}],
  // 2026.10.14.6: rewritten to the step budget
  perform:[{v:1,split:{'live-copy':['live-copy','live-copy-listen'],'live-velocity':['live-velocity','live-velocity-try'],'live-metronome':['live-metronome','live-metronome-volume'],'live-practise':['live-practise','live-practise-ghost'],'live-record':['live-record','live-record-take'],'live-fix':['live-fix','live-fix-velocity'],'live-free-time':['live-free-time','live-free-time-record'],'live-swing':['live-swing','live-swing-clear','live-swing-record'],'live-restore':['live-restore','live-restore-metronome'],'keys-copy':['keys-copy','keys-copy-listen','keys-copy-clear'],'keys-key-scale':['keys-key-scale','keys-scale','keys-scale-play'],'keys-practise':['keys-practise','keys-practise-line'],'repeat-try':['repeat-try','repeat-try-hold'],'repeat-record':['repeat-record','repeat-record-take'],'repeat-roll':['repeat-roll','repeat-roll-record','repeat-roll-stop','repeat-roll-reset'],'repeat-latch':['repeat-latch','repeat-latch-on','repeat-latch-off'],'arp-sound':['arp-sound','arp-sound-load','arp-sound-page','arp-sound-mode'],'arp-play':['arp-play','arp-play-hold'],'repeat-clean':['repeat-clean','repeat-clean-keys'],'fx-assign-pitch':['fx-assign-pitch','fx-assign-pitch-set','fx-assign-pitch-normal'],'fx-record-move':['fx-record-move','fx-record-move-blink'],'fx-reset-fader':['fx-reset-fader','fx-reset-fader-level'],'pad-load-layer':['pad-load-layer','pad-load-layer-sound','pad-load-layer-level'],'pad-copy-paste':['pad-copy-paste','pad-copy-paste-check'],'pad-shift-layer':['pad-shift-layer','pad-shift-layer-play'],'pad-nudge-snare':['pad-nudge-snare','pad-nudge-snare-move'],'scene-switch-early':['scene-switch-early','scene-switch-next'],'scene-erase':['scene-erase','scene-erase-clear','scene-erase-delete'],'scene-lock':['scene-lock','scene-lock-off'],'song-assign':['song-assign','song-assign-break2'],'song-loop':['song-loop','song-loop-rehearse','song-loop-off'],'song-move':['song-move','song-move-insert'],'rec-usb':['rec-usb','rec-usb-input'],'rec-take':['rec-take','rec-take-stop']}},
           // 2026.10.14.18: Open timing correct split from moving the A4 layer
           {v:2,split:{'pad-shift-layer':['pad-shift-layer','pad-shift-layer-hold']}},
           // 2026.10.14.21: a recap step after the chapter's last step
           {v:3,split:{'rec-take-stop':['rec-take-stop','perform-recap']}},
           // 2026.10.14.25: Copy BEAT as ROLL split from clearing its hats (the risk tag only on the clear)
           {v:4,split:{'repeat-copy':['repeat-copy','repeat-clear-hats']}}],
  // 2026.10.14.5: Chapter 3 rewritten to the step budget
  sampling:[{v:1,split:{'open-empty-project':['open-empty-project','check-empty-project'],'set-tempo-grid':['set-tempo-grid','set-grid-16'],'place-first-sample':['place-first-sample','place-first-sample-play'],'shape-kit':['shape-kit','shape-kit-hat'],'place-kit-kicks':['place-kit-kicks','place-kit-kicks-write'],'commit-voice-kit':['commit-voice-kit','commit-voice-kit-copy'],'handsfree-count':['handsfree-count','handsfree-count-start','handsfree-count-record'],'line-connect':['line-connect','line-connect-volume'],'line-handsfree-record':['line-handsfree-record','line-select-input','line-record-d3'],'usb-connect':['usb-connect','usb-connect-output'],'usb-handsfree-record':['usb-handsfree-record','usb-record-d3'],'quality-record-hi':['quality-record-hi','quality-record-hi-keys'],'edit-open':['edit-open','edit-open-pages'],'edit-trim':['edit-trim','edit-trim-length'],'copy-snare-pad':['copy-snare-pad','copy-snare-paste'],'reverse-copy':['reverse-copy','reverse-copy-rev'],'crop-optional':['crop-optional','crop-optional-crop'],'chop-write-pattern':['chop-write-pattern','chop-write-slices'],'resample-source':['resample-source','resample-source-rsp'],'bounce-scene':['bounce-scene','bounce-scene-empty'],'fx-setup':['fx-setup','fx-setup-shape'],'fx-resample':['fx-resample','fx-resample-record','fx-resample-listen','fx-resample-dry'],'stretch-bar-mode':['stretch-bar-mode','stretch-bar-length'],'stretch-check':['stretch-check','stretch-check-90'],'tempo-match-optional':['tempo-match-optional','tempo-match-play'],'loop-optional':['loop-optional','loop-optional-move','loop-optional-leave']}},
            // 2026.10.14.21: a recap step after the chapter's last step
            {v:2,split:{'keep-samples':['keep-samples','sampling-recap']}}]
};
const level=slug=>(MIGRATIONS[slug]||[]).reduce((a,b)=>Math.max(a,b.v),0);
function migrateRecord(slug,rec){
  const list=MIGRATIONS[slug];
  if(!list||!rec||!Array.isArray(rec.done))return false;
  const from=int(rec.m)?rec.m:0;let changed=false;
  list.filter(b=>b.v>from).sort((a,b)=>a.v-b.v).forEach(b=>{   // in v order, so m ends at the newest and a later split of a part applies after the split that made it
    Object.keys(b.split||{}).forEach(old=>{
      if(!rec.done.includes(old))return;
      const add=b.split[old].filter(id=>!rec.done.includes(id));
      if(!add.length)return;
      rec.done=[...rec.done,...add];
      if(int(rec.n))rec.n+=add.length;
    });
    rec.m=b.v;changed=true;
  });
  return changed;
}
function migrateAll(){
  const site=window.COACH_SITE;
  (site&&Array.isArray(site.chapters)?site.chapters:[]).forEach(c=>{const r=obj(CH+c.slug);if(r&&migrateRecord(c.slug,r))write(CH+c.slug,r);});
}

// ---------- The clean-up (plan 8.6), 8 weeks after this browser first ran this file ----------
const WINDOW=56*864e5;
function since(){
  const t=when(meta().since);if(t)return t;
  patch(META,{since:new Date().toISOString()});return Date.now();
}
let start=0;
const cleaned=()=>Date.now()-(start||(start=since()))>=WINDOW;
function cleanup(){
  if(!cleaned())return;
  Object.keys(LEGACY_OF).forEach(slug=>{
    const r=obj(CH+slug);
    if(r&&r.v===1&&Array.isArray(r.done))LEGACY_OF[slug].forEach(k=>{try{if(localStorage.getItem(k)!==null)localStorage.removeItem(k);}catch(e){}});
  });
}

function run(){start=0;derive('first-beat');derive('song');migrateAll();cleanup();return migrateSetup();}
const migratedSetup=run();

window.CoachProgress={v2,writeV2,prefs,meta,patch,chapters,continueTarget,v2Progress,firstRun,migratedSetup,mirror,order:slug=>(ORDER[slug]||[]).slice(),migrateRecord,level,
  exportFile,readFile,applyFile,resetAll,restore,keys,saveFile,persist};
})();
