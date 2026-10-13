'use strict';
/* Site-wide search. shell.js loads this file the first time someone opens the Search overlay, so nothing here runs on
   page load. shell.js builds the overlay's frame (<dialog id="site-search-dialog"> with #site-search, the type chips
   [data-type] and #site-results) so the phone keyboard can open inside the tap; mount() below takes it over.

   The index is built in the browser, once per page load, from what the site already holds:
     course.js globals   steps of 01 and 02, Learn lessons, help topics, controls, glossary. Pages that do not
                         have course.js get it here with a script tag (index.html already has it).
     chapter pages       fetch()ed (they are precached, so this works offline) and read with DOMParser: every
                         .steps ol > li[data-step] and every section heading.
   Chapter steps have no title yet, so their id stands in for one: "record-first-sample" shows as "Record first sample".
   A source that fails to load is skipped, and tried again the next time the overlay opens.

   Where a result goes:
     chapter step         <page>.html#s-<step id>      (chapter.js opens that section, scrolls to the step and marks it)
     chapter section      <page>.html#s-<its first step id>
     01 and 02 steps      ./index.html#first/<step id>, ./index.html#song/<step id>
     Learn lesson         ./index.html#manual/<lesson id>   (lessonIds as in index.html: the explicit id, else slug(title))
     help topic           ./index.html#help/<topic id>      (an explicit help[i][3].id, else slug(title) with - and + spelled out,
                                                            as topicIds in index.html)
     control              ./index.html#controls
     glossary word        no link: the definition is shown in the result itself
   slug(), lessonId() and topicId() below must stay the same as in index.html, because the app routes these ids.

   Matching (docs/overhaul-plan.md 4.7): whole words, with a prefix match on the last one while it is being typed
   ("hat" finds "hats" and "hi-hat", never "that"); case and accents folded; plurals and -ing/-ed folded; a few synonyms;
   filler words like "the" and "my" ignored. Ranking: the query as the title, then title words, then key names (ERASE
   written as a button in the text), then the body. Results are grouped (Steps, Help, Learn, Words), the group with the
   best match first (Words second at most), so Enter opens the best link. Arrow keys move real focus through the field and the results. */
(()=>{
const site=window.COACH_SITE;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s==null?'':s).replace(/\s+/g,' ').trim();
const slug=t=>String(t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const HELP='<a href="./index.html#help">Help &amp; reference</a>';

// ---------- Words ----------
const fold=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const WORD=/\d+(?:\.\d+)+|[\p{L}\p{N}]+/gu;   // a position like 1.2.3 or a version like 2.5.1 is one word
const words=s=>fold(s).match(WORD)||[];
const STOP=new Set('a an and are as at be by do does for from how i if in is it its my of on or so the to was we what when where why with you your'.split(' '));
// Not a real stemmer, just enough that "hats", "chopping", "samples" and "sampling" meet their root. Query and text
// both go through it, so a wrong guess is wrong the same way on both sides.
function stem(w){
  if(!/^[a-z]+$/.test(w))return w;
  if(w.length>3){
    if(w.length>4&&w.endsWith('ies'))w=w.slice(0,-3)+'y';
    else if(/(?:ch|sh|ss|x|z)es$/.test(w))w=w.slice(0,-2);
    else if(w.endsWith('s')&&!/(?:ss|us|is)$/.test(w))w=w.slice(0,-1);
  }
  const m=w.length>4&&/(?:ing|ed)$/.exec(w),b=m?w.slice(0,-m[0].length):'';
  if(/[aeiouy]/.test(b))w=/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(b)?b+'e':b;   // timing -> time, saved -> save (but running -> run)
  if(w.length>2&&/([^aeiouylsz])\1$/.test(w))w=w.slice(0,-1);                // chopping -> chop
  return w.length>4&&w.endsWith('e')?w.slice(0,-1):w;                        // sample and sampling meet at "sampl"; note stays apart from "not"
}
// Any phrase in a group finds the others. Longest phrase first, so "hi hat" is read as one thing.
const SYNONYMS=[['hi hat','hihat','hat'],['sidechain','side chain','pump'],['hip hop','hiphop'],['vocal','voice'],['bpm','tempo']]
  .map(g=>g.map(p=>{const raws=words(p);return{raws,stems:raws.map(stem)};}).sort((a,b)=>b.raws.length-a.raws.length));
const at=(hay,needle)=>{for(let i=0;i+needle.length<=hay.length;i++)if(needle.every((x,j)=>hay[i+j]===x))return i;return -1;};

// A query is a list of alternatives (the words as typed, then each synonym swap); a result needs all the words of one.
function parse(q){
  let raws=words(q).slice(0,8);   // a pasted paragraph is not a query
  const kept=raws.filter(w=>!STOP.has(w));
  if(kept.length)raws=kept;
  if(!raws.length)return null;
  const alts=[{raws,stems:raws.map(stem),weight:1}];
  for(const group of SYNONYMS)for(const a of [...alts]){
    const p=group.find(x=>at(a.stems,x.stems)>=0);
    if(!p)continue;
    const i=at(a.stems,p.stems);
    for(const o of group)if(o!==p){
      const r=[...a.raws.slice(0,i),...o.raws,...a.raws.slice(i+p.raws.length)],s=r.map(stem);
      if(!alts.some(x=>x.stems.join(' ')===s.join(' ')))alts.push({raws:r,stems:s,weight:.8});
    }
  }
  return alts;
}

// ---------- Documents ----------
// Hardware names written in capitals in the text ("hold ERASE", "tap A1") are the "key names" a query can hit.
const KEYS=/\b(?:MAIN|SOUND|TEMPO|TIMING|SAMPLE|KEYS|FX|FADER|SHIFT|ERASE|RECORD|PLAY|ENTER|[A-D][1-9])\b/g;
function doc(o){
  const t=words(o.title),b=words(o.body||''),keys=new Set((o.keys||[]).map(k=>k.toLowerCase()));
  for(const k of (o.title+' '+(o.body||'')).match(KEYS)||[])keys.add(k.toLowerCase());
  return Object.assign(o,{tRaw:t,tStem:t.map(stem),bRaw:b,bStem:b.map(stem),keys});
}
// A step's id as a title. Ids end in -v2 or -v3 when a step was rewritten (but "record-v2-to-v5" is vocals 2 to 5), name
// pads and groups as c2 or d, and abbreviate a few words.
const SAY={sc:'sidechain',rec:'record',arp:'arpeggio',fx:'FX',usb:'USB',bpm:'BPM',os:'OS'};
const label=id=>{
  const t=id.replace(/(-to)?-v\d+$/,(m,to)=>to?m:'').split('-').map(w=>SAY[w]||(/^(?:[a-d]|[a-z]\d)$/.test(w)?w.toUpperCase():w)).join(' ').replace(/\b(\d+) (\d+)\b/,'$1–$2');
  return t[0].toUpperCase()+t.slice(1);
};

function fromCourse(){
  const opt=s=>s&&s[7]&&typeof s[7]==='object'?s[7]:{};
  const chapter=v=>site.chapters.find(c=>c.view===v);
  const steps=(list,v)=>{const c=chapter(v);return list.map((s,i)=>doc({type:'step',title:s[0],body:clean(s.slice(1,5).join(' ')),crumb:[c.num+' '+c.title,`Step ${i+1} of ${list.length}`],href:'./index.html#'+v+(opt(s).id?'/'+opt(s).id:'')}));};
  const lessonId=(m,i)=>(m[4]&&typeof m[4]==='object'&&m[4].id)||slug(m[0])||'lesson-'+i;
  const topicId=h=>(h[3]&&typeof h[3]==='object'&&h[3].id)||slug(String(h[0]).replace(/−/g,' minus ').replace(/\+/g,' plus '));
  const cap={MINUS:'−',PLUS:'+'};
  /* global first, song, manual, help, controls, glossary */
  return{
    first:steps(first,'first'),
    song:steps(song,'song'),
    help:[
      ...help.map(h=>doc({type:'help',title:h[0],body:h[1],crumb:['Help','Troubleshooting'],href:'./index.html#help/'+topicId(h)})),
      ...Object.entries(controls).map(([k,c])=>doc({type:'help',title:c[0],body:c[1],cap:cap[k]||k,keys:[k],crumb:['Help','Controls'],href:'./index.html#controls'}))
    ],
    learn:manual.map((m,i)=>doc({type:'learn',title:m[0],body:clean(m[1]+' '+m[2]),crumb:['Learn',`Lesson ${i+1} of ${manual.length}`],href:'./index.html#manual/'+lessonId(m,i)})),
    word:glossary.map(g=>doc({type:'word',title:g[0],body:g[1],crumb:['Words'],href:''}))
  };
}
function loadCourse(){
  const build=()=>{try{return fromCourse();}catch(e){return null;}};
  if(typeof first!=='undefined')return Promise.resolve(build());
  return new Promise(done=>{
    const s=document.createElement('script');
    s.src='./course.js';
    s.onload=()=>done(build());
    s.onerror=()=>{s.remove();done(null);};
    document.head.append(s);
  });
}
async function loadChapter(c){
  try{
    const res=await fetch(c.href,{signal:AbortSignal.timeout?AbortSignal.timeout(10000):undefined});
    if(!res.ok)return null;
    const dom=new DOMParser().parseFromString(await res.text(),'text/html');
    dom.querySelectorAll('br,p,li,div,td,th,h2,h3,summary').forEach(n=>n.after(' '));   // so neighbouring words do not run together
    const book=c.num+' '+c.title,out=[];
    let n=0;   // step numbers run through the whole chapter, as chapter.js numbers the lists
    dom.querySelectorAll('.steps details').forEach(d=>{
      const head=clean(d.querySelector('summary')&&d.querySelector('summary').textContent),m=/^(\d+)\s*\/\s*(.*)$/.exec(head),no=m?m[1]:'',name=m?m[2]:head;
      const lis=[...d.querySelectorAll('ol>li')],ids=lis.map(li=>li.dataset.step).filter(Boolean);
      const intro=[...d.children].filter(e=>e.tagName!=='SUMMARY'&&e.tagName!=='OL'&&!/^\s*Official guide/.test(e.textContent)).map(e=>e.textContent).join(' ');
      out.push(doc({type:'step',title:name,body:clean(intro),crumb:[book,no?'Section '+no:'Section'],href:c.href+(ids[0]?'#s-'+ids[0]:'')}));
      lis.forEach(li=>{
        n++;
        const id=li.dataset.step;
        if(id)out.push(doc({type:'step',title:label(id),body:clean(li.textContent),crumb:[book,[no,name].filter(Boolean).join(' '),'Step '+n],href:c.href+'#s-'+id}));
      });
    });
    return out;
  }catch(e){return null;}
}

// ---------- The index ----------
const parts=new Map();   // 'course' or a chapter's slug -> its documents, once that source has loaded
let all=[],missing=0,ready=false,building=null,view=null;
function assemble(){
  const course=parts.get('course');
  all=[];
  site.chapters.forEach(c=>{
    if(c.slug)all.push(...(parts.get(c.slug)||[]));
    else if(course&&course[c.view])all.push(...course[c.view]);   // the views of 01 and 02
  });
  if(course)all.push(...course.help,...course.learn,...course.word);
  missing=1+site.chapters.filter(c=>c.slug).length-parts.size;
}
function fill(){
  if(building)return building;
  const jobs=[];
  if(!parts.has('course'))jobs.push(loadCourse().then(d=>{if(d)parts.set('course',d);}));
  site.chapters.forEach(c=>{if(c.slug&&!parts.has(c.slug))jobs.push(loadChapter(c).then(d=>{if(d)parts.set(c.slug,d);}));});
  building=Promise.all(jobs).then(()=>{building=null;ready=true;assemble();});
  return building;
}

// ---------- Matching ----------
const W={title:30,key:20,body:8,titlePhrase:40,bodyPhrase:10,exactTitle:60};
function hasWord(stems,raws,qs,qr,typing){
  if(!typing)return stems.includes(qs);
  return stems.some((s,i)=>s.startsWith(qs)||raws[i].startsWith(qr));
}
function phrase(hay,needle){   // the words in a row; the last may still be a prefix
  const n=needle.length;
  for(let i=0;i+n<=hay.length;i++){
    let j=0;
    while(j<n-1&&hay[i+j]===needle[j])j++;
    if(j===n-1&&hay[i+j].startsWith(needle[j]))return true;
  }
  return false;
}
function score(d,a){
  const n=a.stems.length;
  let s=0;
  for(let i=0;i<n;i++){
    const typing=i===n-1;
    if(hasWord(d.tStem,d.tRaw,a.stems[i],a.raws[i],typing))s+=W.title;
    else if(d.keys.has(a.raws[i]))s+=W.key;
    else if(hasWord(d.bStem,d.bRaw,a.stems[i],a.raws[i],typing))s+=W.body;
    else return 0;
  }
  if(d.tStem.length===n&&phrase(d.tStem,a.stems))s+=W.exactTitle;
  else if(n>1&&phrase(d.tStem,a.stems))s+=W.titlePhrase;
  if(n>1&&phrase(d.bStem,a.stems))s+=W.bodyPhrase;
  return s;
}
// Does this word of the displayed text count as a match? Used to mark it.
function matcher(a){
  const last=a.stems.length-1;
  return w=>{const f=fold(w),s=stem(f);return a.stems.some((q,i)=>i===last?s.startsWith(q)||f.startsWith(a.raws[i]):s===q);};
}

// ---------- Results ----------
function marked(text,m){
  let out='',from=0,open=false;   // matched words one hyphen or space apart share a mark: "hi-hat", "time stretch"
  for(const w of text.matchAll(WORD)){
    const gap=text.slice(from,w.index),hit=m(w[0]);
    if(open&&hit&&/^[-\s]$/.test(gap))out+=esc(gap+w[0]);
    else{
      if(open)out+='</mark>';
      out+=esc(gap)+(hit?'<mark>':'')+esc(w[0]);
      open=hit;
    }
    from=w.index+w[0].length;
  }
  return out+(open?'</mark>':'')+esc(text.slice(from));
}
// One line of the body around the first matched word. The stylesheet clips it to the width of the row, so the match
// starts early in the line.
function snippet(body,m){
  const hit=[...body.matchAll(WORD)].find(w=>m(w[0]));
  const from=hit&&hit.index>30?body.lastIndexOf(' ',hit.index-24)+1:0;
  let to=Math.min(body.length,from+150);
  if(to<body.length&&body.lastIndexOf(' ',to)>from)to=body.lastIndexOf(' ',to);
  return(from?'… ':'')+marked(body.slice(from,to),m)+(to<body.length?' …':'');
}
const GROUPS=[['step','Steps','steps'],['help','Help','help topics'],['learn','Learn','lessons'],['word','Words','words']];
const TRY=['silent pad','undo','chop','sidechain','song list'];
const CAP={step:5,help:4,learn:4,word:3},PAGE=30;   // rows per group under All (a glossary entry is several lines long), and per page of one group
const NEEDS=`<p class="search-note"><b>Search needs the offline copy.</b> Open the course once while online so every page is saved, then try again. ${HELP} has its own search.</p>`;

function mount(dlg,enter){   // enter: Enter was pressed before this file had loaded
  if(mount.done)return;
  mount.done=true;
  const input=dlg.querySelector('#site-search'),list=dlg.querySelector('#site-results'),status=dlg.querySelector('#site-search-status'),
    body=dlg.querySelector('.search-body'),chips=[...dlg.querySelectorAll('[data-type]')];
  let type='all',shown=PAGE,found={step:[],help:[],learn:[],word:[]},timer=0,openFirst=Boolean(enter);

  function run(){
    clearTimeout(timer);
    const alts=parse(input.value);
    found={step:[],help:[],learn:[],word:[]};
    if(alts&&ready){
      for(const d of all){
        let best=0,alt=null;
        for(const a of alts){const s=score(d,a)*a.weight;if(s>best){best=s;alt=a;}}
        if(best)found[d.type].push({d,s:best,alt});
      }
      GROUPS.forEach(([k])=>found[k].sort((x,y)=>y.s-x.s));
    }
    shown=PAGE;body.scrollTop=0;
    render();
  }
  function item(r){
    const {d,alt}=r,m=matcher(alt);
    const title=(d.cap?`<kbd class="key">${esc(d.cap)}</kbd> `:'')+marked(d.title,m);
    if(d.type==='word')return`<li class="search-word"><span class="search-hit-title">${title}</span><span class="search-hit-snip">${marked(d.body,m)}</span></li>`;
    return`<li><a class="search-hit" href="${esc(d.href)}"><span class="search-hit-title">${title}</span><span class="search-hit-crumb">${esc(d.crumb.join(' · '))}</span>${d.body?`<span class="search-hit-snip">${snippet(d.body,m)}</span>`:''}</a></li>`;
  }
  function render(){
    // The group holding the best match comes first (ties keep the order Steps, Help, Learn, Words).
    const best=k=>found[k].length?found[k][0].s:0;
    const q=clean(input.value),alts=parse(q),kinds=GROUPS.filter(([k])=>type==='all'||k===type).sort((a,b)=>best(b[0])-best(a[0]));
    // A glossary word has no link and runs to several lines, so on a phone it would push every step below the fold:
    // it never leads while another group has results, and comes straight after the best one instead.
    if(kinds.length>1&&kinds[0][0]==='word'&&found[kinds[1][0]].length)kinds.splice(1,0,kinds.shift());
    const total=kinds.reduce((n,[k])=>n+found[k].length,0);
    let html='',say='';
    if(!alts){
      html=`<div class="search-empty"><p class="meta">Search every step, help topic, lesson and word.</p><p class="eyebrow">Try</p><div class="search-try">${TRY.map(t=>`<button class="search-chip" type="button" data-try="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
    }else if(!ready){
      html='<p class="search-note">Preparing search…</p>';say='Preparing search';
    }else if(!all.length){
      html=NEEDS;say='Search needs the offline copy';
    }else{
      if(!total){
        const some=type==='all'?'':' in '+kinds[0][2];
        html=`<p class="search-note">Nothing found for “${esc(q)}”${some}. Try a shorter or different word${type==='all'?'':' or choose All'}, or look through ${HELP}.</p>`;
      }
      for(const [k,name,noun] of kinds){
        const hits=found[k];
        if(!hits.length)continue;
        const cap=type==='all'?CAP[k]:shown;
        html+=`<div class="search-group" role="group" aria-labelledby="site-group-${k}"><h2 class="search-group-title" id="site-group-${k}">${name} <span class="search-count">${hits.length}</span></h2><ul class="search-list">${hits.slice(0,cap).map(item).join('')}</ul>`+
          (hits.length>cap?`<button class="btn ghost" type="button" ${type==='all'?`data-all="${k}"`:'data-more'}>${type==='all'?`Show all ${hits.length} ${noun}`:'Show more'}</button>`:'')+'</div>';
      }
      if(missing)html+='<p class="search-note">Some pages could not be searched. Open the course once while online to save them.</p>';
      say=total?`${total} result${total===1?'':'s'}`:'No results';
    }
    list.innerHTML=html;
    status.textContent=say;
  }
  function setType(t){
    type=t;shown=PAGE;
    chips.forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.type===t)));
    body.scrollTop=0;
    render();
  }

  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,60);});
  chips.forEach(c=>c.addEventListener('click',()=>setType(c.dataset.type)));
  list.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(!b)return;
    if(b.dataset.try){input.value=b.dataset.try;run();input.focus();}
    else if(b.dataset.all){setType(b.dataset.all);const a=list.querySelector('a.search-hit');if(a)a.focus();}
    else if('more' in b.dataset){shown+=PAGE;render();}
  });
  // Arrow keys walk the field and the results (real focus, so the links keep their usual meaning for screen readers).
  dlg.addEventListener('keydown',e=>{
    if(e.isComposing)return;
    const t=e.target;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      const order=[input,...list.querySelectorAll('a.search-hit,button')],i=order.indexOf(t);
      const j=e.key==='ArrowDown'?(i<0?1:i+1):(i<0?0:i-1);
      if(order[j]&&j!==i){e.preventDefault();order[j].focus();}
    }else if(e.key==='Enter'&&t===input){
      e.preventDefault();
      if(!ready){openFirst=true;return;}   // still building the index: open the best match as soon as there is one
      run();
      const a=list.querySelector('a.search-hit');
      if(a)a.click();
    }else if(e.key==='Escape'&&t===input){
      e.preventDefault();dlg.querySelector('[data-close]').click();
    }else if((e.key||'').length===1&&e.key!==' '&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&t!==input){
      input.focus();   // typing while on a result or a chip goes back to the field
    }
  });

  function settle(){
    run();
    if(!openFirst)return;
    openFirst=false;
    const a=list.querySelector('a.search-hit');
    if(a)a.click();
  }
  view={run:settle,render};
  render();
  fill().then(settle);
}
// The overlay was opened again: try whatever failed to load last time.
function reopen(){
  if(!view)return;
  if(missing||!ready)fill().then(view.run);else view.render();
}
window.CoachSearch={mount,reopen};
})();
